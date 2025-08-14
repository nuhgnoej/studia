import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Choice, Question } from "../lib/types";

export default function ObjectiveQuestion({
  question,
  onSubmit,
  isAnswered,
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

  const handleSelect = (choice: Choice) => {
    if (isAnswered) return;
    setSelected(choice);
    onSubmit(choice.choice);
  };

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
        const isTheCorrectAnswer = choice.choice === question.answer.answerText;

        let backgroundColor = "#eee";
        let choiceFeedback = null;
        if (isAnswered) {
          if (isTheCorrectAnswer) {
            backgroundColor = "#bbddc3";
            choiceFeedback = `✔ 정답:`;
          } else if (isSelected) {
            backgroundColor = "#f8d7da";
            choiceFeedback = `✘ 오답:`;
          } else {
            backgroundColor = "#f0f0f0";
          }
        }

        return (
          <Pressable
            key={index}
            onPress={() => handleSelect(choice)}
            style={[styles.choice, { backgroundColor }]}
          >
            <Text style={styles.choiceText}>{`${index + 1}. ${
              choice.choice
            }`}</Text>

            {/* {isAnswered && choice.choiceExplanation && ( */}
            {isAnswered && (
              <Text
                style={[
                  styles.choiceExplanation,
                  isTheCorrectAnswer
                    ? styles.choiceExplanationCorrect
                    : styles.choiceExplanationIncorrect,
                ]}
              >
                {choiceFeedback} {choice.choiceExplanation}
              </Text>
            )}
          </Pressable>
        );
      })}
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
  choiceText: {
    fontSize: 16,
    color: "#222",
  },
  choiceExplanation: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  choiceExplanationCorrect: {
    color: "#1e8e3e",
    borderTopColor: "#a6d3a8",
  },
  choiceExplanationIncorrect: {
    color: "#5f6368",
    borderTopColor: "#e0e0e0",
  },
  questionExplanationBox: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  questionExplanationText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
});
