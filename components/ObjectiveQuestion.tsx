import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Choice, Question } from "../lib/types";

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
  const [selected, setSelected] = useState<Choice | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<Choice[]>([]);

  useEffect(() => {
    setSelected(null);
  }, [question]);

  useEffect(() => {
    if (question.choices) {
      const dummyChoice: Choice = {
        choice: "모르겠습니다.",
        choiceExplanation: "다음에 다시 도전해보세요!",
      };

      const answerChoice: Choice = {
        choice: question.answer.answerText,
        choiceExplanation: question.answer.answerExplanation,
      };

      const choicesWithAnswer = [...question.choices, answerChoice];

      const uniqueChoices = Array.from(
        new Map(choicesWithAnswer.map((c) => [c.choice, c])).values()
      );
      const shuffled = uniqueChoices.sort(() => Math.random() - 0.5);

      const finalChoices = [...shuffled, dummyChoice];
      setShuffledChoices(finalChoices);
    }
  }, [question]);

  useEffect(() => {
    console.log("🟢 isAnswered updated to:", isAnswered);
  }, [isAnswered]);

  const handleSelect = (choice: Choice) => {
    if (isAnswered) return;
    setSelected(choice);
    onSubmit(choice.choice);
  };

  const showFeedback = isAnswered && selected !== null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      {/* 선택지 렌더링 */}
      {shuffledChoices.map((choice, index) => {
        const isSelected = selected?.choice === choice.choice;

        let backgroundColor = "#eee";
        if (isAnswered && isSelected) {
          backgroundColor = isCorrect ? "#bbddc3" : "#f8d7da";
        }

        // 정답 공개 시 모든 선택지에 대한 피드백
        let choiceFeedback = null;
        if (isAnswered) {
          if (choice.choice === question.answer.answerText) {
            choiceFeedback = (
              <Text style={styles.choiceExplanationCorrect}>✔ 정답</Text>
            );
          } else if (isSelected && !isCorrect) {
            choiceFeedback = (
              <Text style={styles.choiceExplanationIncorrect}>✘ 오답</Text>
            );
          }
        }

        return (
          <Pressable
            key={index}
            onPress={() => handleSelect(choice)}
            style={[styles.choice, { backgroundColor }]}
          >
            <Text style={styles.choiceText}>{`${index + 1}. ${choice}`}</Text>
            {choiceFeedback}
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
  choiceExplanationCorrect: {
    marginTop: 4,
    fontSize: 12,
    color: "#1e8e3e",
    fontWeight: "bold",
  },
  choiceExplanationIncorrect: {
    marginTop: 4,
    fontSize: 12,
    color: "#d93025",
    fontWeight: "bold",
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
