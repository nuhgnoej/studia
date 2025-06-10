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
      await initDatabase();
      await db.runAsync(`DELETE FROM questions`);
      await loadQuestionsFromFile(filename);
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
