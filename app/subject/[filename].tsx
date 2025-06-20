// app/subject/[filename]/index.tsx

import { getQuestionCountBySubjectId } from "@/lib/db";
import { loadQuestionsFromFile } from "@/lib/loadQuestionsFromFile";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

export default function SubjectStartScreen() {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);
  const { filename } = useLocalSearchParams();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${filename}`,
    });
  }, [navigation, filename]);

  useEffect(() => {
    const fetchQuestion = async () => {
      await loadQuestionsFromFile(filename as string);
    };
    fetchQuestion();
  }, [filename]);

  useEffect(() => {
    const fetchCount = async () => {
      const result = await getQuestionCountBySubjectId(filename as string);
      setCount(result);
    };
    fetchCount();
  }, [filename]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{filename}</Text>
      <Text style={styles.subtitle}>총 문제 수: {count ?? "..."}</Text>

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            router.push(`/subject/${filename}/quiz`);
          }}
        >
          <Text style={styles.buttonText}>🚀 문제 풀기 시작</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push(`/subject/${filename}/quiz?mode=wrong`)}
        >
          <Text style={styles.buttonText}>❌ 틀린 문제만 풀기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    marginBottom: 36,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    backgroundColor: "#007aff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: "#ff3b30",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
