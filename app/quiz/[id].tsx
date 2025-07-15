// app/quiz/[id].tsx

import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { useEffect, useState } from "react";
import StageQuiz from "@/components/StageQuiz";
import { getQuestionsBySubjectId } from "@/lib/db/query";
import Loading from "@/components/Loading"; // 로딩 스피너 컴포넌트 (있다면)
import ErrorMessage from "@/components/ErrorMessage"; // 에러 컴포넌트 (있다면)
import { Question } from "../../lib/types";

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    getQuestionsBySubjectId(id)
      .then(setQuestions)
      .catch((err) => {
        console.error(err);
        setError("문제를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (questions.length === 0) return <Text>해당 세트에 문제가 없습니다.</Text>;

  return (
    <StageQuiz
      subjectId={id}
      questions={questions}
      onComplete={() => {
        // 👇 완료 후 이동 (필요 시)
        console.log("퀴즈 완료!");
      }}
    />
  );
}
