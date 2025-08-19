// components/Quiz/SubjectStartContent.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
  ImageBackground,
} from "react-native";
import { getMetadataBySubjectId } from "@/lib/db";
import { Metadata } from "../../lib/types";
import { SectionCard, ActionButton } from "@/components/ui/ActionComponents";
import MetadataCard from "@/components/Quiz//MetadataCard";
import { MaterialIcons } from "@expo/vector-icons";
import {
  defaultBackground,
  tagToBackgroundImage,
} from "@/lib/tagToBackgroundImage";

type Props = {
  subjectId: string;
  onStartQuiz: (mode: "normal" | "wrong") => void;
  onClose: () => void;
};

export default function SubjectStartContent({
  subjectId,
  onStartQuiz,
  onClose,
}: Props) {
  const [meta, setMeta] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeta = async () => {
      if (!subjectId) return;
      setLoading(true);
      try {
        const data = await getMetadataBySubjectId(subjectId);

        if (data && typeof data.tags === "string") {
          try {
            data.tags = JSON.parse(data.tags);
          } catch (e) {
            console.error("Tags 파싱 실패:", e);
            data.tags = [];
          }
        }
        console.log(JSON.stringify(data));
        setMeta(data);
      } catch (e) {
        console.error("문제 정보 불러오기 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, [subjectId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!meta) {
    return (
      <View style={styles.centered}>
        <Text>문제 세트 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const displayTag = meta.tags?.[0] ?? "default";
  // console.log(`displayTag: ${displayTag}`);
  const backgroundSource =
    tagToBackgroundImage[displayTag] ?? defaultBackground;
  // const log =
  //   backgroundSource === defaultBackground
  //     ? "기본이미지 출력됨"
  //     : "백그라운드 이미지 출력됨";
  // console.log(log);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundSource}
        style={StyleSheet.absoluteFill} // 부모 뷰를 꽉 채우는 스타일
        imageStyle={{ opacity: 0.1 }} // 이미지 투명도 조절
        resizeMode="cover" // 화면을 꽉 채우도록 설정
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{meta.title}</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={26} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SectionCard title="퀴즈 시작하기">
          <View style={styles.buttonContainer}>
            <ActionButton
              icon="play-arrow"
              label="문제 풀기 시작"
              onPress={() => onStartQuiz("normal")}
              variant="primary"
            />
            <ActionButton
              icon="playlist-add-check"
              label="틀린 문제만 풀기"
              onPress={() => onStartQuiz("wrong")}
              variant="neutral"
            />
          </View>
        </SectionCard>

        <SectionCard title="문제 세트 정보">
          <MetadataCard meta={meta} />
        </SectionCard>
      </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // ✨ ScrollView 내부 콘텐츠를 위한 스타일 추가
  scrollContent: {
    padding: 16, // 전체적인 안쪽 여백
    gap: 20, // 각 섹션 카드 사이의 간격
  },
  buttonContainer: {
    gap: 12,
  },
});
