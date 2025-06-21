// components/StageSummary.tsx

import { getAnswerSummaryByQuestionIds } from "@/lib/db";
import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

type Props = {
  stageNumber: number;
  subjectId: string;
  questionIds: number[];
  onContinue: () => void;
};

type Stat = {
  question_id: number;
  count: number;
  correct_count: number;
};

export default function StageSummary({
  stageNumber,
  subjectId,
  questionIds,
  onContinue,
}: Props) {
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const result = await getAnswerSummaryByQuestionIds(
        subjectId,
        questionIds
      );
      setStats(result);
      setIsLoading(false);
    };
    loadStats();
  }, [subjectId, questionIds]);

  const totalAnswered = stats.reduce((sum, s) => sum + s.count, 0);
  const totalCorrect = stats.reduce((sum, s) => sum + s.correct_count, 0);
  const accuracy = totalAnswered > 0 ? totalCorrect / totalAnswered : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ {stageNumber}단계 완료!</Text>
      <Text style={styles.summaryText}>총 풀이: {totalAnswered}문제</Text>
      <Text style={styles.summaryText}>정답 수: {totalCorrect}개</Text>
      <Text style={styles.summaryText}>
        정답률: {(accuracy * 100).toFixed(1)}%
      </Text>
      <Button title="다음 단계로" onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
  },
});
