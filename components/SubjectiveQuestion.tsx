import { Question } from "../lib/types";
import { useState } from "react";
import { Text, View, TextInput, Pressable, StyleSheet } from "react-native";

export default function SubjectiveQuestion({
  question,
  onSubmit,
  isAnswered,
}: {
  question: Question;
  onSubmit: (answer: string, isCorrect: boolean, autoNext: boolean) => void;
  isAnswered: boolean;
}) {
  const [input, setInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleFinalSubmit = (isCorrect: boolean) => {
    onSubmit(input.trim(), isCorrect, true);
    setShowAnswer(false);
  };

  return (
    <View>
      {/* 문제 텍스트 */}
      <Text style={styles.questionText}>{question.question.questionText}</Text>
      {question.question.questionExplanation && (
        <View style={styles.questionExplanationBox}>
          {(Array.isArray(question.question.questionExplanation)
            ? question.question.questionExplanation
            : [question.question.questionExplanation]
          ).map((line, idx) => (
            <Text key={idx} style={styles.questionExplanationText}>
              {line}
            </Text>
          ))}
        </View>
      )}

      {/* 사용자 입력 */}
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="정답을 입력하세요"
        editable={!isAnswered && !showAnswer}
      />

      {/* 정답 보기 버튼 */}
      {!showAnswer && (
        <Pressable style={styles.primaryButton} onPress={handleRevealAnswer}>
          <Text style={styles.primaryButtonText}>정답 보기</Text>
        </Pressable>
      )}

      {/* 정답 피드백 + 정답/오답 버튼 */}
      {showAnswer && (
        <View style={styles.feedbackBox}>
          <Text style={styles.answerLabel}>정답</Text>
          <Text style={styles.answerText}>{question.answer.answerText}</Text>
          <Text>{question.answer.answerExplanation}</Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.resultButton, { backgroundColor: "#4CAF50" }]}
              onPress={() => handleFinalSubmit(true)}
            >
              <Text style={styles.resultButtonText}>정답으로 처리</Text>
            </Pressable>
            <Pressable
              style={[styles.resultButton, { backgroundColor: "#F44336" }]}
              onPress={() => handleFinalSubmit(false)}
            >
              <Text style={styles.resultButtonText}>오답으로 처리</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* 이미 제출된 경우 */}
      {isAnswered && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackText}>답안이 제출되었습니다.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  feedbackBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  answerLabel: {
    fontWeight: "600",
    marginBottom: 4,
  },
  answerText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  explanationText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  resultButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  resultButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  feedbackText: {
    fontSize: 16,
    color: "#555",
  },
  questionExplanationBox: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  questionExplanationText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
});
