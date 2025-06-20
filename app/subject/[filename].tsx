import { getQuestionCountBySubjectId } from "@/lib/db";
import { loadQuestionsFromFile } from "@/lib/loadQuestionsFromFile";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

export default function SubjectStartScreen() {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);
  const { filename } = useLocalSearchParams();

  // json -> db 문제 업로딩
  useEffect(() => {
    const fetchQuestion = async () => {
      await loadQuestionsFromFile(filename as string);
    };
    fetchQuestion();
  }, [filename]);

  // 문제 세트 숫자 카운팅
  useEffect(() => {
    const fetchCount = async () => {
      const result = await getQuestionCountBySubjectId(filename as string);
      setCount(result);
    };
    fetchCount();
  }, [filename]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>과목: {filename}</Text>
      <Text style={styles.subtitle}>총 문제 수: {count ?? "..."}</Text>
      <Pressable
        style={styles.button}
        onPress={() => {
          router.push(
            `/subject/${filename}/quiz`
          );
        }}
      >
        <Text style={styles.buttonText}>문제 풀기 시작</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
