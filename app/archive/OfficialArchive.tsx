import ArchiveList, { ArchiveItem } from "@/components/archive/ArchiveList";
import { insertMetadata, insertQuestions } from "@/lib/db/insert";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

// const mockData = [
//   {
//     id: "1",
//     title: "프론트엔드 개발 기초 세트",
//     uploader: "odineyes2",
//     description: "HTML, CSS, JavaScript 기본기를 다지는 실습 중심 세트입니다.",
//     questionsCount: 10,
//   },
//   {
//     id: "2",
//     title: "React.js 핵심 개념 세트",
//     uploader: "odineyes2",
//     description:
//       "컴포넌트, 상태 관리, 훅 등 React 핵심을 다룬 문제 모음입니다.",
//     questionsCount: 10,
//   },
//   {
//     id: "3",
//     title: "Git & GitHub 버전관리 세트",
//     uploader: "odineyes2",
//     description: "Git 명령어, 협업 플로우, 브랜치 전략 등을 실전으로 익힙니다.",
//     questionsCount: 10,
//   },
//   {
//     id: "4",
//     title: "Python 기초 문법 연습 세트",
//     uploader: "odineyes2",
//     description:
//       "조건문, 반복문, 함수 등 Python의 기초 문법 문제로 구성된 세트입니다.",
//     questionsCount: 10,
//   },
//   {
//     id: "5",
//     title: "머신러닝 기본 개념 세트",
//     uploader: "odineyes2",
//     description: "지도/비지도 학습, 모델 평가, 과적합 등의 개념을 다룹니다.",
//     questionsCount: 10,
//   },
//   {
//     id: "6",
//     title: "딥러닝 핵심 이론 세트",
//     uploader: "odineyes2",
//     description:
//       "신경망, CNN, RNN, 오차역전파 등의 딥러닝 개념을 문제로 풀어봅니다.",
//     questionsCount: 10,
//   },
//   {
//     id: "7",
//     title: "AI 서비스 설계 실전 세트",
//     uploader: "odineyes2",
//     description:
//       "AI 기반 서비스 기획, 모델 선택, 데이터 처리 전략 등 실전 사례 기반 세트입니다.",
//     questionsCount: 10,
//   },
//   {
//     id: "8",
//     title: "SQL & 데이터베이스 기초 세트",
//     uploader: "odineyes2",
//     description:
//       "SELECT, JOIN, GROUP BY 등 기본 SQL 문법을 다지는 문제 세트입니다.",
//     questionsCount: 10,
//   },
//   {
//     id: "9",
//     title: "자료구조 & 알고리즘 연습 세트",
//     uploader: "odineyes2",
//     description:
//       "스택, 큐, 정렬, 이진트리, 그래프 등의 기본 알고리즘 문제로 구성되어 있습니다.",
//     questionsCount: 10,
//   },
//   {
//     id: "10",
//     title: "API & 백엔드 기초 세트",
//     uploader: "odineyes2",
//     description:
//       "REST API, Express, Node.js 기반 백엔드 기초 문제로 구성된 세트입니다.",
//     questionsCount: 10,
//   },
//   {
//     id: "11",
//     title: "LLM 및 생성형 AI 세트",
//     uploader: "odineyes2",
//     description:
//       "GPT, 파인튜닝, 임베딩, RAG 등 최신 생성형 AI 기술 문제 세트입니다.",
//     questionsCount: 10,
//   },
// ];

export default function CommunityArchive() {
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
      Alert.alert(
        "다운로드 완료",
        `총 ${data.questions.length}문제가 등록되었습니다.`,
        [
          {
            text: "확인",
            // onPress: () => loadSets(),
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
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : (
        <ArchiveList
          data={archives}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onImport={handleJsonData}
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
