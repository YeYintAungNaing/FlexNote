/* eslint-disable prettier/prettier */
import Database  from "better-sqlite3"

//const dbPath = '/home/ubuntu/database/flexnote.db';
const dbPath = "C:/sqliteDBs/test.db"


// TODO make dynamic path depending on the OS and automate creating necessary folder

const db = new Database(dbPath);

console.log('Database created or opened successfully');

try {
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      userName TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      dName TEXT,
      gender TEXT,
      createdAt TIMESTAMP,
      location TEXT,
      profileImgPath TEXT,
      mode TEXT
    )
  `);
  console.log('Users table created successfully');


  db.exec(`
    CREATE TABLE IF NOT EXISTS verificationCodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      title TEXT NOT NULL,
      code TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      expiresAt TIMESTAMP
    )
  `);
  console.log('Vericodes table created successfully');

  db.exec(`
    CREATE TABLE IF NOT EXISTS activityLogs (
      logId INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      logContent TEXT NOT NULL,
      logType TEXT,
      createdAt TIMESTAMP
    )
  `);
  console.log('logs table created successfully');

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      name TEXT,
      content TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('notes table created successfully');

  db.exec(`
    CREATE TABLE IF NOT EXISTS drawingBoard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      drawingData TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Vericodes table created successfully');


} catch (err) {
  console.error('Error setting up tables:', err.message);
}

db.close();
console.log('Database connection closed');