// lib/loadQuestionsFromFile.ts
import { insertQuestions } from "./db";
import { questionFileMap } from "./questionFileMap";

export async function loadQuestionsFromFile(filename: string) {
  const entry = questionFileMap[filename as keyof typeof questionFileMap];
  if (!entry) throw new Error(`파일을 찾을 수 없습니다: ${filename}`);

  const data = entry.data;

  const cleaned = data.map((q: any) => ({
    id: q.id,
    type: q.type ?? "objective",
    question: q.question,
    choices: Array.isArray(q.choices) ? q.choices : [],
    answer: q.answer,
    explanation: q.explanation ?? "",
  }));

  await insertQuestions(cleaned);
}
