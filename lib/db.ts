// lib/db.ts

import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import type { AnswerRecord, Question, RawQuestionRow } from "./types";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("studia.db");
  }
  return db;
}

export async function initDatabase() {
  const db = await getDatabase();

  // answers 테이블은 유지하고 questions와 subjects 테이블만 초기화
  await db.runAsync("DROP TABLE IF EXISTS questions");
  await db.runAsync("DROP TABLE IF EXISTS subjects");

  // subjects 테이블 생성
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME NOT NULL
    )
  `);

  // questions 테이블 생성
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER NOT NULL,
      subject_id TEXT NOT NULL,
      type TEXT NOT NULL,
      question TEXT NOT NULL,
      choices TEXT,
      answer TEXT NOT NULL,
      explanation TEXT,
      created_at DATETIME NOT NULL,
      PRIMARY KEY (id, subject_id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    )
  `);

  // answers 테이블이 없을 경우에만 생성
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

export const getQuestionById = async (id: number): Promise<Question | null> => {
  const db = await getDatabase();
  const question = await db.getFirstAsync<Question>(
    "SELECT * FROM questions WHERE id = ?",
    id
  );
  return question;
};

export const getQuestionCount = async (): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM questions"
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

export async function getAllQuestions(): Promise<Question[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(`SELECT * FROM questions`);

  return rows.map((row: any) => ({
    id: row.id,
    type: row.type,
    question: row.question,
    choices: row.choices ? JSON.parse(row.choices) : [],
    answer: row.answer,
    explanation: row.explanation ?? "",
    weight: row.weight ?? 1.0,
  }));
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
      return {
        id: row.id,
        type: row.type as "objective" | "subjective",
        question: row.question,
        choices: row.choices ? JSON.parse(row.choices) : [],
        answer: row.answer,
        explanation: row.explanation ?? "",
        weight: row.weight ?? 1.0,
      };
    }
  }

  return null;
}
