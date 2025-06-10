// app/(tabs)/two.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getQuestionById, getQuestionCount } from "@/lib/db";
import ObjectiveQuestion from "@/components/ObjectiveQuestion";
import SubjectiveQuestion from "@/components/SubjectiveQuestion";
import { View, Text, Button, StyleSheet } from "react-native";
import { Question } from "@/lib/types";

export default function QuestionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const questionId = Number(id);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);

      const q = await getQuestionById(questionId);
      const count = await getQuestionCount();
      setTotalCount(count);

      if (!q) {
        setNotFound(true);
      } else {
        setQuestion(q);
      }

      setLoading(false);
    })();
  }, [questionId]);

  if (loading) return <Text style={styles.centered}>로딩 중...</Text>;
  if (notFound)
    return <Text style={styles.centered}>존재하지 않는 문제입니다.</Text>;

  return (
    <View style={styles.container}>
      {/* 문제 표시 영역 */}
      <View style={styles.questionSection}>
        <Text style={styles.metaText}>
          문제 {questionId} · {question?.type}
        </Text>
        {question!.type === "objective" ? (
          <ObjectiveQuestion question={question!} />
        ) : (
          <SubjectiveQuestion question={question!} />
        )}
      </View>

      {/* 하단 버튼 영역 */}
      <View style={styles.buttonSection}>
        {totalCount && questionId < totalCount ? (
          <Button
            title="다음 문제"
            onPress={() => router.replace(`/two?id=${questionId + 1}`)}
          />
        ) : (
          <Button
            title="완료 - 홈으로 돌아가기"
            onPress={() => router.push("/")}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  questionSection: {
    flexGrow: 1,
    gap: 12,
  },
  buttonSection: {
    paddingTop: 24,
    paddingBottom: 8,
  },
  metaText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  centered: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
  },
});
