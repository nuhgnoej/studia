// lib/db/insert.ts

import { getDatabase } from ".";

export async function insertQuestions(subjectId: string, questions: any[]) {
  const db = await getDatabase();

  // 트랜잭션 시작
  await db.runAsync("BEGIN TRANSACTION");

  try {
    // 기존 문제 삭제
    await db.runAsync("DELETE FROM questions WHERE subject_id = ?", [subjectId]);

    const stmt = `INSERT INTO questions (
      subject_id, id, type, questionText, questionExplanation,
      choices, answer, answerExplanation, tags, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;

    for (const q of questions) {
      const {
        id,
        type,
        question: { questionText, questionExplanation },
        choices,
        answer: { answerText, answerExplanation },
        tags,
      } = q;

      console.log(
        `🟡 inserting question id=${id}, type=${type},questionText=${questionText}`
      );
      console.log("choices:", choices);

      await db.runAsync(stmt, [
        subjectId,
        id,
        type,
        questionText,
        (questionExplanation || []).join("\n"),
        JSON.stringify(choices || []),
        answerText,
        answerExplanation,
        JSON.stringify(tags || []),
      ]);
    }

    // 커밋
    await db.runAsync("COMMIT");
    console.log("✅ insertQuestions 완료");
  } catch (err) {
    // 트랜잭션 롤백
    try {
      await db.runAsync("ROLLBACK");
    } catch (rollbackErr) {
      console.error("⚠️ ROLLBACK 실패:", rollbackErr);
    }

    console.error(`❌ Error inserting question id=${questions[0]?.id}:`, err);
    throw err;
  }
}

export async function insertMetadata(metadata: any) {
  try {
    const db = await getDatabase(); // ensure this resolves
    console.log("DB 연결 완료");

    const {
      id,
      title,
      description,
      subject,
      category,
      difficulty,
      version,
      created_at,
      updated_at,
      author,
      source,
      tags,
      license,
      num_questions,
    } = metadata;

    await db.runAsync(
      `INSERT OR REPLACE INTO subjects (
        id, title, description, subject, category,
        difficulty, version, created_at, updated_at,
        author, source, tags, license, num_questions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        description,
        subject,
        JSON.stringify(category),
        difficulty,
        version,
        created_at,
        updated_at,
        author,
        source,
        JSON.stringify(tags),
        license,
        num_questions,
      ]
    );

    console.log("✅ insertMetadata 완료");
  } catch (err) {
    console.error("❌ insertMetadata 실패:", err);
    throw err;
  }
}
