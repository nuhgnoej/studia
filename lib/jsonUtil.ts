// lib/jsonUtils.ts

import { questionFileMap } from "@/lib/questionFileMap";

export function updateTagsInJson({
  subjectId,
  questionId,
  tags,
}: {
  subjectId: string;
  questionId: number;
  tags: string[];
}) {
  const entry = questionFileMap[subjectId as keyof typeof questionFileMap];
  if (!entry) {
    throw new Error(`Subject ${subjectId} not found`);
  }

  const question = entry.data.questions.find((q) => q.id === questionId);
  if (!question) {
    throw new Error(`Question ID ${questionId} not found in ${subjectId}`);
  }

  question.tags = tags;
}
