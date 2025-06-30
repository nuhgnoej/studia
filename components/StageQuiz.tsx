import ObjectiveQuestion from "@/components/ObjectiveQuestion";
import SubjectiveQuestion from "@/components/SubjectiveQuestion";
import StageSummary from "@/components/StageSummary";
import { Question } from "@/lib/types";
import { insertAnswer } from "@/lib/db";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "expo-router";
import { checkAnswer } from "@/lib/util";
import TagsEditor from "./TagsEditor";
import { updateTagsEverywhere } from "@/lib/tagUtil";

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
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "문제풀이",
    });
  }, [navigation]);

  // ✅ 상태들
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isStageSummary, setIsStageSummary] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const currentQuestion = questions[currentIndex] ?? null;

  // ✅ 스테이지 계산
  const totalStages = Math.ceil(questions.length / stageSize);
  const currentStage = Math.floor(currentIndex / stageSize) + 1;
  const stageStart = (currentStage - 1) * stageSize;
  const stageEnd = Math.min(stageStart + stageSize, questions.length);
  const questionInStage = currentIndex - stageStart + 1;

  // ✅ 태그 상태 동기화
  useEffect(() => {
    if (currentQuestion) {
      setTags(currentQuestion.tags ?? []);
    } else {
      setTags([]);
    }
  }, [currentQuestion?.id]);

  // ✅ 정답 제출
  const handleSubmitAnswer = async (
    userAnswer: string,
    isCorrectOverride?: boolean
  ) => {
    if (!currentQuestion) return;

    const isCorrect =
      typeof isCorrectOverride === "boolean"
        ? isCorrectOverride
        : checkAnswer(currentQuestion.answer as string, userAnswer);

    await insertAnswer({
      question_id: currentQuestion.id,
      subject_id: subjectId,
      user_answer: userAnswer,
      is_correct: isCorrect,
    });

    setIsAnswered(true);
    setIsCorrect(isCorrect);
  };

  // ✅ 다음 문제로 이동
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

  const handleRetryStage = () => {
    setCurrentIndex(stageStart);
    setIsAnswered(false);
    setIsStageSummary(false);
  };

  // ✅ questions가 비어있을 때 처리
  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text>문제가 없습니다. 문제를 추가하거나 데이터를 확인하세요.</Text>
      </View>
    );
  }

  const handleSkipStage = () => {
    const nextIndex = stageEnd;
    const isOutOfBound = nextIndex >= questions.length;

    if (isOutOfBound) {
      onComplete?.();
    } else {
      setCurrentIndex(nextIndex);
      setIsAnswered(false);
      setIsStageSummary(false);
    }
  };

  const handlePreviousStage = () => {
    const previousIndex = Math.max(stageStart - stageSize, 0);
    setCurrentIndex(previousIndex);
    setIsAnswered(false);
    setIsStageSummary(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80} // 헤더 높이에 따라 조정
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button title="이전 단계로" onPress={handlePreviousStage} />
          <Button title="다음 단계로" onPress={handleSkipStage} />
        </View>
        <View style={styles.container}>
          <Text style={styles.stageText}>
            📦 단계 {currentStage} / {totalStages} — 문제 {questionInStage} /{" "}
            {Math.min(stageSize, stageEnd - stageStart)}
          </Text>

          {isStageSummary ? (
            <StageSummary
              subjectId={subjectId}
              stageNumber={currentStage}
              questionIds={questions
                .slice(stageStart, stageEnd)
                .map((q) => q.id)}
              onContinue={handleContinueToNextStage}
              onRetry={handleRetryStage}
            />
          ) : (
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

              <TagsEditor
                tags={tags}
                onChange={async (newTags) => {
                  setTags(newTags);
                  currentQuestion.tags = newTags;
                  await updateTagsEverywhere({
                    subjectId,
                    questionId: currentQuestion.id,
                    tags: newTags,
                  });
                }}
              />

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
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
