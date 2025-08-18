// components/QuizContent.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import getWrongAnsweredQuestionsBySubjectId, {
  getQuestionsBySubjectId,
} from "@/lib/db/query";
import { Question } from "@/lib/types";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import StageQuiz from "@/components/Quiz/StageQuiz";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

type Props = {
  subjectId: string;
  mode: "normal" | "wrong";
  onComplete: () => void;
  onClose: () => void;
};

export default function QuizContent({
  subjectId,
  mode,
  onComplete,
  onClose,
}: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data =
          mode === "wrong"
            ? await getWrongAnsweredQuestionsBySubjectId(subjectId)
            : await getQuestionsBySubjectId(subjectId);
        setQuestions(data);
      } catch (err) {
        setError(`문제를 불러오지 못했습니다.:${err}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subjectId, mode]);

  //   if (loading) return <Loading />;
  //   if (error) return <ErrorMessage message={error} />;
  //   if (questions.length === 0) {
  //     return (
  //       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //         <Text>해당 조건의 문제가 없습니다.</Text>
  //       </View>
  //     );
  //   }

  const renderContent = () => {
    if (loading) {
      return <Loading />;
    }
    if (error) {
      return <ErrorMessage message={error} />;
    }
    if (questions.length === 0) {
      // '문제가 없습니다' 메시지를 스타일링된 컴포넌트로 변경
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="check-circle-outline"
            size={48}
            color="#4CAF50"
          />
          <Text style={styles.emptyText}>훌륭해요! 틀린 문제가 없습니다.</Text>
        </View>
      );
    }
    return (
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 0 }}
        keyboardShouldPersistTaps="handled"
      >
        <StageQuiz
          questions={questions}
          subjectId={subjectId}
          stageSize={10}
          onComplete={onComplete}
          mode={mode}
        />
      </BottomSheetScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. 헤더와 닫기 버튼을 항상 렌더링하도록 바깥으로 꺼냅니다. */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>문제 풀이</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={26} color="#6B7280" />
        </Pressable>
      </View>

      {/* 2. 로딩/에러/결과에 따라 내용 부분만 조건부로 렌더링합니다. */}
      <View style={styles.contentArea}>{renderContent()}</View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    position: "absolute",
    right: 16,
  },
  contentArea: {
    flex: 1, // 헤더를 제외한 나머지 공간을 모두 차지
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
});
