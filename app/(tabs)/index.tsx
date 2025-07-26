// app/(tabs)/index.tsx

import QuestionSetCard from "@/components/QuestionSetCard";
import { getAllQuestionSets } from "@/lib/db/query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { commonStyles } from "../../styles/common";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { insertMetadata, insertQuestions } from "@/lib/db/insert";
import JsonUploadFAB from "@/components/JsonUploadFAB";
import { getProgressSummary } from "@/lib/db/progress";
import ScreenHeaderWithFAB from "@/components/ScreenHeaderWithFAB";

type ProgressInfo = {
  lastIndex: number;
  percent: number;
  total: number;
};

export default function Home() {
  const router = useRouter();
  const [sets, setSets] = useState<any[]>([]);
  const [fabOpen, setFabOpen] = useState(false);
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, ProgressInfo>>(
    {}
  );

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
      Alert.alert(
        "업로드 완료",
        `총 ${data.questions.length}문제가 등록되었습니다.`,
        [
          {
            text: "확인",
            onPress: () => loadSets(),
          },
        ]
      );
    } catch (err) {
      console.error("❌ 업로드 실패:", err);
      Alert.alert("오류", "업로드 중 문제가 발생했습니다.");
    }
  };

  return (
    <Pressable
      style={commonStyles.container}
      onPress={() => {
        if (fabOpen) setFabOpen(false);
      }}
    >
      {/* 공통 헤더 컴포넌트 */}
      <ScreenHeaderWithFAB
        title="홈"
        description={
          user
            ? `환영합니다, ${user.displayName} 님(${user.email})`
            : `온디바이스 모드로 사용 중입니다.`
        }
      />

      <View style={{ marginBottom: 24 }} />

      {sets && sets.length !== 0 ? (
        <FlatList
          data={sets}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "center",
            gap: 12,
            marginBottom: 12,
          }}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingBottom: 40,
            paddingTop: 12,
          }}
          renderItem={({ item }) => (
            <QuestionSetCard
              item={item}
              onPress={() => router.push(`/subject/${item.id}`)}
              progress={progressMap[item.id]}
            />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="cloud-upload" size={48} color="#ccc" />
          <Text style={styles.emptyText}>아직 문제 세트가 없습니다.</Text>
        </View>
      )}

      <JsonUploadFAB onUpload={handleJsonData} />
    </Pressable>
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
