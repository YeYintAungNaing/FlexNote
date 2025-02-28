"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const sqlite3 = require("sqlite3");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const fs = require("fs");
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
db.run(
  `CREATE TABLE IF NOT EXISTS activityLogs (
    logId INTEGER PRIMARY KEY AUTOINCREMENT,
    logContent,
    userId,
    createdAt,
    logType
  )`
);
db.run(
  `CREATE TABLE IF NOT EXISTS drawingBoard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId,
    drawingData
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
          return resolve({ error: "Invalid user" });
        }
        db.get("SELECT * FROM notes where name = ?", [noteName], (err2, rows2) => {
          if (err2) {
            console.error("faled to create new note", err2);
            return reject(err2);
          } else if (rows2) {
            return resolve({ error: "note name is already taken" });
          }
          db.run(
            "INSERT INTO notes (name, content, userId) VALUES (?, ?, ?)",
            [noteName, content, userId],
            (err3) => {
              if (err3) {
                console.error("Failed to save note:", err3);
                return reject(err3);
              } else {
                return resolve({ message: "note has been saved" });
              }
            }
          );
        });
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
          return resolve({ error: "Invalid user" });
        }
        db.run(
          "UPDATE notes SET content = ? WHERE id = ? AND userId = ?",
          [content, noteId, userId],
          (err2) => {
            if (err2) {
              console.error("Failed to edit note:", err2);
              return reject(err2);
            } else {
              return resolve({ message: `note with id ${noteId} has been edited` });
            }
          }
        );
      }
    );
  });
});
electron.ipcMain.handle("edit-noteName", async (_, { token, noteName, noteId, userId }) => {
  return new Promise((resolve, reject) => {
    console.log(token, userId);
    db.get(
      "SELECT * FROM users WHERE id = ? and sessionToken = ?",
      [userId, token],
      (err, rows) => {
        if (err) {
          console.error("db error", err);
          return reject(err);
        }
        if (!rows) {
          return resolve({ error: "Invalid user" });
        }
        db.get("SELECT * FROM notes where name = ?", [noteName], (err2, rows2) => {
          if (err2) {
            console.error("faled to edit name", err2);
            return reject(err2);
          } else if (rows2) {
            return resolve({ error: "note name is already taken" });
          }
          db.run(
            "UPDATE notes SET name = ? WHERE id = ? AND userId = ?",
            [noteName, noteId, userId],
            (err3) => {
              if (err3) {
                console.error("Failed to edit note name:", err3);
                return reject(err3);
              } else {
                return resolve({ message: "note name has been edited" });
              }
            }
          );
        });
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
          return resolve({ error: "Invalid user" });
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
electron.ipcMain.handle("create-user", async (_, { userName, password, mode, timeStamp }) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users where userName = ?", [userName], (err, rows) => {
      if (err) {
        console.error("faled to create user account", err);
        return reject(err);
      } else if (rows) {
        return resolve({ error: "user name is already taken" });
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      db.run(
        "INSERT INTO users (userName, password, mode, createdAt) VALUES (?, ?, ?, ?)",
        [userName, hashedPassword, mode, timeStamp],
        (err2) => {
          if (err2) {
            console.error("faled to create user account_", err2);
            return reject(err2);
          } else {
            return resolve({ message: `${userName} has be registerd` });
          }
        }
      );
    });
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
          return resolve({ error: "User not found" });
        } else {
          const matchedPassword = bcrypt.compareSync(password, row.password);
          if (matchedPassword) {
            const sessionToken_ = crypto.randomBytes(32).toString("hex");
            db.run(
              "UPDATE users SET sessionToken = ? WHERE id = ?",
              [sessionToken_, row.id],
              (err2) => {
                if (err2) {
                  return reject({ message: "failed to save session" });
                } else {
                  const { password: password2, sessionToken, ...other } = row;
                  return resolve({
                    message: `Welcome ${row.userName}`,
                    user: other,
                    token: sessionToken_
                  });
                }
              }
            );
          } else {
            return resolve({ error: "Incorrect password" });
          }
        }
      }
    );
  });
});
electron.ipcMain.handle("edit-profile", async (_, { token, userName, email, location, gender, dName, userId }) => {
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
          return resolve({ error: "Invalid user" });
        }
        db.get("SELECT * FROM users where userName = ? AND id != ?", [userName], (err2, rows2) => {
          if (err2) {
            console.error("db error", err2);
            return reject(err2);
          } else if (rows2) {
            return resolve({ error: "user name is already taken" });
          }
          db.run(
            "UPDATE users SET userName = ?, email = ?, location = ?, gender = ?, dName = ? WHERE id = ?",
            [userName, email, location, gender, dName, userId],
            (err3) => {
              if (err3) {
                console.error("Failed to edit profile :", err3);
                return reject(err3);
              } else {
                return resolve({ message: "profile has been edited" });
              }
            }
          );
        });
      }
    );
  });
});
electron.ipcMain.handle("upload-img", (_, { token, userId, fileName, fileData }) => {
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
          return resolve({ error: "Invalid user" });
        }
        try {
          const uploadPath = path.join(electron.app.getPath("userData"), "images/profileImg");
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          const filePath = path.join(uploadPath, fileName);
          fs.writeFileSync(filePath, Buffer.from(fileData));
          db.run(
            "UPDATE users SET profileImgPath = ? WHERE id = ?",
            [filePath, userId],
            (err2) => {
              if (err2) {
                console.error("Failed to upload image :", err2);
                return reject(err2);
              } else {
                return resolve({ message: "Profile image has been saved" });
              }
            }
          );
        } catch (err2) {
          console.error("File upload error:", err2);
        }
      }
    );
  });
});
electron.ipcMain.handle("get-userImg", async (_, { token, userId, imagePath }) => {
  return new Promise((resolve, reject) => {
    console.log(userId, token);
    db.get(
      "SELECT * FROM users WHERE id = ? and sessionToken = ?",
      [userId, token],
      (err, rows) => {
        if (err) {
          console.error("db error", err);
          return reject(err);
        }
        if (!rows) {
          return resolve({ error: "Invalid user" });
        }
        try {
          const imageBuffer = fs.readFileSync(imagePath);
          return resolve(`data:image/png;base64,${imageBuffer.toString("base64")}`);
        } catch (e) {
          return reject(e);
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
        return resolve({ error: "Invalid session" });
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
electron.ipcMain.handle("create-log", async (_, { token, userId, logContent, createdAt, logType }) => {
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
          return resolve({ error: "Invaid user" });
        }
        db.run(
          "INSERT INTO activityLogs (logContent, userId, createdAt, logType) VALUES (?, ?, ?, ?) ",
          [logContent, userId, createdAt, logType],
          (err2) => {
            if (err2) {
              console.error("Failed to create log:", err2);
              return reject(err2);
            } else {
              return resolve({ message: "log has been created" });
            }
          }
        );
      }
    );
  });
});
electron.ipcMain.handle("get-log", async (_, { userId, token }) => {
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
          return resolve({ error: "Invalid user" });
        }
        console.log("ss");
        db.all(
          "SELECT * FROM activityLogs where userId = ?",
          [userId],
          (err2, rows2) => {
            if (err2) {
              console.error("Failed to get logs:", err2);
              return reject(err2);
            } else {
              return resolve(rows2);
            }
          }
        );
      }
    );
  });
});
electron.ipcMain.handle("create-drawingData", async (_, { token, userId, drawingData }) => {
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
          return resolve({ error: "Invaid user" });
        }
        const drawingDataString = JSON.stringify(drawingData);
        db.run(
          "INSERT INTO drawingBoard (drawingData, userId) VALUES (?, ?) ",
          [drawingDataString, userId],
          (err2) => {
            if (err2) {
              console.error("Failed to save drawing data:", err2);
              return reject(err2);
            } else {
              return resolve({ message: "drawing data has been saved" });
            }
          }
        );
      }
    );
  });
});
electron.ipcMain.handle("get-drawingData", async (_, { token, userId }) => {
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
          return resolve({ error: "Invaid user" });
        }
        db.get(
          "SELECT * FROM drawingBoard where userId = ? ",
          [userId],
          (err2, row) => {
            if (err2) {
              console.error("Failed to get the drawing data:", err2);
              return reject(err2);
            } else {
              return resolve(row);
            }
          }
        );
      }
    );
  });
});
electron.ipcMain.handle("edit-drawingData", async (_, { token, userId, drawingData }) => {
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
          return resolve({ error: "Invaid user" });
        }
        const drawingDataString = JSON.stringify(drawingData);
        db.run(
          "UPDATE drawingBoard SET drawingData = ? WHERE userId = ?",
          [drawingDataString, userId],
          (err2) => {
            if (err2) {
              console.error("Failed to edit drawing data:", err2);
              return reject(err2);
            } else {
              return resolve({ message: "drawing data has been edited" });
            }
          }
        );
      }
    );
  });
});
