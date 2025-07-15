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

// export async function getQuestionsBySubjectId(
//   subjectId: string
// ): Promise<Question[]> {
//   const db = await getDatabase();
//   const result = await db.getAllAsync<Question>(
//     `SELECT * FROM questions WHERE subject_id = ? ORDER BY id ASC`,
//     [subjectId]
//   );

//   // choices 필드가 JSON 문자열일 경우 파싱
//   return result.map((q) => ({
//     ...q,
//     choices: q.choices ? JSON.parse(q.choices as any) : [],
//     tags: q.tags ? JSON.parse(q.tags as any) : [],
//   }));
// }

export async function getQuestionsBySubjectId(subjectId: string): Promise<Question[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<any>(
    `SELECT * FROM questions WHERE subject_id = ? ORDER BY id ASC`,
    [subjectId]
  );
  return result.map(mapRowToQuestion);
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

function mapRowToQuestion(row: any): Question {
  return {
    id: row.id,
    subject_id: row.subject_id,
    type: row.type,
    question: {
      questionText: row.questionText,
      questionExplanation: row.questionExplanation
        ? JSON.parse(row.questionExplanation)
        : [],
    },
    choices: row.choices ? JSON.parse(row.choices) : [],
    answer: {
      answerText: row.answer,
      answerExplanation: row.answerExplanation || "",
    },
    tags: row.tags ? JSON.parse(row.tags) : [],
    weight: row.weight ?? 1.0,
    created_at: row.created_at,
  };
}


export default async function getWrongAnsweredQuestionsBySubjectId(
  subjectId: string
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
    [subjectId, subjectId]
  );

  return rows.map(mapRowToQuestion);
}
