import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getAllQuestions } from "@/lib/db";

export const handleExportData = async () => {
  try {
    const questions = await getAllQuestions();
    const json = JSON.stringify(questions, null, 2);

    const fileUri = FileSystem.documentDirectory + "exported_questions.json";
    await FileSystem.writeAsStringAsync(fileUri, json);

    await Sharing.shareAsync(fileUri);

    console.log("✅ 데이터 내보내기 완료:", fileUri);
  } catch (error) {
    console.error("❌ 데이터 내보내기 실패:", error);
  }
};
