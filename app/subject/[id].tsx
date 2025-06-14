import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { getDatabase } from "@/lib/db";
import { questionFileMap } from "@/lib/questionFileMap";

type Subject = {
  name: string;
};

export default function SubjectStartScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    loadSubjectData();
  }, [id]);

  const loadSubjectData = async () => {
    try {
      const db = await getDatabase();
      
      // 과목 정보 가져오기
      const subject = await db.getFirstAsync<Subject>(
        "SELECT name FROM subjects WHERE id = ?",
        [id as string]
      );

      // 문제 세트에서 문제 수 가져오기
      const entry = questionFileMap[id as keyof typeof questionFileMap];
      const count = entry?.data.length || 0;

      if (subject) {
        setSubjectName(subject.name);
      }
      setQuestionCount(count);
    } catch (error) {
      console.error("과목 데이터 로딩 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      // 문제 세트 로드
      const entry = questionFileMap[id as keyof typeof questionFileMap];
      if (!entry) {
        throw new Error("문제 세트를 찾을 수 없습니다.");
      }

      // 현재 선택된 과목의 타입 확인 (파일명에서 추출)
      const isSubjective = (id as string).includes("주관식");
      
      // 해당 타입의 첫 번째 문제 찾기
      const firstQuestion = entry.data.find(q => q.type === (isSubjective ? "subjective" : "objective"));
      if (!firstQuestion) {
        throw new Error(`${isSubjective ? "주관식" : "객관식"} 문제가 없습니다.`);
      }

      // 과목 ID와 문제 ID를 함께 전달
      router.push(`/(tabs)/question?subjectId=${id}&questionId=${firstQuestion.id}`);
    } catch (error) {
      console.error("문제 시작 에러:", error);
      alert(error instanceof Error ? error.message : "문제를 시작할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  const objectiveCount = questionFileMap[id as keyof typeof questionFileMap]?.data.filter(q => q.type === "objective").length || 0;
  const subjectiveCount = questionFileMap[id as keyof typeof questionFileMap]?.data.filter(q => q.type === "subjective").length || 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: subjectName || "과목 선택",
          headerBackTitle: "뒤로",
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{subjectName}</Text>
          <Text style={styles.subtitle}>학습을 시작해보세요</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>문제 현황</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{questionCount}</Text>
                <Text style={styles.statLabel}>전체 문제</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{objectiveCount}</Text>
                <Text style={styles.statLabel}>객관식</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{subjectiveCount}</Text>
                <Text style={styles.statLabel}>주관식</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.startButton]}
            onPress={handleStart}
            disabled={loading}
          >
            <FontAwesome name="play" size={24} color="white" />
            <Text style={styles.buttonText}>학습 시작</Text>
            <Text style={styles.buttonSubtext}>
              {questionCount}문제
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 24,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "#666",
  },
  statsContainer: {
    padding: 16,
    gap: 16,
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },
  buttonSubtext: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
  },
}); 