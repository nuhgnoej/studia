// app/subject/[filename]/index.tsx

import { getQuestionCountBySubjectId, initDatabase } from "@/lib/db";
import { loadQuestionsFromFile } from "@/lib/loadQuestionsFromFile";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { questionFileMap } from "@/lib/questionFileMap";
import MetadataCard from "@/components/MetadataCard";


export default function SubjectStartScreen() {
  const router = useRouter();
  const { filename, name } = useLocalSearchParams();
  const navigation = useNavigation();

  const [count, setCount] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const meta = questionFileMap[filename as string]?.data?.metadata;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "시작화면",
    });
  }, [navigation, filename]);

  const fetchCount = async () => {
    const result = await getQuestionCountBySubjectId(filename as string);
    setCount(result);
  };

  useEffect(() => {
    fetchCount();
  }, [filename]);

  const handleInitBtn = async () => {
    try {
      setIsUploading(true);
      await initDatabase();
      await fetchCount();
      Alert.alert("✅ 초기화 완료", "문제 수가 초기화되었습니다.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadBtn = async () => {
    try {
      setIsUploading(true);
      await loadQuestionsFromFile(filename as string);
      await fetchCount();
      Alert.alert("✅ 업로드 완료", "문제 세트가 성공적으로 업로드되었습니다.");
    } catch (e: any) {
      console.error(e);
      Alert.alert(
        "❌ 업로드 실패",
        e.message || "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>총 문제 수: {count ?? "..."}</Text>
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push(`/subject/${filename}/quiz`)}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🚀 문제 풀기 시작</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.wrongOnlyButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push(`/subject/${filename}/quiz?mode=wrong`)}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>❌ 틀린 문제만</Text>
          )}
        </Pressable>

        <View style={styles.rowButtonGroup}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.warningButton,
              styles.halfButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleInitBtn}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🧹 초기화</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              styles.halfButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleUploadBtn}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>📥 업로드</Text>
            )}
          </Pressable>
        </View>
      </View>
      <View>
        <MetadataCard meta={meta} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 40,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  rowButtonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  button: {
    backgroundColor: "#2563eb", // 메인 파란색
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#374151", // 회색톤 (업로드용)
  },
  warningButton: {
    backgroundColor: "#eab308", // 노란색 (초기화용)
  },
  wrongOnlyButton: {
    backgroundColor: "#f97316", // 오렌지 (틀린 문제용)
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
