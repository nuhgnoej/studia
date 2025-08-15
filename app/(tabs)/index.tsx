// app/(tabs)/index.tsx

import QuestionSetCard from "@/components/QuestionSetCard";
import { getAllQuestionSets } from "@/lib/db/query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { commonStyles } from "../../styles/common";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { insertMetadata, insertQuestions } from "@/lib/db/insert";
import ExpandableFAB from "@/components/ExpandableFAB";
import { getProgressSummary } from "@/lib/db/progress";
import ScreenHeaderWithFAB from "@/components/ScreenHeaderWithFAB";
import { useNotification } from "@/contexts/NotificationContext";
import { deleteQuestionSetById } from "@/lib/db/delete";
import { ConfirmSheet } from "@/components/sheets/ConfirmSheet";
import * as Haptics from "expo-haptics";

type ProgressInfo = {
  lastIndex: number;
  percent: number;
  total: number;
};

export default function Home() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [sets, setSets] = useState<any[]>([]);
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, ProgressInfo>>(
    {}
  );
  const [setForReset, setSetForReset] = useState<any | null>(null);

  const displaySets = useMemo(() => {
    if (sets.length % 2 === 1) {
      return [...sets, { id: "dummy", empty: true }];
    }

    return sets;
  }, [sets]);

  const loadSets = async () => {
    const results = await getAllQuestionSets();
    setSets(results);
  };

  useFocusEffect(
    useCallback(() => {
      loadSets().catch(console.error);
    }, [])
  );

  useEffect(() => {
    const fetchProgress = async () => {
      const map: Record<
        string,
        { percent: number; lastIndex: number; total: number }
      > = {};
      for (const item of sets) {
        const info = await getProgressSummary(item.id);
        map[item.id] = info;
      }
      setProgressMap(map);
    };

    if (sets && sets.length > 0) {
      fetchProgress();
    }
  }, [sets]);

  const handleJsonData = async (data: any) => {
    if (!data.metadata || !Array.isArray(data.questions)) {
      alert("올바르지 않은 형식입니다.");
      return;
    }

    try {
      await insertMetadata(data.metadata);
      await insertQuestions(data.metadata.id, data.questions);
      showNotification({
        title: "문제 세트 등록 완료",
        description: `총 ${data.questions.length}문제가 등록되었습니다.`,
        status: "success",
      });
      await loadSets();
    } catch (err) {
      console.error("❌ 업로드 실패:", err);
      showNotification({
        title: "오류",
        description: "문제 등록에 실패했습니다.",
        status: "error",
      });
    }
  };

  const handleResetConfirm = async () => {
    if (!setForReset) return;

    try {
      await deleteQuestionSetById(setForReset.id);
      showNotification({
        title: "초기화 완료",
        description: `"${setForReset.title}" 문제 세트가 삭제되었습니다.`,
        status: "success",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadSets();
    } catch (error) {
      showNotification({
        title: "오류",
        description: `초기화 중 문제가 발생했습니다.:${error}`,
        status: "error",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSetForReset(null); // 상태 초기화 및 ConfirmSheet 닫기
    }
  };

  return (
    <View style={commonStyles.container}>
      {/* 공통 헤더 컴포넌트 */}
      <ScreenHeaderWithFAB
        title="홈"
        description={
          user
            ? `환영합니다, ${user.displayName} 님(${user.email})`
            : `온디바이스 모드로 사용 중입니다.`
        }
      />

      <View style={{ marginBottom: 12 }} />

      {sets && sets.length > 0 ? (
        <FlatList
          data={displaySets}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 12,
            paddingBottom: 40,
          }}
          columnWrapperStyle={{
            gap: 12,
            marginBottom: 12,
          }}
          renderItem={({ item }) => {
            return (
              <QuestionSetCard
                item={item}
                onPress={() =>
                  item.empty ? {} : router.push(`/subject/${item.id}`)
                }
                onLongPress={() => {
                  // 2. 길게 누르는 동작은 중요하므로 Heavy 스타일을 사용합니다.
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

                  // 3. 기존 로직을 실행합니다.
                  setSetForReset(item);
                }}
                progress={progressMap[item.id]}
                invisible={item.empty} // 투명 여부를 결정할 prop 추가
              />
            );
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="cloud-upload" size={48} color="#ccc" />
          <Text style={styles.emptyText}>아직 문제 세트가 없습니다.</Text>
        </View>
      )}

      <ExpandableFAB isLoggedIn={!!user} onDirectUpload={handleJsonData} />
      <ConfirmSheet
        visible={!!setForReset}
        title="문제 세트 초기화"
        description={`'${setForReset?.title}' 문제 세트와 모든 진행률을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        confirmVariant="danger"
        onConfirm={handleResetConfirm}
        onCancel={() => setSetForReset(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
    marginBottom: 8,
  },
  uploaderWrapper: {
    marginBottom: 32,
    marginHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
