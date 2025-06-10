import * as SQLite from "expo-sqlite";

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
}

export async function insertQuestions(
  questions: {
    id: number;
    question: string;
    choices: string[] | null;
    answer: string;
    explanation: string;
  }[]
) {
  for (const q of questions) {
    await db.runAsync(
      `INSERT OR REPLACE INTO questions (id, question, choices, answer, explanation)
       VALUES (?, ?, ?, ?, ?)`,
      q.id,
      q.question,
      JSON.stringify(q.choices),
      q.answer,
      q.explanation
    );
  }
}

export async function getAllQuestions() {
  return await db.getAllAsync(`SELECT * FROM questions`);
}

export async function getQuestionById(id: number) {
  return await db.getFirstAsync(`SELECT * FROM questions WHERE id = ?`, id);
}

// 전체 문제 수 반환
export async function getQuestionCount() {
  const row = (await db.getFirstAsync(
    `SELECT COUNT(*) AS count FROM questions`
  )) as { count: number };
  return row?.count ?? 0;
}
