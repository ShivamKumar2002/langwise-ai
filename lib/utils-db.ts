import { getDatabase } from './db';
import { randomUUID } from 'crypto';
import type { User, PersonalizedPlan, SkillLevel, Transcript, AssessmentSession } from './types';

// User operations
export function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const db = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, userId, name, nativeLanguage, targetLanguage, goal, bio, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, user.userId, user.name, user.nativeLanguage, user.targetLanguage, user.goal, user.bio, now, now);

  return { ...user, id, createdAt: now, updatedAt: now };
}

export function getUserByUserId(userId: string): User | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE userId = ?');
  return stmt.get(userId) as User | undefined || null;
}

export function updateUser(userId: string, updates: Partial<User>): User | null {
  const db = getDatabase();
  const user = getUserByUserId(userId);
  if (!user) return null;

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE users 
    SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')}, updatedAt = ?
    WHERE userId = ?
  `);

  stmt.run(...Object.values(updates), now, userId);
  return { ...user, ...updates, updatedAt: now };
}

// Transcript operations
export function createTranscript(userId: string, content: string, agentId: string): Transcript {
  const db = getDatabase();
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO transcripts (id, userId, content, agentId, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, userId, content, agentId, createdAt);

  return { id, userId, content, agentId, createdAt };
}

// Personalized plan operations
export function savePlan(plan: PersonalizedPlan): void {
  const db = getDatabase();
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO personalized_plans 
    (id, userId, skills, currentLevel, nextLevel, learningUnits, coachingTips, weakAreas, strengths, generatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    plan.userId,
    JSON.stringify(plan.skills),
    plan.currentLevel,
    plan.nextLevel,
    JSON.stringify(plan.learningUnits),
    JSON.stringify(plan.coachingTips),
    JSON.stringify(plan.weakAreas),
    JSON.stringify(plan.strengths),
    plan.generatedAt
  );
}

export function getPlanByUserId(userId: string): PersonalizedPlan | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM personalized_plans 
    WHERE userId = ? 
    ORDER BY generatedAt DESC 
    LIMIT 1
  `);

  const row = stmt.get(userId) as any;
  if (!row) return null;

  return {
    userId: row.userId,
    skills: JSON.parse(row.skills),
    currentLevel: row.currentLevel,
    nextLevel: row.nextLevel,
    learningUnits: JSON.parse(row.learningUnits),
    coachingTips: JSON.parse(row.coachingTips),
    weakAreas: JSON.parse(row.weakAreas),
    strengths: JSON.parse(row.strengths),
    generatedAt: row.generatedAt,
  };
}

// Assessment session operations
export function createAssessmentSession(userId: string, agentId: string): AssessmentSession {
  const db = getDatabase();
  const id = randomUUID();
  const startedAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO assessment_sessions (id, userId, agentId, startedAt, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, userId, agentId, startedAt, 'active');

  return { id, userId, agentId, transcript: '', startedAt, status: 'active' };
}

export function getAssessmentSession(sessionId: string): AssessmentSession | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM assessment_sessions WHERE id = ?');
  return stmt.get(sessionId) as AssessmentSession | undefined || null;
}

export function completeAssessmentSession(sessionId: string, transcript: string): AssessmentSession | null {
  const db = getDatabase();
  const session = getAssessmentSession(sessionId);
  if (!session) return null;

  const endedAt = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE assessment_sessions 
    SET transcript = ?, endedAt = ?, status = ?
    WHERE id = ?
  `);

  stmt.run(transcript, endedAt, 'completed', sessionId);

  return { ...session, transcript, endedAt, status: 'completed' };
}
