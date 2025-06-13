import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Button, Text, View, StyleSheet } from "react-native";
import { questionFileMap } from "@/lib/questionFileMap";
import { loadQuestionsFromFile } from "@/lib/loadQuestionsFromFile";
import { getDatabase } from "@/lib/db";

export default function IndexScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 앱 최초 실행 시 데이터베이스 테이블 존재 여부 확인
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const db = await getDatabase();
        const tableCheck = await db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='questions'"
        );
        
        if (!tableCheck || tableCheck.count === 0) {
          // 테이블이 없을 경우에만 초기화
          const { initDatabase } = require("@/lib/db");
          await initDatabase();
        }
      } catch (error) {
        console.error("데이터베이스 확인 중 오류:", error);
      }
    };
    
    checkDatabase();
  }, []);

  const loadSetAndNavigate = async (filename: string) => {
    try {
      setLoading(true);
      await loadQuestionsFromFile(filename); // 문제 세트 로드
      // 과목 시작 페이지로 이동
      router.push({
        pathname: "/subject/[id]",
        params: { id: filename }
      });
    } catch (e) {
      console.error("문제 세트 로드 실패", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>문제 세트를 선택하세요</Text>

      {Object.entries(questionFileMap).map(([filename, entry], idx) => (
        <View key={idx} style={styles.buttonWrapper}>
          <Button
            title={`${entry.name} (${entry.data.length}문제)`}
            onPress={() => loadSetAndNavigate(filename)}
            disabled={loading}
          />
        </View>
      ))}

      {loading && <Text style={styles.loading}>불러오는 중...</Text>}

      <View style={{ marginTop: 40 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          📊 나의 풀이 기록
        </Text>
        <Button
          title="풀이 결과 분석 보기"
          onPress={() => router.push("/(tabs)/analytics")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonWrapper: {
    marginBottom: 12,
  },
  loading: {
    textAlign: "center",
    marginTop: 12,
    color: "#666",
  },
});
