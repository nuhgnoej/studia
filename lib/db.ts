import * as SQLite from "expo-sqlite";
import { Question } from "./types";
import type { AnswerRecord } from "./types";

let db: SQLite.SQLiteDatabase;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("studiaDatabase");
  }
  return db;
}

// 초기 테이블 생성 (앱 시작 시 호출)
export async function initDatabase() {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY NOT NULL,
        type TEXT NOT NULL DEFAULT 'objective',  
        question TEXT NOT NULL,
        choices TEXT,                            
        answer TEXT NOT NULL,                    
        explanation TEXT
    );
  `);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      user_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL, -- 0 (false) or 1 (true)
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
  for (const q of questions) {
    await db.runAsync(
      `INSERT OR REPLACE INTO questions (id, type, question, choices, answer, explanation)
       VALUES (?,?,?, ?, ?, ?)`,
      q.id,
      q.type,
      q.question,
      JSON.stringify(q.choices),
      q.answer,
      q.explanation
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
  }));
}

export async function getQuestionById(id: number): Promise<Question | null> {
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
  };
}

// 전체 문제 수 반환
export async function getQuestionCount() {
  const row = (await db.getFirstAsync(
    `SELECT COUNT(*) AS count FROM questions`
  )) as { count: number };
  return row?.count ?? 0;
}

export async function insertAnswer(
  record: Omit<AnswerRecord, "id" | "answered_at">
) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO answers (question_id, user_answer, is_correct) VALUES (?, ?, ?)`,
    [record.question_id, record.user_answer, record.is_correct ? 1 : 0]
  );
}
