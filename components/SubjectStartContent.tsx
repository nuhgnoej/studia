import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { getMetadataBySubjectId } from "@/lib/db";
import { Metadata } from "../lib/types";
import { SectionCard, ActionButton } from "@/components/ui/ActionComponents";
import MetadataCard from "@/components/MetadataCard";

type Props = {
  subjectId: string;
};

export default function SubjectStartContent({ subjectId }: Props) {
  const router = useRouter();
  const [meta, setMeta] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeta = async () => {
      if (!subjectId) return;
      setLoading(true);
      try {
        const data = await getMetadataBySubjectId(subjectId);
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

  return (
    <View style={styles.container}>
      <SectionCard title={meta.title}>
        <View style={styles.buttonContainer}>
          <ActionButton
            icon="play-arrow"
            label="문제 풀기 시작"
            onPress={() => router.push(`/subject/${subjectId}/quiz`)}
            variant="primary"
          />
          <ActionButton
            icon="playlist-add-check"
            label="틀린 문제만 풀기"
            onPress={() => router.push(`/subject/${subjectId}/quiz?mode=wrong`)}
            variant="neutral"
          />
        </View>
      </SectionCard>

      <View style={{ marginTop: 16 }} />

      <SectionCard title="문제 세트 정보">
        <MetadataCard meta={meta} />
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    gap: 12,
  },
});
