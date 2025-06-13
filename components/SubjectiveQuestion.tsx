import React from "react";
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

interface SubjectiveQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
  showAnswer: boolean;
}

export default function SubjectiveQuestion({
  question,
  onAnswer,
  showAnswer,
}: SubjectiveQuestionProps) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
  };

  const handleMarkAnswer = async (correct: boolean) => {
    try {
      if (!question.subject_id) {
        throw new Error("subject_id가 없습니다");
      }
      
      await insertAnswer({
        question_id: question.id,
        subject_id: question.subject_id,
        user_answer: input.trim(),
        is_correct: correct,
      });

      setIsCorrect(correct);
      onAnswer(correct ? "know" : "dont_know");
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
            editable={!submitted && !showAnswer}
            style={{
              borderColor: submitted || showAnswer ? "#999" : "#ccc",
              borderWidth: 1,
              padding: 12,
              borderRadius: 6,
              backgroundColor: submitted || showAnswer ? "#f0f0f0" : "#fff",
              fontSize: 16,
              marginBottom: 12,
            }}
          />

          {!submitted && !showAnswer ? (
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
                  <Text style={{ fontWeight: "bold" }}>
                    {Array.isArray(question.answer)
                      ? question.answer.join(", ")
                      : question.answer}
                  </Text>
                </Text>
                <Text style={{ fontSize: 14 }}>
                  📘 설명: {question.explanation}
                </Text>
              </View>

              {!showAnswer && isCorrect === null && (
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
              )}
            </>
          )}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
