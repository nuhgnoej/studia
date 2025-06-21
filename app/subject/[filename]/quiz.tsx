import StageQuiz from "@/components/StageQuiz";
import { getQuestionsBySubjectId, getWrongAnswersBySubjectId } from "@/lib/db";
import { Question } from "@/lib/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

export default function QuizScreen() {
  const { filename, mode } = useLocalSearchParams();
  const subject_id = filename as string;
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const load = async () => {
      const data =
        mode === "wrong"
          ? await getWrongAnswersBySubjectId(subject_id)
          : await getQuestionsBySubjectId(subject_id);
      setQuestions(data);
    };
    load();
  }, [subject_id]);

  return (
    <StageQuiz
      questions={questions}
      subjectId={subject_id}
      stageSize={10}
      onComplete={() => alert("🎉 퀴즈 완료!")}
    />
  );
}
