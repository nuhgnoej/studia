// lib/db.ts

import * as SQLite from "expo-sqlite";
import type {
  AnswerRecord,
  AnswerStats,
  Question,
  RawQuestionRow,
} from "./types";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("studia.db");
  }
  return db;
}

export async function initDatabase() {
  const db = await getDatabase();

  // 기존 테이블 제거
  await db.runAsync("DROP TABLE IF EXISTS questions");
  await db.runAsync("DROP TABLE IF EXISTS subjects");

  // subjects 테이블
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME NOT NULL
    )
  `);

  // questions 테이블
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER NOT NULL,
      subject_id TEXT NOT NULL,
      type TEXT NOT NULL,
      question TEXT NOT NULL,
      choices TEXT,
      answer TEXT NOT NULL,
      explanation TEXT,
      weight REAL DEFAULT 1.0,
      tags TEXT,
      created_at DATETIME NOT NULL,
      PRIMARY KEY (id, subject_id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    )
  `);

  // answers 테이블이 없으면 생성
  const answersTableExists = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='answers'"
  );

  if (!answersTableExists || answersTableExists.count === 0) {
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        subject_id TEXT NOT NULL,
        user_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (question_id, subject_id) REFERENCES questions(id, subject_id)
      )
    `);
  }
}

export const insertSubject = async (id: string, name: string) => {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT OR REPLACE INTO subjects (id, name) VALUES (?, ?)",
    [id, name]
  );
};

export const getQuestionById = async (
  id: number
): Promise<Question | null> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    "SELECT * FROM questions WHERE id = ?",
    [id]
  );
  return row
    ? {
        id: row.id,
        type: row.type,
        question: JSON.parse(row.question),
        choices: row.choices ? JSON.parse(row.choices) : [],
        answer: row.answer,
        explanation: row.explanation ?? "",
        weight: row.weight ?? 1.0,
        tags: row.tags ? JSON.parse(row.tags) : [],
      }
    : null;
};

export const getToalQuestionCount = async (): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM questions"
  );
  return result?.count || 0;
};

export const getQuestionCountBySubjectId = async (
  subjectId: string
): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM questions WHERE subject_id = ?",
    [subjectId]
  );
  return result?.count || 0;
};

export const insertAnswer = async ({
  question_id,
  subject_id,
  user_answer,
  is_correct,
}: {
  question_id: number;
  subject_id: string;
  user_answer: string;
  is_correct: boolean;
}) => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO answers (
      question_id, subject_id, user_answer, is_correct, created_at
    ) VALUES (?, ?, ?, ?, datetime('now'))`,
    [question_id, subject_id, user_answer, is_correct ? 1 : 0]
  );
};

function mapRowToQuestion(row: any): Question {
  return {
    id: row.id,
    type: row.type,
    question: JSON.parse(row.question),
    choices: row.choices ? JSON.parse(row.choices) : [],
    answer: row.answer,
    explanation: row.explanation ?? "",
    weight: row.weight ?? 1.0,
    tags: row.tags ? JSON.parse(row.tags) : [],
  };
}

export async function getAllQuestions(): Promise<Question[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(`SELECT * FROM questions`);
  return rows.map(mapRowToQuestion);
}

export async function getWeightedRandomQuestion(): Promise<Question | null> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawQuestionRow>(`SELECT * FROM questions`);
  if (!rows.length) return null;

  const totalWeight = rows.reduce((sum, q) => sum + (q.weight ?? 1.0), 0);
  const threshold = Math.random() * totalWeight;

  let cumulative = 0;
  for (const row of rows) {
    cumulative += row.weight;
    if (cumulative >= threshold) {
      return mapRowToQuestion(row);
    }
  }

  return null;
}

export async function getQuestionsBySubjectId(
  subjectId: string
): Promise<Question[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM questions WHERE subject_id = ? ORDER BY id ASC`,
    [subjectId]
  );
  return rows.map(mapRowToQuestion);
}

export async function getWrongAnswersBySubjectId(
  subject_id: string
): Promise<Question[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    `
    SELECT q.*
    FROM questions q
    JOIN (
      SELECT question_id, MAX(created_at) AS latest
      FROM answers
      WHERE subject_id = ?
      GROUP BY question_id
    ) latest_answers
    ON q.id = latest_answers.question_id
    JOIN answers a
    ON a.question_id = latest_answers.question_id AND a.created_at = latest_answers.latest
    WHERE a.is_correct = 0 AND q.subject_id = ?
    `,
    [subject_id, subject_id]
  );

  return rows.map(mapRowToQuestion);
}

export async function getAnswersBySubjectId(
  subjectId: string
): Promise<AnswerRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM answers WHERE subject_id = ? ORDER BY id ASC`,
    [subjectId]
  );
  return rows.map((row: any) => ({
    question_id: row.question_id,
    user_answer: row.user_answer,
    is_correct: row.is_correct,
    created_at: row.created_at,
  }));
}

export async function getAnswerSummaryByQuestionIds(
  subjectId: string,
  questionIds: number[]
): Promise<{ question_id: number; count: number; correct_count: number }[]> {
  const db = await getDatabase();
  const placeholders = questionIds.map(() => "?").join(", ");
  const results = await db.getAllAsync<any>(
    `
    SELECT
      question_id,
      COUNT(*) AS count,
      SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count
    FROM answers
    WHERE subject_id = ?
      AND question_id IN (${placeholders})
    GROUP BY question_id
  `,
    [subjectId, ...questionIds]
  );

  return results;
}

export async function getAnswerStatsForQuestions(
  subject_id: string,
  question_ids: number[]
): Promise<AnswerStats[]> {
  const db = await getDatabase();

  const placeholders = question_ids.map(() => "?").join(",");
  const params = [subject_id, ...question_ids];

  const query = `
    SELECT
      question_id,
      COUNT(*) AS total_attempts,
      SUM(is_correct) AS correct_attempts,
      (
        SELECT user_answer
        FROM answers AS latest
        WHERE latest.question_id = a.question_id AND latest.subject_id = a.subject_id
        ORDER BY latest.created_at DESC
        LIMIT 1
      ) AS latest_answer
    FROM answers AS a
    WHERE subject_id = ? AND question_id IN (${placeholders})
    GROUP BY question_id
  `;

  const rows = await db.getAllAsync<AnswerStats>(query, params);
  return rows;
}

export async function getCorrectAnswerByQuestionAndSubjectId(
  subject_id: string,
  question_id: number
): Promise<string | null> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ answer: string }>(
    `SELECT answer FROM questions WHERE subject_id = ? AND id = ?`,
    [subject_id, question_id]
  );

  return result?.answer ?? null;
}

export async function getWeightsBySubjectId(subjectId: string) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    weight: number;
  }>(`SELECT id, weight FROM questions WHERE subject_id = ?`, [subjectId]);

  const weightMap = new Map<number, number>();
  for (const row of rows) {
    weightMap.set(row.id, row.weight);
  }

  return weightMap;
}

// 데이터베이스 초기화 함수들

export async function resetQuestionDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS questions");
  await initDatabase();
}

export async function resetSubjectDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS subjects");
  await initDatabase();
}

export async function resetAnswerDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS answers");
  await initDatabase();
}

export async function resetAllDatabases() {
  await resetAnswerDatabase();
  await resetQuestionDatabase();
  await resetSubjectDatabase();
}

export async function removeQuestionDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS questions");
}

export async function removeSubjectDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS subjects");
}

export async function removeAnswerDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS answers");
}

export async function removeAllDatabases() {
  await removeAnswerDatabase();
  await removeQuestionDatabase();
  await removeSubjectDatabase();
}
