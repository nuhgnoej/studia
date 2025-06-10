// lib/db.ts

import * as SQLite from "expo-sqlite";
import type { AnswerRecord, Question, RawQuestionRow } from "./types";

let db: SQLite.SQLiteDatabase;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("studiaDatabase");
  }
  return db;
}

// 초기 테이블 생성
export async function initDatabase() {
  const db = await getDatabase();

  await db.execAsync(`PRAGMA journal_mode = WAL;`);
  // await db.execAsync(`DROP TABLE IF EXISTS questions;`); // 디버깅용 임시 쿼리문
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY NOT NULL,
      type TEXT NOT NULL DEFAULT 'objective',
      question TEXT NOT NULL,
      choices TEXT,
      answer TEXT NOT NULL,
      explanation TEXT,
      weight REAL DEFAULT 1.0,
      total_attempts INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      user_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );
  `);
}

export async function insertQuestions(
  questions: {
    id: number;
    type: string;
    question: string;
    choices: string[] | null;
    answer: string;
    explanation: string;
  }[]
) {
  const db = await getDatabase();

  for (const q of questions) {
    await db.runAsync(
      `
      INSERT INTO questions (id, type, question, choices, answer, explanation)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        type = excluded.type,
        question = excluded.question,
        choices = excluded.choices,
        answer = excluded.answer,
        explanation = excluded.explanation;
      `,
      [
        q.id,
        q.type,
        q.question,
        JSON.stringify(q.choices),
        q.answer,
        q.explanation,
      ]
    );
  }
}

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

export async function getQuestionById(id: number): Promise<Question | null> {
  const db = await getDatabase();
  const row = (await db.getFirstAsync(
    `SELECT * FROM questions WHERE id = ?`,
    id
  )) as any;
  if (!row) return null;

  return {
    id: row.id,
    type: row.type,
    question: row.question,
    answer: row.answer,
    explanation: row.explanation ?? "",
    choices: row.choices ? JSON.parse(row.choices) : [],
    weight: row.weight ?? 1.0,
  };
}

export async function getQuestionCount() {
  const db = await getDatabase();
  const row = (await db.getFirstAsync(
    `SELECT COUNT(*) AS count FROM questions`
  )) as { count: number };
  return row?.count ?? 0;
}

export async function insertAnswer(
  record: Omit<AnswerRecord, "id" | "answered_at">
) {
  const db = await getDatabase();
  console.log("DB 가져옴");

  await db.runAsync(
    `INSERT INTO answers (question_id, user_answer, is_correct)
     VALUES (?, ?, ?)`,
    [record.question_id, record.user_answer, record.is_correct ? 1 : 0]
  );

  // console.log("INSERT 완료");

  await db.runAsync(
    `UPDATE questions
   SET total_attempts = total_attempts + 1,
       correct_count = correct_count + ?
   WHERE id = ?`,
    [record.is_correct ? 1 : 0, record.question_id]
  );

  await updateQuestionWeight(record.question_id, record.is_correct);
}

export async function updateQuestionWeight(
  questionId: number,
  isCorrect: boolean
) {
  const db = await getDatabase();
  const delta = isCorrect ? -0.1 : 0.3;

  await db.runAsync(
    `UPDATE questions SET weight = MAX(0.1, weight + ?) WHERE id = ?`,
    [delta, questionId]
  );
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
