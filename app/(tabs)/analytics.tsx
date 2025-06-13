// app/(tabs)/analytics.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useEffect, useState } from "react";
import { getDatabase } from "@/lib/db";

type Row = {
  id: number;
  subject_id: string;
  question: string;
  type: string;
  total_attempts: number;
  correct_count: number;
};

export default function AnalyticsScreen() {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchStats = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const db = await getDatabase();
          if (!db) {
            throw new Error("데이터베이스 연결에 실패했습니다.");
          }

          // 먼저 테이블이 존재하는지 확인
          const tableCheck = await db.getFirstAsync<{ count: number }>(
            "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='questions'"
          );

          if (!tableCheck || tableCheck.count === 0) {
            throw new Error("데이터베이스가 초기화되지 않았습니다.");
          }

          const rows = await db.getAllAsync<Row>(`
            SELECT 
              q.id,
              q.subject_id,
              q.question,
              q.type,
              COUNT(a.id) as total_attempts,
              SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
            FROM questions q
            LEFT JOIN answers a ON q.id = a.question_id AND q.subject_id = a.subject_id
            GROUP BY q.id, q.subject_id
            HAVING total_attempts > 0
            ORDER BY total_attempts DESC
          `);

          if (isMounted) {
            setData(rows || []);
          }
        } catch (error) {
          console.error("통계 로딩 에러:", error);
          if (isMounted) {
            setError(error instanceof Error ? error.message : "통계를 불러오는 중 오류가 발생했습니다.");
            Alert.alert(
              "오류",
              "통계를 불러오는 중 문제가 발생했습니다. 앱을 다시 시작해주세요."
            );
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchStats();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const renderAccuracy = (row: Row) => {
    const ratio = row.correct_count / row.total_attempts;
    const percent = (ratio * 100).toFixed(1);
    const mastered = ratio >= 0.8 && row.total_attempts >= 3;
    return (
      <View key={`${row.subject_id}-${row.id}`} style={styles.card}>
        <Text style={styles.question}>{row.question}</Text>
        <Text style={styles.item}>문제 유형: {row.type === "objective" ? "객관식" : "주관식"}</Text>
        <Text style={styles.item}>시도 횟수: {row.total_attempts}</Text>
        <Text style={styles.item}>정답 수: {row.correct_count}</Text>
        <Text style={styles.item}>
          정답률: {percent}% {mastered ? "✅ 숙달됨" : "🔁 학습 중"}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>통계를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📘 문제별 학습 현황</Text>
      {data.length > 0 ? (
        data.map(renderAccuracy)
      ) : (
        <Text style={styles.emptyText}>아직 풀이한 문제가 없습니다.</Text>
      )}
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
  loadingText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "#666",
  },
  errorText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "#F44336",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#666",
  },
});
