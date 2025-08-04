import ArchiveList from "@/components/archive/ArchiveList";
import FAB from "@/components/FAB";
import { insertMetadata, insertQuestions } from "@/lib/db/insert";
import { saveArchiveMetadata } from "@/lib/firebase/archive";
import { auth, db, storage } from "@/lib/firebase/firebase";
import * as DocumentPicker from "expo-document-picker";
import {
  collection,
  doc,
  getDocs,
  increment,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
// import { useRouter } from "expo-router";

type ArchiveItem = {
  id: string;
  title: string;
  uploader: string;
  description: string;
  questionsCount: number;
  storagePath: string;
  downloadCount: number;
};

export default function CommunityArchive() {
  // const router = useRouter();

  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchArchives = async () => {
    setLoading(true);
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
          downloadCount: data.downloadCount ?? 0,
        };
      });
      setArchives(list);
    } catch (err) {
      console.error("Firestore 데이터 로딩 실패:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchArchives();
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleUpload = async () => {
    try {
      setUploading(true); // ✅ 업로드 시작

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

      // ✅ 4. 업로드 후 목록 갱신
      await fetchArchives();
    } catch (error) {
      console.error("업로드 실패:", error);
      Alert.alert("업로드 실패", "파일을 업로드하는 중 오류가 발생했습니다.");
    } finally {
      setUploading(false); // ✅ 업로드 끝
    }
  };

  const handleJsonData = async (data: any) => {
    if (!data.metadata || !Array.isArray(data.questions)) {
      alert("올바르지 않은 형식입니다.");
      return;
    }

    try {
      await insertMetadata(data.metadata);
      await insertQuestions(data.metadata.id, data.questions);
      Alert.alert(
        "다운로드 완료",
        `총 ${data.questions.length}문제가 등록되었습니다.`,
        [
          {
            text: "확인",
            // onPress: () => router.push("/"),
          },
        ]
      );
    } catch (err) {
      console.error("❌ 다운로드 실패:", err);
      Alert.alert("오류", "다운로드 중 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      {loading || uploading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : (
        <ArchiveList
          data={archives}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onImport={handleJsonData}
          onDownload={async (item) => {
            await updateDoc(doc(db, "communityArchives", item.id), {
              downloadCount: increment(1),
            });
            await fetchArchives();
          }}
        />
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
