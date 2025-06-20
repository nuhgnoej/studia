import ObjectiveQuestion from "@/components/ObjectiveQuestion";
import SubjectiveQuestion from "@/components/SubjectiveQuestion";
import {
  getQuestionsBySubjectId,
  getWrongAnswersBySubjectId,
  insertAnswer,
} from "@/lib/db";
import { Question } from "@/lib/types";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function QuizScreen() {
  const { filename, mode } = useLocalSearchParams();
  const subject_id = filename as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 화면 컴포넌트 안에서
  const navigation = useNavigation();
  const quizMode = mode as string | undefined;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${filename}`, // 원하는 텍스트로 바꾸기
    });
  }, [navigation, filename]);

  useEffect(() => {
    const load = async () => {
      const questions =
        quizMode === "wrong"
          ? await getWrongAnswersBySubjectId(subject_id)
          : await getQuestionsBySubjectId(subject_id);
      setQuestions(questions);
    };
    load();
  }, [subject_id]);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  const handleSubmitAnswer = async (
    userAnswer: string,
    isCorrectOverride?: boolean,
    autoNext: boolean = false
  ) => {
    const current = questions[currentIndex];

    const correctAnswer = JSON.parse(current.answer);

    const isCorrect =
      typeof isCorrectOverride === "boolean"
        ? isCorrectOverride
        : userAnswer === correctAnswer;

    console.log("userAnswer: ", userAnswer);
    console.log("correctAnswer: ", correctAnswer);
    console.log("기계적 판단: ", userAnswer === correctAnswer);
    console.log("최종 판단: ", isCorrect);

    await insertAnswer({
      question_id: current.id,
      subject_id,
      user_answer: userAnswer,
      is_correct: isCorrect,
    });

    setIsAnswered(true);
    setIsCorrect(isCorrect);

    if (autoNext && currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsAnswered(false);
      }, 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswered(false);
    } else {
      alert("퀴즈를 모두 완료했습니다!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>
        문제 {currentIndex + 1} / {questions.length}
      </Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
        />
      </View>

      {currentQuestion ? (
        <>
          {currentQuestion.type === "objective" ? (
            <ObjectiveQuestion
              question={currentQuestion}
              onSubmit={handleSubmitAnswer}
              isAnswered={isAnswered}
              isCorrect={isCorrect}
            />
          ) : (
            <SubjectiveQuestion
              question={currentQuestion}
              onSubmit={handleSubmitAnswer}
              isAnswered={isAnswered}
            />
          )}

          {isAnswered && <Button title="다음 문제" onPress={handleNext} />}
        </>
      ) : (
        <Text>문제를 불러오는 중입니다...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
    fontWeight: "500",
  },
  progressBarContainer: {
    height: 8,
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
});
