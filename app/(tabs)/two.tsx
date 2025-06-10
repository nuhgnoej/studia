// app/(tabs)/two.tsx
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { View, Text } from "@/components/Themed";
import { getAllQuestions, initDatabase } from "@/lib/db";
import { Question } from "@/lib/types";
import { loadDummyQuestions } from "@/lib/loadDummy";

export default function TabTwoScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  //  useEffect(() => {
  //     (async () => {
  //       await initDatabase();
  //       await loadDummyQuestions(); // 더미 삽입
  //     })();
  //   }, []);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        await loadDummyQuestions(); // 더미 삽입
        const result = await getAllQuestions();
        const parsed: Question[] = result.map((q: any) => ({
          ...q,
          choices: q.choices ? JSON.parse(q.choices) : [],
        }));
        setQuestions(parsed);
      } catch (e) {
        console.error("문제 불러오기 실패", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>`문제 목록({questions.length})`</Text>

      {loading && <ActivityIndicator size="large" color="#888" />}

      {!loading && questions.length === 0 && (
        <Text style={styles.emptyText}>아직 입력된 문제가 없습니다. 😢</Text>
      )}

      {!loading &&
        questions.map((q) => (
          <View key={q.id} style={styles.questionBox}>
            <Text style={styles.question}>{q.question}</Text>
            {q.type === "objective" &&
              q.choices?.map((c, i) => (
                <Text key={i} style={styles.choice}>
                  • {c}
                </Text>
              ))}
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 24,
    textAlign: "center",
  },
  questionBox: { marginBottom: 24 },
  question: { fontSize: 16, marginBottom: 8 },
  choice: { marginLeft: 12, fontSize: 14, color: "#666" },
});
