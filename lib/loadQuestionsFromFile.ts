// lib/loadQuestionsFromFile.ts
import { getDatabase } from "./db";
import { questionFileMap } from "./questionFileMap";

export async function loadQuestionsFromFile(filename: string) {
  try {
    const db = await getDatabase();
    const entry = questionFileMap[filename as keyof typeof questionFileMap];

    if (!entry) {
      throw new Error("문제 세트를 찾을 수 없습니다.");
    }

    // 과목 정보 저장
    await db.runAsync(
      "INSERT OR REPLACE INTO subjects (id, name, created_at) VALUES (?, ?, datetime('now'))",
      [filename, entry.name]
    );

    // 기존 문제 삭제
    await db.runAsync("DELETE FROM questions WHERE subject_id = ?", [filename]);

    // 새 문제 추가
    for (const question of entry.data.questions) {
      if (!question.id) {
        console.error("문제 ID가 없습니다:", question);
        continue;
      }

      await db.runAsync(
        `INSERT OR REPLACE INTO questions (
          id, subject_id, type, question, choices, answer, explanation, weight,created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,datetime('now'))`,
        [
          question.id,
          filename,
          question.type,
          JSON.stringify(question.question),
          JSON.stringify(question.choices || []),
          question.answer,
          question.explanation || null,
          1.0,
        ]
      );
    }

    return true;
  } catch (error) {
    console.error("문제 세트 로딩 에러:", error);
    throw error;
  }
}
