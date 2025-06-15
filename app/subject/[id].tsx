// app/(tabs)/question.tsx
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getDatabase, insertAnswer } from "@/lib/db";
import ObjectiveQuestion from "@/components/ObjectiveQuestion";
import SubjectiveQuestion from "@/components/SubjectiveQuestion";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { loadQuestionsFromFile } from "@/lib/loadQuestionsFromFile";
import { Question } from "@/lib/types";

export default function QuestionScreen() {
  const { filename, questionId } = useLocalSearchParams();
  const router = useRouter();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (!filename) {
      Alert.alert("오류", "유효하지 않은 접근입니다.", [
        { text: "확인", onPress: () => router.replace("/") },
      ]);
    }
  }, [filename]);

  useEffect(() => {
    loadQuestion();
  }, [filename, questionId]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      const db = await getDatabase();

      const count = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM questions WHERE subject_id = ?",
        [filename as string]
      );

      if (!count || count.count === 0) {
        try {
          await loadQuestionsFromFile(filename as string);
        } catch (error) {
          console.error("문제 세트 로드 에러:", error);
          setNotFound(true);
          return;
        }
      }

      const q = await db.getFirstAsync<Question>(
        "SELECT * FROM questions WHERE id = ? AND subject_id = ?",
        [Number(questionId), filename as string]
      );

      const updatedCount = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM questions WHERE subject_id = ?",
        [filename as string]
      );
      setTotalCount(updatedCount?.count || 0);

      if (!q) {
        setNotFound(true);
      } else {
        if (typeof q.choices === "string") q.choices = JSON.parse(q.choices);
        if (typeof q.answer === "string") q.answer = JSON.parse(q.answer);
        setQuestion(q);
      }
    } catch (error) {
      console.error("문제 로딩 에러:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!question) return;
    setUserAnswer(answer);
    const isCorrect = answer === "know";

    try {
      await insertAnswer({
        question_id: Number(questionId),
        subject_id: filename as string,
        user_answer: answer,
        is_correct: isCorrect,
      });

      if (answer === "dont_know") {
        setShowAnswer(true);
      } else {
        setShowAnswer(false);
        const db = await getDatabase();
        const nextQuestion = await db.getFirstAsync<Question>(
          "SELECT * FROM questions WHERE id > ? AND subject_id = ? AND type = ? ORDER BY id ASC LIMIT 1",
          [Number(questionId), filename as string, question.type]
        );
        if (nextQuestion) {
          router.replace(
            `/(tabs)/question?filename=${filename}&questionId=${nextQuestion.id}`
          );
        } else {
          router.push("/(tabs)/analytics");
        }
      }
    } catch (error) {
      console.error("답변 저장 에러:", error);
      alert("답변을 저장하는 중 오류가 발생했습니다.");
    }
  };

  const handleNext = async () => {
    if (!question) return;
    setShowAnswer(false);
    setUserAnswer(null);
    try {
      const db = await getDatabase();
      const nextQuestion = await db.getFirstAsync<Question>(
        "SELECT * FROM questions WHERE id > ? AND subject_id = ? AND type = ? ORDER BY id ASC LIMIT 1",
        [Number(questionId), filename as string, question.type]
      );
      if (nextQuestion) {
        router.replace(
          `/(tabs)/question?filename=${filename}&questionId=${nextQuestion.id}`
        );
      } else {
        router.push("/(tabs)/analytics");
      }
    } catch (error) {
      console.error("다음 문제 로딩 에러:", error);
      alert("다음 문제를 불러오는 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <Text style={styles.centered}>로딩 중...</Text>;
  if (notFound)
    return <Text style={styles.centered}>존재하지 않는 문제입니다.</Text>;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.questionSection}>
          <Text style={styles.metaText}>
            문제 {questionId} ·{" "}
            {question?.type === "objective" ? "객관식" : "주관식"}
          </Text>
          {question?.type === "objective" ? (
            <ObjectiveQuestion
              question={question}
              onAnswer={handleAnswer}
              showAnswer={showAnswer}
            />
          ) : (
            <SubjectiveQuestion
              question={question}
              onAnswer={handleAnswer}
              showAnswer={showAnswer}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonSection}>
        <View style={styles.answerButtons}>
          <Pressable
            style={[styles.answerButton, styles.knowButton]}
            onPress={() => handleAnswer("know")}
          >
            <Text style={styles.answerButtonText}>알아요</Text>
          </Pressable>
          <Pressable
            style={[styles.answerButton, styles.dontKnowButton]}
            onPress={() => handleAnswer("dont_know")}
          >
            <Text style={styles.answerButtonText}>모르겠어요</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={showAnswer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAnswer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>정답</Text>
            <View style={styles.answerContent}>
              <Text style={styles.answerLabel}>정답:</Text>
              <Text style={styles.answerText}>
                {Array.isArray(question?.answer)
                  ? question.answer.join(", ")
                  : question?.answer}
              </Text>
              {question?.explanation && (
                <>
                  <Text style={styles.answerLabel}>설명:</Text>
                  <Text style={styles.explanationText}>
                    {question.explanation}
                  </Text>
                </>
              )}
            </View>
            <Pressable
              style={[styles.modalButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={styles.modalButtonText}>
                {totalCount && Number(questionId) < totalCount
                  ? "다음 문제"
                  : "분석 화면으로"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  questionSection: { gap: 12 },
  buttonSection: { padding: 16, gap: 16 },
  answerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  answerButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  knowButton: { backgroundColor: "#4CAF50" },
  dontKnowButton: { backgroundColor: "#F44336" },
  answerButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  metaText: { fontSize: 16, color: "#666", marginBottom: 8 },
  centered: { textAlign: "center", marginTop: 100, fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  answerContent: { gap: 12, marginBottom: 20 },
  answerLabel: { fontSize: 16, fontWeight: "600", color: "#666" },
  answerText: { fontSize: 18, color: "#333", marginBottom: 8 },
  explanationText: { fontSize: 16, color: "#666", lineHeight: 24 },
  modalButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  nextButton: { justifyContent: "center" },
});
