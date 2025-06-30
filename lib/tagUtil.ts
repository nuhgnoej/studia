import { updateTags } from "./db";
import { updateTagsInJson } from "./jsonUtil";
import { questionFileMap } from "./questionFileMap";

export async function updateTagsEverywhere({
  subjectId,
  questionId,
  tags,
}: {
  subjectId: string;
  questionId: number;
  tags: string[];
}) {
  updateTagsInJson({ subjectId, questionId, tags });
  await updateTags({ subjectId, questionId, tags });
}


