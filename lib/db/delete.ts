import { getDatabase } from "./index";

export async function deleteQuestionSetById(subjectId: string) {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM questions WHERE subject_id = ?`, [subjectId]);
  await db.runAsync(`DELETE FROM subjects WHERE id = ?`, [subjectId]);
}
