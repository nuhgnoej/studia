import ObjectiveQuestion from "@/components/Quiz/ObjectiveQuestion";
import StageSummary from "@/components/Quiz//StageSummary";
import SubjectiveQuestion from "@/components/Quiz//SubjectiveQuestion";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Metadata, Question } from "../../lib/types";
import TagsEditor from "./TagsEditor";
import { insertAnswer } from "@/lib/db/insert";
import { updateTags } from "@/lib/db/tagUtil";
import { checkAnswer } from "@/lib/db/util";
import {
  defaultBackground,
  tagToBackgroundImage,
} from "@/lib/tagToBackgroundImage";
import { saveProgress, loadLastProgress } from "@/lib/db/progress";
import { getMetadataBySubjectId } from "@/lib/db";

// Reusable NavButton component with modern styling
const NavButton = ({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.navButton, disabled && styles.navButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
  >
    <Text
      style={[styles.navButtonText, disabled && styles.navButtonTextDisabled]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

type Props = {
  questions: Question[];
  subjectId: string;
  stageSize?: number;
  onComplete?: () => void;
  mode?: "normal" | "wrong";
};

export default function StageQuiz({
  questions,
  subjectId,
  stageSize = 10,
  onComplete,
  mode,
}: Props) {
  // --- States ---
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isStageSummary, setIsStageSummary] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [showIntroMessage, setShowIntroMessage] = useState(false);
  const [hasShownIntroMessage, setHasShownIntroMessage] = useState(false);
  const [meta, setMeta] = useState<Metadata | null>(null);

  const currentQuestion =
    currentIndex !== null && currentIndex < questions.length
      ? questions[currentIndex]
      : null;

  // --- Stage Calculation ---
  const totalStages = Math.ceil(questions.length / stageSize);
  const currentStage =
    typeof currentIndex === "number"
      ? Math.floor(currentIndex / stageSize) + 1
      : 1;
  const stageStart = (currentStage - 1) * stageSize;
  const stageEnd = Math.min(stageStart + stageSize, questions.length);
  const questionInStage =
    typeof currentIndex === "number" ? currentIndex - stageStart + 1 : 1;

  // --- Effects ---
  useEffect(() => {
    if (currentQuestion) {
      setTags(currentQuestion.tags ?? []);
    } else {
      setTags([]);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (currentIndex !== null && currentIndex > 0 && !hasShownIntroMessage) {
      setShowIntroMessage(true);
      setHasShownIntroMessage(true);
    }
  }, [currentIndex, hasShownIntroMessage]);

  const fadeAnimOpacity = useSharedValue(1);

  useEffect(() => {
    if (showIntroMessage) {
      fadeAnimOpacity.value = withDelay(
        3000,
        withTiming(
          0,
          { duration: 1000, easing: Easing.out(Easing.quad) },
          (finished) => {
            if (finished) {
              runOnJS(setShowIntroMessage)(false);
            }
          }
        )
      );
    }
  }, [showIntroMessage, fadeAnimOpacity]);

  useEffect(() => {
    const fetchMeta = async () => {
      if (!subjectId) return;
      const metaData = await getMetadataBySubjectId(subjectId);
      if (metaData && typeof metaData.tags === "string") {
        try {
          metaData.tags = JSON.parse(metaData.tags);
        } catch (e) {
          console.error("Tags 파싱 실패:", e);
          metaData.tags = [];
        }
      }
      setMeta(metaData);
    };
    fetchMeta();
  }, [subjectId]);

  const animatedMessageStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnimOpacity.value,
    };
  });

  useEffect(() => {
    const init = async () => {
      if (mode === "wrong") {
        setCurrentIndex(0);
        return;
      }

      const savedIndex = await loadLastProgress(subjectId);
      const validIndex =
        savedIndex !== null && savedIndex < questions.length ? savedIndex : 0;
      setCurrentIndex(validIndex);
    };
    init();
  }, [subjectId, mode, questions.length]);

  // --- Loading and Empty State ---
  if (currentIndex === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text>이전 풀이 위치를 불러오는 중...</Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text>문제가 없습니다. 문제를 추가하거나 데이터를 확인하세요.</Text>
      </View>
    );
  }

  // --- Handlers ---
  const handleSubmitAnswer = async (
    userAnswer: string,
    isCorrectOverride?: boolean
  ) => {
    if (!currentQuestion) return;
    const isCorrectAns =
      typeof isCorrectOverride === "boolean"
        ? isCorrectOverride
        : checkAnswer(currentQuestion.answer.answerText, userAnswer);

    await insertAnswer({
      question_id: currentQuestion.id,
      subject_id: subjectId,
      user_answer: userAnswer,
      is_correct: isCorrectAns,
    });

    setIsAnswered(true);
    setIsCorrect(isCorrectAns);

    if (mode !== "wrong") {
      await saveProgress({
        subjectId,
        currentIndex,
        totalQuestions: questions.length,
      });
    }
  };

  const handleNext = () => {
    const isLastQuestion = currentIndex === questions.length - 1;
    const isEndOfStage =
      (currentIndex + 1) % stageSize === 0 &&
      currentIndex + 1 < questions.length;

    if (isLastQuestion) {
      onComplete?.();
      return;
    }

    if (isEndOfStage) {
      setIsStageSummary(true);
      return;
    }

    setCurrentIndex((prev) => (prev !== null ? prev + 1 : 0));
    setIsAnswered(false);
  };

  const handleContinueToNextStage = () => {
    setCurrentIndex((prev) => (prev !== null ? prev + 1 : 0));
    setIsAnswered(false);
    setIsStageSummary(false);
  };

  const handleRetryStage = () => {
    setCurrentIndex(stageStart);
    setIsAnswered(false);
    setIsStageSummary(false);
  };

  const handleSkipStage = () => {
    const nextIndex = stageEnd;
    if (nextIndex >= questions.length) {
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

  const handlePreviousQuestion = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => (prev !== null ? prev - 1 : 0));
    setIsAnswered(false);
    setIsStageSummary(false);
  };

  const displayTag = meta?.tags?.[0] ?? "default";
  console.log(`displayTag: ${displayTag}`);
  const backgroundSource =
    tagToBackgroundImage[displayTag] ?? defaultBackground;
  const log =
    backgroundSource === defaultBackground
      ? "기본이미지 출력됨"
      : "백그라운드 이미지 출력됨";
  console.log(log);

  return (
    <View style={styles.rootContainer}>
      <ImageBackground
        source={backgroundSource}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.2 }}
        resizeMode="cover"
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.stageText}>
            📦 단계 {currentStage} / {totalStages} — 문제 {questionInStage} /{" "}
            {Math.min(stageSize, stageEnd - stageStart)} — 전체{" "}
            {currentIndex + 1} / {questions.length}
          </Text>

          <View style={styles.navigationContainer}>
            <NavButton
              title="<<"
              onPress={handlePreviousStage}
              disabled={currentStage <= 1}
            />
            <NavButton
              title="<"
              onPress={handlePreviousQuestion}
              disabled={currentIndex === 0}
            />
            <NavButton
              title={currentIndex === questions.length - 1 ? "✔️" : ">"}
              onPress={handleNext}
            />
            <NavButton
              title=">>"
              onPress={handleSkipStage}
              disabled={currentStage >= totalStages}
            />
          </View>

          <View style={{ minHeight: 24, marginBottom: 8 }}>
            {showIntroMessage && (
              <Animated.Text
                style={[styles.introMessage, animatedMessageStyle]}
              >
                이전에 {currentIndex + 1}번 문제까지 완료했습니다. 이어서 계속
                진행합니다.
              </Animated.Text>
            )}
          </View>

          <View style={styles.quizArea}>
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
                <View style={{ paddingBottom: 10 }}>
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
                </View>

                <TagsEditor
                  tags={tags}
                  onChange={async (newTags) => {
                    setTags(newTags);
                    currentQuestion.tags = newTags;
                    await updateTags({
                      subjectId,
                      questionId: currentQuestion.id,
                      tags: newTags,
                    });
                  }}
                />
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  quizArea: {
    flex: 1,
    justifyContent: "flex-start",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 2,
  },
  stageText: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
    paddingTop: 16,
  },
  background: {
    flex: 1,
  },
  introMessage: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
  },
  navButton: {
    flex: 1,
    backgroundColor: "#4B5563",
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    backgroundColor: "#9CA3AF",
    elevation: 0,
  },
  navButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  navButtonTextDisabled: {
    color: "#E5E7EB",
  },
  contentWrapper: {
    flex: 1,
    // justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
