import React, {
  createContext,
  useContext,
  useRef,
  useMemo,
  useCallback,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import SubjectStartContent from "@/components/Quiz/SubjectStartContent";
import QuizContent from "@/components/Quiz/QuizContent";
import { BackHandler } from "react-native";
import { useNotification } from "@/contexts/NotificationContext";

type QuizMode = "normal" | "wrong";

interface QuizModalContextType {
  showQuizStartSheet: (subjectId: string) => void;
}

const QuizModalContext = createContext<QuizModalContextType | undefined>(
  undefined
);

export const useQuizModal = () => {
  const context = useContext(QuizModalContext);
  if (!context)
    throw new Error("useQuizModal must be used within a QuizModalProvider");
  return context;
};

export const QuizModalProvider = ({ children }: { children: ReactNode }) => {
  const { showNotification } = useNotification();
  const startSheetRef = useRef<BottomSheetModal>(null);
  const quizSheetRef = useRef<BottomSheetModal>(null);

  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>("normal");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const snapPoints = useMemo(() => ["100%"], []);

  const closeQuizModal = useCallback(() => {
    startSheetRef.current?.dismiss();
    quizSheetRef.current?.dismiss();
    setIsSheetOpen(false);
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (isSheetOpen) {
        closeQuizModal();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isSheetOpen, closeQuizModal]);

  const showQuizStartSheet = useCallback((id: string) => {
    setSubjectId(id);
    startSheetRef.current?.present();
    setIsSheetOpen(true);
  }, []);

  const handleStartQuiz = useCallback((mode: QuizMode) => {
    setQuizMode(mode);
    startSheetRef.current?.dismiss();
    setTimeout(() => {
      quizSheetRef.current?.present();
    }, 250);
  }, []);

  const handleQuizComplete = useCallback(() => {
    showNotification({
      title: "🎉 퀴즈 완료",
      description: "축하합니다. 퀴즈를 완료했습니다. 홈으로 돌아갑니다.",
      status: "success",
      onConfirm: () => {
        quizSheetRef.current?.dismiss();
      },
    });
  }, [showNotification]);

  return (
    <QuizModalContext.Provider value={{ showQuizStartSheet }}>
      {children}

      {/* 1. 문제 정보 확인 시트 */}
      <BottomSheetModal
        ref={startSheetRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={() => setIsSheetOpen(false)}
        enablePanDownToClose={false}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        {subjectId && (
          <SubjectStartContent
            subjectId={subjectId}
            onStartQuiz={handleStartQuiz}
            onClose={closeQuizModal}
          />
        )}
      </BottomSheetModal>

      {/* 2. 퀴즈 풀이 시트 */}
      <BottomSheetModal
        ref={quizSheetRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={() => setIsSheetOpen(false)}
        enablePanDownToClose={false} // 퀴즈 푸는 중에는 드래그로 닫기 비활성화
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        {subjectId && (
          <QuizContent
            subjectId={subjectId}
            mode={quizMode}
            onComplete={handleQuizComplete}
            onClose={closeQuizModal}
          />
        )}
      </BottomSheetModal>
    </QuizModalContext.Provider>
  );
};
