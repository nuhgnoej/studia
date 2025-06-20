import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { getAnswersBySubjectId, resetAnswerDatabase } from "@/lib/db";
import { questionFileMap } from "@/lib/questionFileMap";
import { AnswerRecord } from "@/lib/types";

export default function AnalyticsScreen() {
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  type QuestionStats = {
    question_id: number;
    count: number;
    correctCount: number;
    accuracy: number;
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
    setQuestionStats(aggregateStats(results));
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
            style={styles.button}
            onPress={() => handlePress(filename)}
          >
            <Text style={styles.buttonText}>{name}</Text>
          </Pressable>
        ))}
      </View>

      {hasLoaded ? (
        questionStats.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.subtitle}>문제별 정답 통계</Text>
            {questionStats.map((q) => (
              <View key={q.question_id} style={styles.statBox}>
                <Text style={styles.statText}>📘 문제 ID: {q.question_id}</Text>
                <Text style={styles.statText}>
                  시도: {q.count}회 / 정답: {q.correctCount}회
                </Text>
                <Text style={styles.statText}>
                  정답률: {(q.accuracy * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text>풀이 이력이 없습니다.</Text>
        )
      ) : null}
      {/* 초기화 버튼 */}
      <Pressable
        style={styles.resetButton}
        onPress={async () => {
          await resetAnswerDatabase();
          setQuestionStats([]);
          setHasLoaded(false);
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
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
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
});
