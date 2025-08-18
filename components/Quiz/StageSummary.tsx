// components/StageSummary.tsx

import { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { AnswerStats } from "@/lib/types";
import {
  getAnswerStatsForQuestions,
  getCorrectAnswerByQuestionAndSubjectId,
} from "@/lib/db/util";
import { useRouter } from "expo-router";

type Props = {
  stageNumber: number;
  subjectId: string;
  questionIds: number[];
  onContinue: () => void;
  onRetry: () => void;
};

type EnrichedAnswerStats = AnswerStats & { correct_answer: string };

export default function StageSummary({
  stageNumber,
  subjectId,
  questionIds,
  onContinue,
  onRetry,
}: Props) {
  const router = useRouter();
  const [stats, setStats] = useState<EnrichedAnswerStats[] | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("📥 Loading stats...");
        console.log("📥 subjectId:", subjectId);
        console.log("📥 questionIds:", questionIds);

        const baseStats = await getAnswerStatsForQuestions(
          subjectId,
          questionIds
        );
        console.log("📊 baseStats:", baseStats);

        const enrichedStats = await Promise.all(
          baseStats.map(async (s) => {
            try {
              const correctAnswer =
                await getCorrectAnswerByQuestionAndSubjectId(
                  subjectId,
                  s.question_id
                );
              return {
                ...s,
                correct_answer: correctAnswer ?? "정답 없음",
              };
            } catch (err) {
              console.error("❌ 정답 로딩 실패:", err);
              return { ...s, correct_answer: "에러" };
            }
          })
        );

        console.log("✅ enrichedStats:", enrichedStats);
        setStats(enrichedStats);
      } catch (e) {
        console.error("🔥 fetchStats 실패:", e);
      }
    };

    fetchStats();
  }, [subjectId, questionIds]);

  if (!stats) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>📊 통계를 불러오는 중...</Text>
      </View>
    );
  }

  const totalAttempts = stats.reduce((sum, s) => sum + s.total_attempts, 0);
  const correct = stats.reduce((sum, s) => sum + s.correct_attempts, 0);
  const accuracy = totalAttempts > 0 ? (correct / totalAttempts) * 100 : 0;

  const handleQuizComplete = () => {
    Alert.alert("중단하기", "수고하셨습니다. 홈으로 이동할까요?", [
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
    <View style={styles.container}>
      <Text style={styles.title}>✅ {stageNumber}단계 완료!</Text>
      <Text style={styles.summaryText}>총 시도 횟수: {totalAttempts}</Text>
      <Text style={styles.summaryText}>총 정답 수: {correct}</Text>
      <Text style={styles.summaryText}>정답률: {accuracy.toFixed(1)}%</Text>

      <View style={styles.divider} />

      {stats.map((s) => {
        const normalize = (text: string) => text?.trim().replace(/^"|"$/g, "");

        const isCorrect =
          normalize(s.latest_answer) === normalize(s.correct_answer);

        // console.log(`[문제 ${s.question_id}]`);
        // console.log("latest_answer:", `"${s.latest_answer}"`);
        // console.log("correct_answer:", `"${s.correct_answer}"`);
        // console.log("normalized latest:", normalize(s.latest_answer));
        // console.log("normalized correct:", normalize(s.correct_answer));
        // console.log("isCorrect:", isCorrect);

        return (
          <View key={s.question_id} style={styles.statBox}>
            <Text style={styles.questionId}>
              📘 문제 {s.question_id} {isCorrect ? "⭕" : "❌"}
            </Text>
            <Text style={styles.statText}>
              시도: {s.total_attempts}회 / 정답: {s.correct_attempts}회
            </Text>
            <Text style={styles.statText}>
              최근 응답:{" "}
              <Text
                style={{
                  color: isCorrect ? "#10b981" : "#ef4444", // 정답이면 초록, 오답이면 빨강
                  fontWeight: "bold",
                }}
              >
                {s.latest_answer}
              </Text>{" "}
              / 정답: {s.correct_answer}
            </Text>
            <Text style={styles.statText}>
              정답률:{" "}
              {s.total_attempts > 0
                ? ((s.correct_attempts / s.total_attempts) * 100).toFixed(1)
                : "0.0"}
              %
            </Text>
          </View>
        );
      })}

      <View style={styles.buttonContainer}>
        <Button title="다음 단계로" onPress={onContinue} />
        <View style={{ height: 12 }} />
        <Button
          title="이번 단계 다시 도전하기"
          onPress={onRetry}
          color="#f59e0b"
        />
        <View style={{ height: 12 }} />
        <Button
          title="문제 풀기 종료하기"
          onPress={handleQuizComplete}
          color="#f59e0b"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#6b7280",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    width: "100%",
    marginVertical: 16,
  },
  statBox: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 12,
  },
  questionId: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1f2937",
  },
  statText: {
    fontSize: 14,
    color: "#4b5563",
  },
  buttonContainer: {
    marginTop: 24,
    width: "100%",
  },
});
