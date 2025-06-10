// components/SubjectiveQuestion.tsx

import { Question } from "@/lib/types";
import { Text, TextInput, View, Button } from "react-native";
import { useState } from "react";
import { insertAnswer } from "@/lib/db";
// import { useRouter } from "expo-router";

export default function SubjectiveQuestion({
  question,
}: {
  question: Question;
}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  // const router = useRouter();

  const handleSubmit = async () => {
    if (submitted) return;

    const trimmed = input.trim();
    const correct = trimmed === question.answer;

    await insertAnswer({
      question_id: question.id,
      user_answer: trimmed,
      is_correct: correct,
    });

    setIsCorrect(correct);
    setSubmitted(true);

    // 피드백 보여준 후 다음 문제로 이동
    // setTimeout(() => {
    //   router.replace(`/two?id=${question.id + 1}`);
    // }, 1000);
  };

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 16 }}>{question.question}</Text>

      <TextInput
        placeholder="정답을 입력하세요"
        value={input}
        onChangeText={setInput}
        editable={!submitted}
        style={{
          borderColor: submitted ? "#999" : "#ccc",
          borderWidth: 1,
          padding: 10,
          borderRadius: 6,
          backgroundColor: submitted ? "#eee" : "#fff",
          fontSize: 16,
        }}
      />

      {!submitted && (
        <Button
          title="제출하기"
          onPress={handleSubmit}
          disabled={!input.trim()}
        />
      )}

      {submitted && (
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: isCorrect ? "green" : "red",
            paddingTop: 4,
          }}
        >
          {isCorrect ? "정답입니다!" : `오답입니다. 정답: ${question.answer}`}
        </Text>
      )}
    </View>
  );
}
