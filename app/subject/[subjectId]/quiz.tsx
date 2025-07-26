// app/quiz/[id].tsx

import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";

import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import StageQuiz from "@/components/StageQuiz";

import getWrongAnsweredQuestionsBySubjectId, {
  getQuestionsBySubjectId,
} from "@/lib/db/query";
import { Question } from "@/lib/types";

// string param 안정성 보장 함수
function getStringParam(param: unknown): string | undefined {
  return typeof param === "string" ? param : undefined;
}

export default function QuizScreen() {
  const { subjectId: rawSubjectId, mode: rawMode } = useLocalSearchParams();
  const subjectId = getStringParam(rawSubjectId);
  const mode = getStringParam(rawMode);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subjectId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data =
          mode === "wrong"
            ? await getWrongAnsweredQuestionsBySubjectId(subjectId)
            : await getQuestionsBySubjectId(subjectId);
        setQuestions(data);
      } catch (err) {
        console.error(err);
        setError("문제를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [subjectId, mode]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (questions.length === 0)
    return <Text>해당 세트에 문제가 없습니다.</Text>;
  if (!subjectId) return <ErrorMessage message="잘못된 접근입니다." />;

  return (
    <StageQuiz
      questions={questions}
      subjectId={subjectId}
      stageSize={10}
      onComplete={() => alert("🎉 퀴즈 완료!")}
    />
  );
}
