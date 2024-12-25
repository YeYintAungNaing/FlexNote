"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const sqlite3 = require("sqlite3");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const icon = path.join(__dirname, "../../resources/icon.png");
const dbPath = path.join(electron.app.getPath("userData"), "notes.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to the database", err);
  } else {
    console.log("Connected to the database at", dbPath);
  }
});
db.run(
  `CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    content TEXT NOT NULL
  )`
);
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userName TEXT NOT NULL,
    password TEXT NOT NULL
  )`
);
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true
    }
  });
  mainWindow.webContents.openDevTools();
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.on("ping", () => console.log("pong"));
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("save-note", async (_, { token, noteName, content, userId }) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE id = ? and sessionToken = ?",
      [userId, token],
      (err, rows) => {
        if (err) {
          console.error("db error", err);
          return reject(err);
        }
        if (!rows) {
          return resolve({ message: "Invalid user" });
        }
        db.run(
          "INSERT INTO notes (name, content, userId) VALUES (?, ?, ?)",
          [noteName, content, userId],
          (err2) => {
            if (err2) {
              console.error("Failed to save note:", err2);
              return reject(err2);
            } else {
              return resolve({ message: "note has been saved" });
            }
          }
        );
      }
    );
  });
});
electron.ipcMain.handle("edit-note", async (_, { token, content, noteId, userId }) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE id = ? and sessionToken = ?",
      [userId, token],
      (err, rows) => {
        if (err) {
          console.error("db error", err);
          return reject(err);
        }
        if (!rows) {
          return resolve({ message: "Invalid user" });
        }
        db.run(
          "UPDATE notes SET content = ? WHERE id = ? AND userId = ?",
          [content, noteId, userId],
          (err2) => {
            if (err2) {
              console.error("Failed to edit note:", err2);
              return reject(err2);
            } else {
              return resolve({ message: "note has been edited" });
            }
          }
        );
      }
    );
  });
});
electron.ipcMain.handle("delete-note", async (_, token, noteId, userId) => {
  console.log("Received NoteId:", noteId, "UserId:", userId);
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE id = ? and sessionToken = ?",
      [userId, token],
      (err, rows) => {
        if (err) {
          console.error("db error", err);
          return reject(err);
        }
        if (!rows) {
          return resolve({ message: "Invalid user" });
        }
        db.run(
          "DELETE FROM notes WHERE id = ? AND userId = ?",
          [noteId, userId],
          (err2) => {
            if (err2) {
              console.error("Failed to delete note:", err2);
              return reject(err2);
            } else {
              return resolve({ message: "note has been deleted" });
            }
          }
        );
      }
    );
  });
});
electron.ipcMain.handle("fetch-notes", async (_, userId) => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM notes where userId = ?", [userId], (err, rows) => {
      if (err) {
        console.error("Failed to fetch notes:", err);
        return reject(err);
      } else {
        return resolve(rows);
      }
    });
  });
});
electron.ipcMain.handle("create-user", async (_, { userName, password }) => {
  return new Promise((resolve, reject) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    db.run(
      "INSERT INTO users (userName, password) VALUES (?, ?)",
      [userName, hashedPassword],
      (err) => {
        if (err) {
          console.error("faled to create user account", err);
          return reject(err);
        } else {
          return resolve({ message: `${userName} has be registerd` });
        }
      }
    );
  });
});
electron.ipcMain.handle("log-in", async (_, { userName, password }) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE userName = ?",
      [userName],
      (err, row) => {
        if (err) {
          console.error(err);
          return reject({ message: "Database error" });
        } else if (!row) {
          return resolve({ message: "User not found" });
        } else {
          const matchedPassword = bcrypt.compareSync(password, row.password);
          if (matchedPassword) {
            const sessionToken = crypto.randomBytes(32).toString("hex");
            db.run(
              "UPDATE users SET sessionToken = ? WHERE id = ?",
              [sessionToken, row.id],
              (err2) => {
                if (err2) {
                  return reject({ message: "failed to save session" });
                } else {
                  return resolve({
                    message: `Welcome ${row.userName} and your token is ${sessionToken}`,
                    user: row,
                    token: sessionToken
                  });
                }
              }
            );
          } else {
            return resolve({ message: "Incorrect password" });
          }
        }
      }
    );
  });
});
electron.ipcMain.handle("verify-token", async (_, token) => {
  return new Promise((resolve, reject) => {
    db.get("select * from users where sessionToken =?", [token], (err, row) => {
      if (err) {
        return reject({ message: "database errr" });
      } else if (!row) {
        return resolve({ message: "Not session" });
      } else {
        return resolve({ message: "session exists", currentUser: row });
      }
    });
  });
});
electron.ipcMain.handle("logout-user", async (_, userId) => {
  return new Promise((resolve, reject) => {
    db.run("UPDATE users set sessionToken = null where id = ?", [userId], (err) => {
      if (err) {
        return reject({ message: "database errr" });
      } else {
        return resolve({ message: `logout success` });
      }
    });
  });
});
