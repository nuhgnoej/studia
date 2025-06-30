import { Question } from "@/lib/types";
import { useEffect, useState } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import QuestionTags from "./QuestionTags";

export default function ObjectiveQuestion({
  question,
  onSubmit,
  isAnswered,
  isCorrect,
}: {
  question: Question;
  onSubmit: (answer: string) => void;
  isAnswered: boolean;
  isCorrect: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);

  useEffect(() => {
    if (question.choices) {
      const shuffled = [...question.choices].sort(() => Math.random() - 0.5);
      setShuffledChoices(shuffled);
    }
  }, [question]);

  const handleSelect = (choice: string) => {
    if (isAnswered) return;
    setSelected(choice);
    onSubmit(choice);
  };

  const showFeedback = isAnswered && selected !== null;

  return (
    <View>
      {/* 문제 텍스트 */}
      <Text style={styles.questionText}>{question.question.question}</Text>

      {/* 선택지 렌더링 */}
      {shuffledChoices.map((choice, index) => {
        const isSelected = selected === choice;

        let backgroundColor = "#eee";
        if (isAnswered && isSelected) {
          backgroundColor = isCorrect ? "#bbddc3" : "#f8d7da";
        }

        return (
          <Pressable
            key={index}
            onPress={() => handleSelect(choice)}
            style={[styles.choice, { backgroundColor }]}
          >
            <Text>{choice}</Text>
          </Pressable>
        );
      })}

      {/* 정답/오답 피드백 */}
      {showFeedback && (
        <View style={styles.feedbackBox}>
          <Text
            style={[
              styles.feedbackText,
              { color: isCorrect ? "green" : "red" },
            ]}
          >
            {isCorrect ? "정답입니다!" : "오답입니다!"}
          </Text>
          {question.explanation ? (
            <Text style={styles.explanationText}>{question.explanation}</Text>
          ) : null}
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
  choice: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  feedbackBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: "#555",
  },
});
