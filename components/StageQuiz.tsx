// components/StageQuiz.tsx

import ObjectiveQuestion from "@/components/ObjectiveQuestion";
import SubjectiveQuestion from "@/components/SubjectiveQuestion";
import StageSummary from "@/components/StageSummary";
import { Question } from "@/lib/types";
import { insertAnswer } from "@/lib/db";
import { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";

type Props = {
  questions: Question[];
  subjectId: string;
  stageSize?: number;
  onComplete?: () => void;
};

export default function StageQuiz({
  questions,
  subjectId,
  stageSize = 10,
  onComplete,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isStageSummary, setIsStageSummary] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalStages = Math.ceil(questions.length / stageSize);
  const currentStage = Math.floor(currentIndex / stageSize) + 1;
  const stageStart = (currentStage - 1) * stageSize;
  const stageEnd = Math.min(stageStart + stageSize, questions.length);
  const questionInStage = currentIndex - stageStart + 1;

  const handleSubmitAnswer = async (
    userAnswer: string,
    isCorrectOverride?: boolean
  ) => {
    const correctAnswer = JSON.parse(currentQuestion.answer);
    const isCorrect =
      typeof isCorrectOverride === "boolean"
        ? isCorrectOverride
        : userAnswer === correctAnswer;

    await insertAnswer({
      question_id: currentQuestion.id,
      subject_id: subjectId,
      user_answer: userAnswer,
      is_correct: isCorrect,
    });

    setIsAnswered(true);
    setIsCorrect(isCorrect);
  };

  const handleNext = () => {
    const isLastQuestion = currentIndex === questions.length - 1;
    const isEndOfStage = (currentIndex + 1) % stageSize === 0;

    if (isLastQuestion) {
      onComplete?.();
      return;
    }

    if (isEndOfStage) {
      setIsStageSummary(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setIsAnswered(false);
  };

  const handleContinueToNextStage = () => {
    setCurrentIndex((prev) => prev + 1);
    setIsAnswered(false);
    setIsStageSummary(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stageText}>
        📦 단계 {currentStage} / {totalStages} — 문제 {questionInStage} /{" "}
        {Math.min(stageSize, stageEnd - stageStart)}
      </Text>

      {isStageSummary ? (
        <StageSummary
          subjectId={subjectId}
          stageNumber={currentStage}
          questionIds={questions.slice(stageStart, stageEnd).map((q) => q.id)}
          onContinue={handleContinueToNextStage}
        />
      ) : currentQuestion ? (
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

          {isAnswered && (
            <Button
              title={
                currentIndex === questions.length - 1
                  ? "퀴즈 완료"
                  : "다음 문제"
              }
              onPress={handleNext}
            />
          )}
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
  stageText: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
    marginBottom: 12,
  },
});
