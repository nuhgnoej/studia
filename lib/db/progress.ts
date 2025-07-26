// /lib/db/progress.ts

import { getDatabase } from ".";

type ProgressRow = {
  last_question_index: number;
};

export async function loadLastProgress(subjectId: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ProgressRow>(
    `SELECT last_question_index FROM progress WHERE subject_id = ?`,
    [subjectId]
  );

  return row?.last_question_index ?? 0;
}

export async function saveProgress({
  subjectId,
  currentIndex,
  totalQuestions,
}: {
  subjectId: string;
  currentIndex: number;
  totalQuestions: number;
}) {
  const db = await getDatabase();
  const progress = (currentIndex + 1) / totalQuestions;

  try {
    await db.runAsync(
      `INSERT INTO progress (subject_id, last_question_index, progress_percent)
     VALUES (?, ?, ?)
     ON CONFLICT(subject_id) DO UPDATE SET
       last_question_index=excluded.last_question_index,
       progress_percent=excluded.progress_percent
    `,
      [subjectId, currentIndex, progress]
    );
  } catch (err: any) {
    console.error(err);
  }
}

export async function getProgressSummary(subjectId: string): Promise<{
  lastIndex: number;
  percent: number;
  total: number;
}> {
  const db = await getDatabase();

  const [progress, subject] = await Promise.all([
    db.getFirstAsync<{ last_question_index: number; progress_percent: number }>(
      `SELECT last_question_index, progress_percent FROM progress WHERE subject_id = ?`,
      [subjectId]
    ),
    db.getFirstAsync<{ num_questions: number }>(
      `SELECT num_questions FROM subjects WHERE id = ?`,
      [subjectId]
    ),
  ]);

  return {
    lastIndex: progress?.last_question_index ?? 0,
    percent: progress?.progress_percent ?? 0,
    total: subject?.num_questions ?? 0,
  };
}

export async function resetProgress(subjectId: string) {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE progress 
       SET last_question_index = 0, progress_percent = 0 
       WHERE subject_id = ?`,
      [subjectId]
    );
  } catch (error) {
    console.error("❌ resetProgress 실패:", error);
    throw error;
  }
}
