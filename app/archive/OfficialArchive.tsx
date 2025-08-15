// app/archive/OfficialArchive.tsx

import ArchiveList, { ArchiveItem } from "@/components/archive/ArchiveList";
import { insertMetadata, insertQuestions } from "@/lib/db/insert";
import { db } from "@/lib/firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  increment,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useNotification } from "@/contexts/NotificationContext";

export default function CommunityArchive() {
  const { showNotification } = useNotification();

  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "officialArchives"));
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

  const handleJsonData = async (data: any) => {
    if (!data.metadata || !Array.isArray(data.questions)) {
      alert("올바르지 않은 형식입니다.");
      return;
    }

    try {
      await insertMetadata(data.metadata);
      await insertQuestions(data.metadata.id, data.questions);
      showNotification({
        title: "다운로드 완료",
        description: `총 ${data.questions.length}문제가 등록되었습니다.`,
        status: "success",
      });
    } catch (err) {
      console.error("❌ 다운로드 실패:", err);
      showNotification({
        title: "다운로드 실패",
        description: "파일을 다운로드하는 중 오류가 발생했습니다.",
        status: "error",
      });
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : (
        <ArchiveList
          data={archives}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onImport={handleJsonData}
          onDownload={async (item) => {
            await updateDoc(doc(db, "officialArchives", item.id), {
              downloadCount: increment(1),
            });
            await fetchArchives();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
