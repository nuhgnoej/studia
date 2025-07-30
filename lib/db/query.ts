// lib/db/query.ts

import { getDatabase } from ".";

import { Question } from "../types";

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
  const result = await db.getAllAsync<any>(
    `SELECT * FROM questions WHERE subject_id = ? ORDER BY id ASC`,
    [subjectId]
  );
  return result.map(mapRowToQuestion);
}

function mapRowToQuestion(row: any): Question {
  return {
    id: row.id,
    subject_id: row.subject_id,
    type: row.type,
    question: {
      questionText: row.questionText,
      questionExplanation: row.questionExplanation
        ? row.questionExplanation
        : "",
      // questionExplanation: row.questionExplanation
      //   ? JSON.parse(row.questionExplanation)
      //   : [],
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

  console.log("🛠️ 쿼리 시작: getWrongAnsweredQuestionsBySubjectId", subjectId);

  const rows = await db.getAllAsync<any>(
    `
    SELECT q.*
    FROM questions q
    JOIN (
      SELECT question_id, MAX(answered_at) AS latest
      FROM answers
      WHERE subject_id = ?
      GROUP BY question_id
    ) latest_answers
    ON q.id = latest_answers.question_id
    JOIN answers a
    ON a.question_id = latest_answers.question_id AND a.answered_at = latest_answers.latest
    WHERE a.is_correct = 0 AND q.subject_id = ?
    `,
    [subjectId, subjectId]
  );

  console.log("🧾 오답 쿼리 결과:", rows.length);

  return rows.map(mapRowToQuestion);
}
