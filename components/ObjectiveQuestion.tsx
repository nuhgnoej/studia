// components/ObjectiveQuestion.tsx

import { Question } from "@/lib/types";
import { Text, View, TouchableOpacity } from "react-native";
import { insertAnswer } from "@/lib/db";
import { useState, useEffect } from "react";

interface ObjectiveQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
  showAnswer: boolean;
}

export default function ObjectiveQuestion({
  question,
  onAnswer,
  showAnswer,
}: ObjectiveQuestionProps) {
  const choices = Array.isArray(question.choices) ? question.choices : [];
  const [submitted, setSubmitted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showFeedback) {
      timer = setTimeout(() => {
        onAnswer(isCorrect ? "know" : "dont_know");
      }, 1500); // 1.5초 후 다음 문제로 이동
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showFeedback, isCorrect, onAnswer]);

  const handleSelect = async (idx: number) => {
    if (submitted) return;
    setSubmitted(true);
    setSelectedIdx(idx);

    const userAnswer = choices[idx];
    const correct = userAnswer === question.answer;
    setIsCorrect(correct);

    try {
      await insertAnswer({
        question_id: question.id,
        subject_id: question.subject_id ?? '', // subject_id가 undefined일 경우 빈 문자열 사용
        user_answer: userAnswer,
        is_correct: correct,
      });
      
      setShowFeedback(true); // 피드백 표시 시작
    } catch (error) {
      console.error("답변 저장 에러:", error);
      alert("답변을 저장하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>
        {question.question}
      </Text>

      {choices.map((choice, idx) => {
        const isSelected = idx === selectedIdx;
        let backgroundColor = "white";
        let borderColor = "#ccc";

        if (submitted || showAnswer) {
          if (isSelected) {
            backgroundColor = isCorrect ? "#e0ffe0" : "#ffe0e0";
            borderColor = isCorrect ? "#4CAF50" : "#f44336";
          } else if (choice === question.answer && showAnswer) {
            backgroundColor = "#e0ffe0";
            borderColor = "#4CAF50";
          }
        }

        return (
          <TouchableOpacity
            key={idx}
            onPress={() => handleSelect(idx)}
            disabled={submitted || showAnswer}
            style={{
              backgroundColor,
              padding: 12,
              marginVertical: 6,
              borderRadius: 6,
              borderWidth: 1,
              borderColor,
            }}
          >
            <Text style={{ fontSize: 16 }}>{`${idx + 1}. ${choice}`}</Text>
          </TouchableOpacity>
        );
      })}

      {showFeedback && (
        <View style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 8,
          backgroundColor: isCorrect ? "#e8f5e9" : "#ffebee",
          borderWidth: 1,
          borderColor: isCorrect ? "#4CAF50" : "#f44336",
        }}>
          <Text style={{
            fontSize: 16,
            textAlign: "center",
            color: isCorrect ? "#2e7d32" : "#c62828",
            fontWeight: "bold",
          }}>
            {isCorrect ? "정답입니다! 🎉" : "틀렸습니다 😢"}
          </Text>
          {!isCorrect && (
            <Text style={{
              fontSize: 14,
              textAlign: "center",
              marginTop: 8,
              color: "#666",
            }}>
              정답: {question.answer}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
