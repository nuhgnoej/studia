// app/subject/[subjectId]/quiz.tsx

import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Alert, Text } from "react-native";

import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import StageQuiz from "@/components/Quiz/StageQuiz";

import getWrongAnsweredQuestionsBySubjectId, {
  getQuestionsBySubjectId,
} from "@/lib/db/query";
import { Question } from "@/lib/types";

// string param 안정성 보장 함수
function getStringParam(param: unknown): string | undefined {
  return typeof param === "string" ? param : undefined;
}

export default function QuizScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "문제풀이",
    });
  }, [navigation]);

  const { subjectId: rawSubjectId, mode: rawMode } = useLocalSearchParams();
  const router = useRouter();
  const subjectId = getStringParam(rawSubjectId);
  const mode = getStringParam(rawMode);

  console.log("🧩 Params:", { subjectId, mode });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subjectId) return;

    const load = async () => {
      console.log("🚀 Load started");
      setLoading(true);
      try {
        const data =
          mode === "wrong"
            ? await getWrongAnsweredQuestionsBySubjectId(subjectId)
            : await getQuestionsBySubjectId(subjectId);
        console.log("✅ Loaded questions:", data.length);
        setQuestions(data);
      } catch (err) {
        console.error("❌ Load failed:", err);
        setError("문제를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [subjectId, mode]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (questions.length === 0) return <Text>해당 세트에 문제가 없습니다.</Text>;
  if (!subjectId) return <ErrorMessage message="잘못된 접근입니다." />;

  const handleQuizComplete = () => {
    Alert.alert("🎉 퀴즈 완료!", "수고하셨습니다. 홈으로 이동할까요?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "확인",
        onPress: () => {
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <StageQuiz
      questions={questions}
      subjectId={subjectId}
      stageSize={10}
      onComplete={handleQuizComplete}
      mode={mode === "wrong" ? "wrong" : "normal"}
    />
  );
}
