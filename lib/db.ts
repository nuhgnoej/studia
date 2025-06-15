// lib/db.ts

import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import type { AnswerRecord, Question, RawQuestionRow } from "./types";
import { questionFileMap } from "@/lib/questionFileMap";

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

export async function resetQuestionDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS questions");
  await db.runAsync(`
    CREATE TABLE questions (
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
}

export async function removeQuestionDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS questions");
}

export async function resetSubjectDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS subjects");
  await db.runAsync(`
    CREATE TABLE subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME NOT NULL
    )
  `);
}

export async function removeSubjectDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS subjects");
}

export async function resetAnswerDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS answers");
  await db.runAsync(`
    CREATE TABLE answers (
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

export async function removeAnswerDatabase() {
  const db = await getDatabase();
  await db.runAsync("DROP TABLE IF EXISTS answers");
}

export async function resetAllDatabases() {
  await resetAnswerDatabase();
  await resetQuestionDatabase();
  await resetSubjectDatabase();
}

export async function removeAllDatabases() {
  await removeAnswerDatabase();
  await removeQuestionDatabase();
  await removeSubjectDatabase();
}

export async function syncDatabaseWithQuestionFileMap() {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{ subject_id: string }>(
    "SELECT DISTINCT subject_id FROM questions"
  );
  const existingSubjects = rows.map((r) => r.subject_id);

  // 기존에 있지만 사라진 subject 제거
  for (const subjectId of existingSubjects) {
    if (!questionFileMap[subjectId]) {
      await db.runAsync("DELETE FROM questions WHERE subject_id = ?", [
        subjectId,
      ]);
      await db.runAsync("DELETE FROM subjects WHERE id = ?", [subjectId]);
    }
  }

  // 새롭게 추가된 subject 동기화
  for (const [filename, entry] of Object.entries(questionFileMap)) {
    if (!existingSubjects.includes(filename)) {
      await db.runAsync(
        "INSERT OR IGNORE INTO subjects (id, name, created_at) VALUES (?, ?, datetime('now'))",
        [filename, entry.name]
      );

      for (const q of entry.data) {
        await db.runAsync(
          "INSERT INTO questions (id, subject_id, type, question, choices, answer, explanation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
          [
            q.id,
            filename,
            q.type,
            q.question,
            JSON.stringify(q.choices || []),
            q.answer,
            q.explanation || "",
          ]
        );
      }
    }
  }
}
