import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'rsa_tutor.db'));

// 建立資料表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    slide_number INTEGER NOT NULL,
    completed BOOLEAN DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, slide_number)
  );

  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_number INTEGER NOT NULL,
    answer BOOLEAN NOT NULL,
    correct BOOLEAN NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS rsa_practice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    p INTEGER NOT NULL,
    q INTEGER NOT NULL,
    message INTEGER NOT NULL,
    encrypted INTEGER NOT NULL,
    decrypted INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// 用戶相關操作
export const createUser = (username) => {
  const stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
  try {
    const result = stmt.run(username);
    return { id: result.lastInsertRowid, username };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
      return user;
    }
    throw error;
  }
};

export const getUser = (userId) => {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
};

// 進度相關操作
export const updateProgress = (userId, slideNumber, completed) => {
  const stmt = db.prepare(`
    INSERT INTO progress (user_id, slide_number, completed)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, slide_number)
    DO UPDATE SET completed = ?, timestamp = CURRENT_TIMESTAMP
  `);
  return stmt.run(userId, slideNumber, completed ? 1 : 0, completed ? 1 : 0);
};

export const getProgress = (userId) => {
  return db.prepare('SELECT * FROM progress WHERE user_id = ? ORDER BY slide_number').all(userId);
};

// 測驗相關操作
export const saveQuizAttempt = (userId, questionNumber, answer, correct) => {
  const stmt = db.prepare(`
    INSERT INTO quiz_attempts (user_id, question_number, answer, correct)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(userId, questionNumber, answer ? 1 : 0, correct ? 1 : 0);
};

export const getQuizStats = (userId) => {
  return db.prepare(`
    SELECT
      COUNT(*) as total_attempts,
      SUM(correct) as correct_answers,
      ROUND(CAST(SUM(correct) AS FLOAT) / COUNT(*) * 100, 2) as accuracy
    FROM quiz_attempts
    WHERE user_id = ?
  `).get(userId);
};

// RSA 練習記錄
export const savePractice = (userId, p, q, message, encrypted, decrypted) => {
  const stmt = db.prepare(`
    INSERT INTO rsa_practice (user_id, p, q, message, encrypted, decrypted)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(userId, p, q, message, encrypted, decrypted);
};

export const getPracticeHistory = (userId, limit = 10) => {
  return db.prepare(`
    SELECT * FROM rsa_practice
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `).all(userId, limit);
};

export default db;
