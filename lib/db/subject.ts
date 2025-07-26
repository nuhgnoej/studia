import { getDatabase } from ".";

export async function deleteSubject(subjectId: string) {
  const db = await getDatabase();
  try {
    await db.execAsync("BEGIN");
    await db.runAsync("DELETE FROM subjects WHERE id = ?", [subjectId]);
    await db.runAsync("DELETE FROM progress WHERE subject_id = ?", [subjectId]);
    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    console.error("❌ deleteSubject 실패 (롤백됨):", error);
    throw error;
  }
}

export type Subject = {
  id: string;
  title: string;
  description?: string;
  // 필요한 경우: created_at, color, etc.
};

export async function getAllSubjects(): Promise<Subject[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Subject>(
      "SELECT id, title, description FROM subjects ORDER BY title"
    );
    return rows;
  } catch (error) {
    console.error("❌ getAllSubjects 실패:", error);
    throw error;
  }
}
