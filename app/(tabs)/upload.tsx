// app/upload.tsx

import { View, Text, Alert, ActivityIndicator, StyleSheet } from "react-native";
import JsonUploader from "@/components/JsonUploader";
import { insertMetadata, insertQuestions } from "@/lib/db/insert";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function UploadScreen() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleJsonData = async (data: any) => {
    if (!data.metadata || !Array.isArray(data.questions)) {
      alert("올바르지 않은 형식입니다.");
      return;
    }

    try {
      setIsUploading(true);

      await insertMetadata(data.metadata);
      console.log("✅ 메타데이터 삽입 완료");

      await insertQuestions(data.metadata.id, data.questions);
      console.log("✅ 질문 삽입 완료");

      Alert.alert(
        "업로드 완료",
        `총 ${data.questions.length}문제가 등록되었습니다.`,
        [
          {
            text: "확인",
            onPress: () => router.replace("/home"),
          },
        ]
      );
    } catch (err) {
      console.error("❌ 업로드 실패:", err);
      Alert.alert("오류", "업로드 중 문제가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>JSON 업로드</Text>
        <Text style={styles.description}>
          문제 세트를 JSON으로 업로드하세요
        </Text>
      </View>

      {/* Actions */}
      {isUploading ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={{ marginTop: 10 }}>업로드 중...</Text>
        </View>
      ) : (
        <JsonUploader onJsonParsed={handleJsonData} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  description: { fontSize: 16, color: "#333" },
});
