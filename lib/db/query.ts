// lib/db/query.ts

import { getDatabase } from ".";

export async function getAllQuestionSets() {
  const db = await getDatabase();
  const result = await db.getAllAsync(`
    SELECT id, title, created_at, num_questions FROM subjects ORDER BY created_at DESC
  `);
  return result;
}
