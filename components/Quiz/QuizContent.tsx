// components/Quiz/QuizContent.tsx

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import getWrongAnsweredQuestionsBySubjectId, {
  getQuestionsBySubjectId,
} from "@/lib/db/query";
import { Metadata, Question } from "@/lib/types";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import StageQuiz from "@/components/Quiz/StageQuiz";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { getMetadataBySubjectId } from "@/lib/db";

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
  const [meta, setMeta] = useState<Metadata | null>(null);
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
      } catch (err) {
        setError(`문제를 불러오지 못했습니다.:${err}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subjectId, mode]);

  const renderQuizArea = () => {
    if (loading) {
      return <Loading />;
    }
    if (error) {
      return <ErrorMessage message={error} />;
    }
    if (questions.length === 0) {
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
      <StageQuiz
        questions={questions}
        subjectId={subjectId}
        stageSize={10}
        onComplete={onComplete}
        mode={mode}
      />
    );
  };

  return (
    <BottomSheetScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 헤더를 스크롤뷰의 일부로 포함시킵니다. */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{meta?.title || "문제 풀이"}</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={26} color="#6B7280" />
        </Pressable>
      </View>

      {/* 조건부 렌더링 영역 */}
      {renderQuizArea()}
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
});
