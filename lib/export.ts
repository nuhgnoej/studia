import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getQuestionsBySubjectId } from "@/lib/db";
import { questionFileMap } from "@/lib/questionFileMap";
import { Question } from "./types";

function transformQuestionForExport(question: Question) {
  function parseAnswerRaw(raw: string) {
    try {
      const parsed = JSON.parse(raw);
      return parsed;
    } catch {
      return raw;
    }
  }

  const parsedAnswer = parseAnswerRaw(question.answer as string);

  const transformedAnswer =
    question.type === "subjective"
      ? Array.isArray(parsedAnswer)
        ? parsedAnswer
        : [parsedAnswer]
      : typeof parsedAnswer === "string"
      ? parsedAnswer
      : String(parsedAnswer);

  return {
    ...question,
    answer: transformedAnswer,
  };
}

export const handleExportData = async (fileName: string) => {
  try {
    const file = questionFileMap[fileName];
    if (!file) throw new Error(`❌ 파일을 찾을 수 없습니다: ${fileName}`);

    const questions = await getQuestionsBySubjectId(fileName);
    const metadata = file.data.metadata;

    const transformedQuestions = questions.map(transformQuestionForExport);

    const exportData = {
      metadata: {
        ...metadata,
        num_questions: transformedQuestions.length,
        updated_at: new Date().toISOString().slice(0, 10),
      },
      questions: transformedQuestions,
    };

    const json = JSON.stringify(exportData, null, 2);

    const exportFileName = `${fileName}_export.json`;
    const fileUri = FileSystem.documentDirectory + exportFileName;

    await FileSystem.writeAsStringAsync(fileUri, json);
    await Sharing.shareAsync(fileUri);

    console.log("✅ 데이터 내보내기 완료:", fileUri);
  } catch (error) {
    console.error("❌ 데이터 내보내기 실패:", error);
  }
};
