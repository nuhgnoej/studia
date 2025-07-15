// lib/db/query.ts

import { getDatabase } from ".";

import { AnswerRecord, Question } from "../types";

export async function getAllQuestionSets() {
  const db = await getDatabase();
  const result = await db.getAllAsync(`
    SELECT id, title, created_at, num_questions FROM subjects ORDER BY created_at DESC
  `);
  return result;
}

export async function getQuestionsBySubjectId(
  subjectId: string
): Promise<Question[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<Question>(
    `SELECT * FROM questions WHERE subject_id = ? ORDER BY id ASC`,
    [subjectId]
  );

  // choices 필드가 JSON 문자열일 경우 파싱
  return result.map((q) => ({
    ...q,
    choices: q.choices ? JSON.parse(q.choices as any) : [],
    tags: q.tags ? JSON.parse(q.tags as any) : [],
  }));
}

export const insertAnswer = async ({
  question_id,
  subject_id,
  user_answer,
  is_correct,
}: Omit<AnswerRecord, "id" | "answered_at">): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO answers (
        question_id,
        subject_id,
        user_answer,
        is_correct,
        answered_at
      ) VALUES (?, ?, ?, ?, datetime('now'))`,
      [question_id, subject_id, user_answer, is_correct ? 1 : 0]
    );
  } catch (error) {
    console.error("❌ insertAnswer 실패:", error);
    throw error;
  }
};
