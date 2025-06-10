import { getAllQuestions, initDatabase } from "@/lib/db";
import { Question } from "@/lib/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Text, View, StyleSheet } from "react-native";
import { questionFileMap } from "@/lib/questionFileMap";
import { loadQuestionsFromFile } from "@/lib/loadQuestionsFromFile";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("studiaDatabase");

export default function IndexScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSetAndStart = async (filename: string) => {
    try {
      setLoading(true);
      await initDatabase(); // 데이터베이스 생성
      // await db.runAsync(`DELETE FROM questions`); // 기존 데이터베이스 삭제
      await loadQuestionsFromFile(filename); // QuestionFileMap 파일에서 파일명 읽어오기
      const loaded = await getAllQuestions();
      setQuestions(loaded);
      router.push({ pathname: "/two", params: { id: "1" } });
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
            title={entry.name}
            onPress={() => loadSetAndStart(filename)}
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
          onPress={() => router.push("/analytics")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  buttonWrapper: {
    marginVertical: 4,
  },
  countText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
  },
  loading: {
    marginTop: 16,
    fontSize: 16,
    color: "gray",
  },
});
