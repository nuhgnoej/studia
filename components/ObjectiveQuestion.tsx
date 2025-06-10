// components/ObjectiveQuestion.tsx

import { Question } from "@/lib/types";
import { Text, View, TouchableOpacity } from "react-native";
import { insertAnswer } from "@/lib/db";
// import { useRouter } from "expo-router";
import { useState } from "react";

export default function ObjectiveQuestion({
  question,
}: {
  question: Question;
}) {
  const choices = Array.isArray(question.choices) ? question.choices : [];
  // const router = useRouter();
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

    // setTimeout(() => {
    //   router.replace(`/two?id=${question.id + 1}`);
    // }, 1000); // 1초 후 다음 문제로 이동
  };

  return (
    <View>
      <Text>{question.question}</Text>
      {choices.map((choice, idx) => (
        <TouchableOpacity key={idx} onPress={() => handleSelect(idx)}>
          <Text
            style={{
              backgroundColor:
                submitted && idx === selectedIdx
                  ? isCorrect
                    ? "lightgreen"
                    : "salmon"
                  : "white",
              padding: 8,
              marginVertical: 4,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "#ccc",
            }}
          >
            {`${idx + 1}. ${choice}`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
