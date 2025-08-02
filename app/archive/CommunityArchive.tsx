import ArchiveList from "@/components/archive/ArchiveList";
import FAB from "@/components/FAB";
import { saveArchiveMetadata } from "@/lib/firebase/archive";
import { auth, db, storage } from "@/lib/firebase/firebase";
import * as DocumentPicker from "expo-document-picker";
import { collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

type ArchiveItem = {
  id: string;
  title: string;
  uploader: string;
  description: string;
  questionsCount: number;
  storagePath: string;
};

export default function CommunityArchive() {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchives = async () => {
    try {
      const snapshot = await getDocs(collection(db, "communityArchives"));
      const list: ArchiveItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          uploader: data.uploader,
          description: data.description,
          questionsCount: data.questionsCount,
          storagePath: data.storagePath,
        };
      });
      setArchives(list);
    } catch (err) {
      console.error("Firestore 데이터 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchArchives();
  }, []);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      const response = await fetch(file.uri);

      // ✅ 1. JSON 파싱
      const json = await response.json();

      const metadata = json.metadata ?? {};
      const questions = json.questions ?? [];

      const questionsCount =
        typeof metadata.num_questions === "number"
          ? metadata.num_questions
          : Array.isArray(questions)
          ? questions.length
          : 0;

      const uploader = auth.currentUser?.displayName ?? "unknown";
      // const uploader = metadata.author ?? "unknown";

      // ✅ 2. blob 변환 → 업로드
      const blob = await (await fetch(file.uri)).blob();

      const fileName = file.name || `archive-${Date.now()}.json`;
      const storagePath = `archives/${fileName}`;
      const fileRef = ref(storage, storagePath);

      await uploadBytes(fileRef, blob);

      // ✅ 3. Firestore에 메타데이터 저장
      await saveArchiveMetadata({
        title: metadata.title ?? fileName.replace(".json", ""),
        uploader,
        description: metadata.description ?? "설명이 없습니다.",
        questionsCount,
        storagePath,
      });

      Alert.alert("업로드 성공", `"${fileName}" 이 업로드되었습니다.`);
    } catch (error) {
      console.error("업로드 실패:", error);
      Alert.alert("업로드 실패", "파일을 업로드하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      {/* <ArchiveList data={communityData} /> */}
            {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : (
        <ArchiveList data={archives} />
      )}
      <FAB icon="upload-file" label="업로드" onPress={handleUpload} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
