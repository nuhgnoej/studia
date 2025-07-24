import { getDatabase } from ".";

export type AnswerStats = {
  question_id: number;
  total_attempts: number;
  correct_attempts: number;
  latest_answer: string;
};

export function checkAnswer(
  correctAnswerRaw: string,
  userAnswer: string
): boolean {
  // correctAnswerRaw가 JSON 문자열일 수 있으므로 try-catch로 파싱 시도
  let correctAnswer;
  try {
    correctAnswer = JSON.parse(correctAnswerRaw);
  } catch {
    // 파싱 실패 시 일반 문자열로 간주
    correctAnswer = correctAnswerRaw;
  }

  // 정답이 배열인 경우와 문자열인 경우를 모두 처리
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.map((v) => v.trim()).includes(userAnswer.trim());
  } else {
    return correctAnswer.toString().trim() === userAnswer.trim();
  }
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
        ORDER BY latest.answered_at DESC
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
