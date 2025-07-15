import { getDatabase } from ".";

export async function updateTags({
  questionId,
  subjectId,
  tags,
}: {
  questionId: number;
  subjectId: string;
  tags: string[];
}) {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE questions SET tags = ? WHERE id = ? AND subject_id = ?`,
    [JSON.stringify(tags), questionId, subjectId]
  );
}

export async function updateTagsEverywhere({
  subjectId,
  questionId,
  tags,
}: {
  subjectId: string;
  questionId: number;
  tags: string[];
}) {
  await updateTags({ subjectId, questionId, tags });
}
