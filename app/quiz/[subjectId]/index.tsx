import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MetadataCard from "@/components/MetadataCard";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { getMetadataBySubjectId } from "@/lib/db";
import { Metadata } from "../../../lib/types";

export default function SubjectStartScreen() {
  //   const router = useRouter();
  const { subjectId } = useLocalSearchParams();
  const navigation = useNavigation();

  const [meta, setMeta] = useState<Metadata | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "문제 세트",
    });
  }, [navigation]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const data = await getMetadataBySubjectId(subjectId as string);
        console.log(data);
        setMeta(data);
      } catch (e) {
        console.error("문제 수 불러오기 실패:", e);
      }
    };
    fetchMeta();
  }, [subjectId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{meta?.title}</Text>
      <Text style={styles.subtitle}>
        총 문제 수: {meta?.num_questions ?? "..."}
      </Text>

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => Alert.alert("all")}
        >
          <Text style={styles.buttonText}>🚀 문제 풀기 시작</Text>
        </Pressable>

        {/* <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.wrongOnlyButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => goToQuiz("wrong")}
        >
          <Text style={styles.buttonText}>❌ 틀린 문제만</Text>
        </Pressable> */}
      </View>

      {meta && (
        <View style={{ marginTop: 24, width: "100%" }}>
          <MetadataCard meta={meta} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  wrongOnlyButton: {
    backgroundColor: "#f97316",
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
