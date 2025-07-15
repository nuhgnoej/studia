// app/quiz/[id].tsx

import ErrorMessage from "@/components/ErrorMessage"; // 에러 컴포넌트 (있다면)
import Loading from "@/components/Loading"; // 로딩 스피너 컴포넌트 (있다면)
import StageQuiz from "@/components/StageQuiz";
import getWrongAnsweredQuestionsBySubjectId, { getQuestionsBySubjectId } from "@/lib/db/query";
import { Question } from "@/lib/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";

export default function QuizScreen() {
  const { subjectId,mode } = useLocalSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    useEffect(() => {
        if (!subjectId) return;
        try {
            
            const load = async () => {
      const data =
        mode === "wrong"
          ? await getWrongAnsweredQuestionsBySubjectId(subjectId as string)
          : await getQuestionsBySubjectId(subjectId as string);
      setQuestions(data);
    };
    load();
        } catch(err) {
            console.error(err);
            setError("문제를 불러오지 못했습니다.");
        } finally {
setLoading(false);
        }
    
  }, [subjectId,mode]);

//   useEffect(() => {
//     if (!subjectId) return;

//     getQuestionsBySubjectId(subjectId as string)
//       .then(setQuestions)
//       .catch((err) => {
//         console.error(err);
//         setError("문제를 불러오지 못했습니다.");
//       })
//       .finally(() => setLoading(false));
//   }, [subjectId]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (questions.length === 0) return <Text>해당 세트에 문제가 없습니다.</Text>;

  return (
    <StageQuiz
      questions={questions}
      subjectId={subjectId as string}
      stageSize={10}
      onComplete={() => alert("🎉 퀴즈 완료!")}
    />
  );
}
