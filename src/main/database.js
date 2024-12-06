import { Database } from 'sqlite3';
import { join } from 'path';
import { app } from 'electron';

// Path for the database file
const dbPath = join(app.getPath('userData'), 'notes.db');

// Initialize the database
const db = new Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to the database', err);
  } else {
    console.log('Connected to the database at', dbPath);
  }
});

// Create the notes table if it doesn't exist
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
)

export default db;