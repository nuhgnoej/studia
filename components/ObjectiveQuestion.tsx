// components/ObjectiveQuestion.tsx

import { Question } from "@/lib/types";
import { Text, View, TouchableOpacity } from "react-native";
import { insertAnswer } from "@/lib/db";
import { useState } from "react";

export default function ObjectiveQuestion({
  question,
}: {
  question: Question;
}) {
  const choices = Array.isArray(question.choices) ? question.choices : [];
  const [submitted, setSubmitted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const isCorrect =
    selectedIdx !== null && choices[selectedIdx] === question.answer;

  const handleSelect = async (idx: number) => {
    if (submitted) return;
    setSubmitted(true);
    setSelectedIdx(idx);

    const userAnswer = choices[idx];
    const correct = userAnswer === question.answer;

    await insertAnswer({
      question_id: question.id,
      user_answer: userAnswer,
      is_correct: correct,
    });

    // Optional: 다음 문제 자동 전환
    // setTimeout(() => {
    //   router.replace(`/two?id=${question.id + 1}`);
    // }, 1000);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>
        {question.question}
      </Text>

      {choices.map((choice, idx) => {
        const isSelected = idx === selectedIdx;
        const backgroundColor = submitted
          ? isSelected
            ? isCorrect
              ? "#e0ffe0"
              : "#ffe0e0"
            : "white"
          : "white";

        return (
          <TouchableOpacity
            key={idx}
            onPress={() => handleSelect(idx)}
            disabled={submitted}
            style={{
              backgroundColor,
              padding: 12,
              marginVertical: 6,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#ccc",
            }}
          >
            <Text style={{ fontSize: 16 }}>{`${idx + 1}. ${choice}`}</Text>
          </TouchableOpacity>
        );
      })}

      {submitted && (
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: isCorrect ? "green" : "red",
              marginBottom: 8,
            }}
          >
            {isCorrect ? "정답입니다!" : "오답입니다."}
          </Text>

          {!isCorrect && (
            <View
              style={{
                backgroundColor: "#f8f8f8",
                padding: 10,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontSize: 14, marginBottom: 4 }}>
                ✅ 정답:{" "}
                <Text style={{ fontWeight: "bold" }}>{question.answer}</Text>
              </Text>
              <Text style={{ fontSize: 14 }}>
                📘 설명: {question.explanation}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
