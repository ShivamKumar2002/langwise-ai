import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

export function initializeDatabase() {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'voice_assessment.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  return db;
}

export function getDatabase() {
  if (!db) {
    initializeDatabase();
  }
  return db;
}

export function createSchema() {
  const database = getDatabase();

  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      nativeLanguage TEXT NOT NULL,
      targetLanguage TEXT NOT NULL,
      goal TEXT NOT NULL,
      bio TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Transcripts table
  database.exec(`
    CREATE TABLE IF NOT EXISTS transcripts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      content TEXT NOT NULL,
      agentId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )
  `);

  // Skill levels table
  database.exec(`
    CREATE TABLE IF NOT EXISTS skill_levels (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      category TEXT NOT NULL,
      level INTEGER NOT NULL,
      trend TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )
  `);

  // Personalized plans table
  database.exec(`
    CREATE TABLE IF NOT EXISTS personalized_plans (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      skills TEXT NOT NULL,
      currentLevel TEXT NOT NULL,
      nextLevel TEXT NOT NULL,
      learningUnits TEXT NOT NULL,
      coachingTips TEXT NOT NULL,
      weakAreas TEXT NOT NULL,
      strengths TEXT NOT NULL,
      generatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )
  `);

  // Assessment sessions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      agentId TEXT NOT NULL,
      transcript TEXT,
      startedAt TEXT NOT NULL,
      endedAt TEXT,
      status TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )
  `);

  console.log('[v0] Database schema created successfully');
}
