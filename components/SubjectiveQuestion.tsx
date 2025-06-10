import { Question } from "@/lib/types";
import {
  Text,
  TextInput,
  View,
  Button,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useState } from "react";
import { insertAnswer } from "@/lib/db";

export default function SubjectiveQuestion({
  question,
}: {
  question: Question;
}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
  };

  const handleMarkAnswer = async (correct: boolean) => {
    try {
      await insertAnswer({
        question_id: question.id,
        user_answer: input.trim(),
        is_correct: correct,
      });

      setIsCorrect(correct);
    } catch (e) {
      console.error("insertAnswer 에러", e);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>
            {question.question}
          </Text>

          <TextInput
            placeholder="정답을 입력하세요"
            value={input}
            onChangeText={setInput}
            editable={!submitted}
            style={{
              borderColor: submitted ? "#999" : "#ccc",
              borderWidth: 1,
              padding: 12,
              borderRadius: 6,
              backgroundColor: submitted ? "#f0f0f0" : "#fff",
              fontSize: 16,
              marginBottom: 12,
            }}
          />

          {!submitted ? (
            <Button
              title="제출하기"
              onPress={handleSubmit}
              disabled={!input.trim()}
            />
          ) : (
            <>
              <View
                style={{
                  backgroundColor: "#f8f8f8",
                  padding: 10,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  marginBottom: 12,
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

              {isCorrect === null ? (
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Button
                    title="정답으로 인정"
                    onPress={() => handleMarkAnswer(true)}
                  />
                  <Button
                    title="오답으로 처리"
                    onPress={() => handleMarkAnswer(false)}
                    color="red"
                  />
                </View>
              ) : (
                <Text style={{ marginTop: 16 }}>
                  ✅ 제출 완료됨 ({isCorrect ? "정답" : "오답"})
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
