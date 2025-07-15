// lib/db.ts

import * as SQLite from "expo-sqlite";
import { Metadata } from "../types";

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
      title TEXT,
      description TEXT,
      subject TEXT,
      category TEXT,
      difficulty TEXT,
      version TEXT,
      created_at TEXT,
      updated_at TEXT,
      author TEXT,
      source TEXT,
      tags TEXT,
      license TEXT,
      num_questions INTEGER
    )
  `);

  // questions 테이블
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER NOT NULL,
      subject_id TEXT NOT NULL,
      type TEXT NOT NULL,
      questionText TEXT NOT NULL,
      questionExplanation TEXT,
      choices TEXT,
      answer TEXT NOT NULL,
      answerExplanation TEXT,
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

export async function getMetadataBySubjectId(
  subjectId: string
): Promise<Metadata> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Metadata>(
    `SELECT * FROM subjects WHERE id = ?`,
    [subjectId]
  );
  if (!result) {
    throw new Error(`Subject not found: ${subjectId}`);
  }
  return result;
}
