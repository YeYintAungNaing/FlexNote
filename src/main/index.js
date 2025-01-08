import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import db from './database'
import crypto from 'crypto';
import bcrypt from 'bcrypt';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })
  mainWindow.webContents.openDevTools();

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


// Save a new note
ipcMain.handle('save-note', async (_, { token, noteName, content, userId }) => {
  return new Promise((resolve, reject) => {

    db.get('SELECT * FROM users WHERE id = ? and sessionToken = ?',
      [userId, token ], (err, rows) => {
        if (err) {
          console.error('db error', err);
          return reject(err);  // have to explictly return to terminate
        } 
        if(!rows) {
          
          return resolve({ message: 'Invalid user' })
        }

        db.get("SELECT * FROM notes where name = ?", [noteName], (err, rows) => {
          if (err) {
            console.error('faled to create new note', err)
            return reject(err)
          }
          else if(rows){
            return resolve({error : "note name is already taken"})
          }

          // this only happens after the previous query is completed
          // queries are asyns so we cant just terminate them in order with return
          db.run(
            'INSERT INTO notes (name, content, userId) VALUES (?, ?, ?)',
            [noteName, content, userId], (err) => {
              if (err) {
               console.error('Failed to save note:', err);
                return reject(err);
              } else {
               //resolve({ id: this.lastID }); // Return the ID of the inserted note
                return resolve({ message: 'note has been saved' })
              }
            }
          )
        })
      }
    )
  })
});

ipcMain.handle('edit-note', async (_, {  token, content, noteId,  userId }) => {
  return new Promise((resolve, reject) => {
    
    db.get('SELECT * FROM users WHERE id = ? and sessionToken = ?',
      [userId, token ], (err, rows) => {
        if (err) {
          console.error('db error', err);
          return reject(err);  // have to explictly return to terminate
        } 
        if(!rows) {
          return resolve({ message: 'Invalid user' })
        }

        db.run(
          'UPDATE notes SET content = ? WHERE id = ? AND userId = ?',
          [content, noteId, userId], (err) => {
            if (err) {
              console.error('Failed to edit note:', err);
              return reject(err);
            } else {
              return resolve({ message: 'note has been edited' })
            }
          }
        )
      }
    ) 
  })
});


ipcMain.handle('edit-noteName', async  (_, {token, noteName, noteId, userId}) => {
  return new Promise((resolve, reject) => {
    console.log(token, userId)
    db.get('SELECT * FROM users WHERE id = ? and sessionToken = ?',
      [userId, token ], (err, rows) => {
        if (err) {
          console.error('db error', err);
          return reject(err);  // have to explictly return to terminate
        } 
        if(!rows) {
          return resolve({ message: 'Invalid user' })
        }

        db.run(
          'UPDATE notes SET name = ? WHERE id = ? AND userId = ?',
          [noteName, noteId, userId], (err) => {
            if (err) {
              console.error('Failed to edit note name:', err);
              return reject(err);
            } else {
              return resolve({ message: 'note name has been edited' })
            }
          }
        )
      }
    )
  })
})


ipcMain.handle('delete-note', async (_,  token, noteId, userId ) => {
  console.log('Received NoteId:', noteId, 'UserId:', userId);
  return new Promise((resolve, reject) => {

    db.get('SELECT * FROM users WHERE id = ? and sessionToken = ?',
      [userId, token ], (err, rows) => {
        if (err) {
          console.error('db error', err);
          return reject(err);  // have to explictly return to terminate
        } 
        if(!rows) {
          return resolve({ message: 'Invalid user' })
        }

        db.run(
          'DELETE FROM notes WHERE id = ? AND userId = ?',
          [noteId, userId],  (err) => {
            if (err) {
              console.error('Failed to delete note:', err);
              return reject(err);
            } else {
              return resolve({ message : 'note has been deleted' }); 
            }
          }
        )
      }
    )
  })
});


// Fetch all notes
ipcMain.handle('fetch-notes', async (_, userId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM notes where userId = ?', [userId], (err, rows) => {
      if (err) {
        console.error('Failed to fetch notes:', err);
        return reject(err);
      } else {
        return resolve(rows);
      }
    })
  })
});


// create user account
ipcMain.handle('create-user', async (_, { userName, password}) => {
  return new Promise((resolve, reject) => {


    db.get("SELECT * FROM users where userName = ?", [userName], (err, rows) => {
      if (err) {
        console.error('faled to create user account', err)
        return reject(err)
      }
      else if(rows){
        return resolve({error : "user name is already taken"})
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      db.run(
        'INSERT INTO users (userName, password) VALUES (?, ?)' ,
        [userName, hashedPassword], (err) => {
          if (err) {
            console.error('faled to create user account_', err)
            return reject(err)
          }
          else{
            return resolve({message : `${userName} has be registerd`})
          }
        }
      )
    })
  })
})



// log in
ipcMain.handle('log-in', async (_, { userName, password}) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE userName = ?',
      [userName],
      (err, row) => {
        // when there is something wrong with request
        if (err) {
          console.error(err)
          return reject({ message: 'Database error'})
        }
      
        // when there is no res data after retrieving from dv
        else if(!row) {
           return resolve({ message: 'User not found'})
        }
        // found the user data 
        else{
          const matchedPassword = bcrypt.compareSync(password, row.password);
          if (matchedPassword) {
            //resolve({ message: `Welcome ${row.userName}`});

            const sessionToken = crypto.randomBytes(32).toString('hex')

            db.run(
              'UPDATE users SET sessionToken = ? WHERE id = ?',
              [sessionToken, row.id],
              (err) => {
                if (err) {
                  return reject({message : 'failed to save session'})
                }
                else {
                  return resolve({
                    message : `Welcome ${row.userName} and your token is ${sessionToken}`,
                    user : row,
                    token : sessionToken,
                  })
                }
              }
            )
          }
          else{
            return resolve({ message: 'Incorrect password' });
          }
        }
      }
    )
  })
})


ipcMain.handle('edit-profile', async  (_, {token, userName, email, location, gender, displyName, userId }) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ? and sessionToken = ?',
      [userId, token ], (err, rows) => {
        if (err) {
          console.error('db error', err);
          return reject(err);  // have to explictly return to terminate
        } 
        if(!rows) {
          return resolve({ message: 'Invalid user' })
        }

        db.run(
          'UPDATE users SET userName = ?, email = ?, location = ?, gender = ?, dName = ? WHERE id = ?',
          [userName, email, location, gender, displyName, userId], (err) => {
            if (err) {
              console.error('Failed to edit profile :', err);
              return reject(err);
            } else {
              return resolve({ message: 'note name has been edited' })
            }
          }
        )
      }
    )
  })
})

// this try to find the user with the token(from db) that matches the one from frontend
ipcMain.handle('verify-token', async (_, token) => {
  return new Promise((resolve, reject) => {
    db.get("select * from users where sessionToken =?", [token], (err, row) => {
      if (err) {
        return reject ({ message : 'database errr'})
      }
      // what if there is left over token in the db for some reaosn
      else if(!row) {
        return resolve({ message : 'Not session'})
      }
      else{
        return resolve({ message : "session exists", currentUser : row})
      }
    })
  })
})

ipcMain.handle('logout-user', async (_, userId) => {
  return new Promise ((resolve, reject) => {
    db.run("UPDATE users set sessionToken = null where id = ?", [userId], (err) => {
      if (err) {
        return reject({ message : 'database errr'});
      }
      else{
        return resolve({message : `logout success`})
      }
    })
  })
})



