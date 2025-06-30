import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import {
  getAnswersBySubjectId,
  getQuestionsBySubjectId,
  getWeightsBySubjectId,
  resetAnswerDatabase,
} from "@/lib/db";
import { questionFileMap } from "@/lib/questionFileMap";
import { AnswerRecord } from "@/lib/types";

export default function AnalyticsScreen() {
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [overallStats, setOverallStats] = useState<{
    totalQuestions: number;
    correctQuestions: number;
    accuracy: number;
  } | null>(null);

  type QuestionStats = {
    question_id: number;
    count: number;
    correctCount: number;
    accuracy: number;
    weight?: number;
  };

  const aggregateStats = (records: AnswerRecord[]): QuestionStats[] => {
    const statsMap = new Map<number, { count: number; correct: number }>();

    for (const rec of records) {
      const { question_id, is_correct } = rec;
      if (!statsMap.has(question_id)) {
        statsMap.set(question_id, { count: 0, correct: 0 });
      }
      const stat = statsMap.get(question_id)!;
      stat.count += 1;
      if (is_correct) stat.correct += 1;
    }

    return Array.from(statsMap.entries()).map(
      ([question_id, { count, correct }]) => ({
        question_id,
        count,
        correctCount: correct,
        accuracy: count > 0 ? correct / count : 0,
      })
    );
  };

  const handlePress = async (filename: string) => {
    const results = await getAnswersBySubjectId(filename);
    const stats = aggregateStats(results);

    const weightMap = await getWeightsBySubjectId(filename);

    const merged = stats.map((q) => ({
      ...q,
      weight: weightMap.get(q.question_id) ?? 1.0,
    }));

    // 🔥 전체 문제 목록 조회
    const questions = await getQuestionsBySubjectId(filename);
    const totalQuestions = questions.length;

    // 🔥 문제별 최신 정답 상태 계산
    const latestCorrectQuestions = questions.filter((q) => {
      const stat = merged.find((s) => s.question_id === q.id);
      return stat ? stat.accuracy === 1 : false; // 최근 기준 정답이면 카운트
    }).length;

    const accuracy =
      totalQuestions > 0 ? latestCorrectQuestions / totalQuestions : 0;

    setQuestionStats(merged);
    setOverallStats({
      totalQuestions,
      correctQuestions: latestCorrectQuestions,
      accuracy,
    });
    setHasLoaded(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <FontAwesome name="bar-chart" size={28} style={styles.icon} />
        <Text style={styles.title}>학습 분석</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>과목 선택</Text>
        {Object.entries(questionFileMap).map(([filename, { name }]) => (
          <Pressable
            key={filename}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => handlePress(filename)}
          >
            <Text style={styles.buttonText}>{name}</Text>
          </Pressable>
        ))}
      </View>

      {hasLoaded && overallStats ? (
        <View style={styles.section}>
          <Text style={styles.subtitle}>과목 전체 통계</Text>
          <View style={styles.statBox}>
            <Text style={styles.statText}>
              📊 맞춘 문제 수: {overallStats.correctQuestions} /{" "}
              {overallStats.totalQuestions}
            </Text>
            <Text style={styles.statText}>
              ✅ 정답률: {(overallStats.accuracy * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      ) : null}

      {hasLoaded ? (
        questionStats.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.subtitle}>문제별 정답 통계</Text>
            {questionStats.map((q) => (
              <View style={styles.statBox} key={q.question_id}>
                <Text style={styles.statText}>📘 문제 ID: {q.question_id}</Text>
                <Text style={styles.statText}>
                  시도: {q.count}회 / 정답: {q.correctCount}회
                </Text>
                <Text style={styles.statText}>
                  정답률: {(q.accuracy * 100).toFixed(1)}%
                </Text>
                <Text style={styles.statText}>
                  가중치: {q.weight!.toFixed(3)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyMessageContainer}>
            <Text style={styles.emptyMessageText}>풀이 이력이 없습니다.</Text>
          </View>
        )
      ) : null}
      {/* 초기화 버튼 */}
      <Pressable
        style={styles.resetButton}
        onPress={async () => {
          await resetAnswerDatabase();
          setQuestionStats([]);
          setHasLoaded(false);
          setOverallStats(null);
          alert("통계 데이터가 초기화되었습니다.");
        }}
      >
        <Text style={styles.resetButtonText}>
          📛 분석데이터 초기화 (개발자용)
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#e5e7eb", // Tailwind의 gray-200에 해당
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1", // Tailwind의 gray-300
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
  },
  statBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  statText: {
    fontSize: 15,
    color: "#444",
  },
  resetButton: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.85,
    backgroundColor: "#d1d5db", // gray-300 (눌렀을 때 더 어두운 회색)
  },
  emptyMessageContainer: {
    alignItems: "center", // 수평 가운데
    justifyContent: "center", // 수직 가운데 (추가하려면 height 필요)
    paddingVertical: 40, // 위아래 여백
  },
  emptyMessageText: {
    fontSize: 16,
    color: "#888",
  },
});
