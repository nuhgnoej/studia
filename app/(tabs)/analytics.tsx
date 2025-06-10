// app/(tabs)/analytics.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { getDatabase } from "@/lib/db";

type Row = {
  id: number;
  question: string;
  total_attempts: number;
  correct_count: number;
  weight: number;
};

export default function AnalyticsScreen() {
  const [data, setData] = useState<Row[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        const db = await getDatabase();
        const rows = await db.getAllAsync<Row>(`
        SELECT id, question, total_attempts, correct_count,weight
        FROM questions
        WHERE total_attempts > 0
        ORDER BY total_attempts DESC
      `);
        setData(rows);
      };

      fetchStats();
    }, [])
  );

  const renderAccuracy = (row: Row) => {
    const ratio = row.correct_count / row.total_attempts;
    const percent = (ratio * 100).toFixed(1);
    const mastered = ratio >= 0.8 && row.total_attempts >= 3;
    return (
      <View key={row.id} style={styles.card}>
        <Text style={styles.question}>{row.question}</Text>
        <Text style={styles.item}>시도 횟수: {row.total_attempts}</Text>
        <Text style={styles.item}>정답 수: {row.correct_count}</Text>
        <Text style={styles.item}>가중치: {row.weight}</Text>
        <Text style={styles.item}>
          정답률: {percent}% {mastered ? "✅ 숙달됨" : "🔁 학습 중"}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📘 문제별 학습 현황</Text>
      {data.length > 0 ? data.map(renderAccuracy) : <Text>불러오는 중...</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
  },
});
