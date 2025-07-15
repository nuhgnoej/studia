import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Question } from "../lib/types";
import { useEffect, useState } from "react";


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
      const dummy = "모르겠습니다.";
      const shuffled = [...question.choices].sort(() => Math.random() - 0.5);
      const withDummyLast = [...shuffled, dummy];
      setShuffledChoices(withDummyLast);
    }
  }, [question]);

  const handleSelect = (choice: string) => {
    if (isAnswered) return;
    setSelected(choice);
    onSubmit(choice);
  };

  const showFeedback = isAnswered && selected !== null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 문제 텍스트 */}
      <Text style={styles.questionText}>{question.question.questionText}</Text>
      {question.question.questionExplanation?.length > 0 && (
        <View style={styles.questionExplanationBox}>
          {question.question.questionExplanation.map((line, idx) => (
            <Text key={idx} style={styles.questionExplanationText}>
              {line}
            </Text>
          ))}
        </View>
      )}

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
            <Text style={styles.choiceText}>{`${index + 1}. ${choice}`}</Text>
          </Pressable>
        );
      })}

      {/* 정답/오답 피드백 */}
      {showFeedback && (
        <View
          style={[
            styles.feedbackBox,
            { borderColor: isCorrect ? "#4CAF50" : "#F44336" },
          ]}
        >
          <Text
            style={[
              styles.feedbackLabel,
              { color: isCorrect ? "#4CAF50" : "#F44336" },
            ]}
          >
            {isCorrect ? "✔ 정답입니다!" : "✘ 오답입니다!"}
          </Text>

          {!isCorrect && (
            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>정답</Text>
              <Text style={styles.answerText}>
                {question.answer.answerText}
              </Text>
            </View>
          )}

          {question.answer.answerExplanation ? (
            <Text style={styles.explanationText}>
              {question.answer.answerExplanation}
            </Text>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
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

  feedbackText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  feedbackBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#fafafa",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  feedbackLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  answerBox: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  answerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },

  answerText: {
    fontSize: 16,
    color: "#222",
  },

  explanationText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  choiceText: {
    fontSize: 16,
    color: "#222",
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
