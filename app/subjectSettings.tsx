// // app/subjectSettings.tsx

// import { View, Text, Button, Alert, FlatList } from "react-native";
// import { useEffect, useLayoutEffect, useState } from "react";
// import { resetProgress } from "@/lib/db/progress";
// import { deleteSubject, getAllSubjects } from "@/lib/db/subject";
// import { useNavigation } from "expo-router";

// export default function SubjectSettingsScreen() {
//   const navigation = useNavigation();

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       title: "과목 설정",
//       headerStyle: {
//         backgroundColor: "#f4f4f4",
//       },
//       headerTintColor: "#333",
//       headerTitleStyle: {
//         fontWeight: "bold",
//         fontSize: 18,
//       },
//     });
//   }, [navigation]);

//   const [subjects, setSubjects] = useState<{ id: string; title: string }[]>([]);

//   useEffect(() => {
//     loadSubjects();
//   }, []);

//   const loadSubjects = async () => {
//     const list = await getAllSubjects();
//     setSubjects(list);
//   };

//   const handleDelete = (id: string) => {
//     Alert.alert("과목 삭제", "정말 삭제하시겠습니까?", [
//       { text: "취소", style: "cancel" },
//       {
//         text: "삭제",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await deleteSubject(id);
//             await loadSubjects();
//           } catch (e: any) {
//             Alert.alert("삭제 실패", "데이터베이스 오류가 발생했습니다.");
//             console.error(e);
//           }
//         },
//       },
//     ]);
//   };

//   const handleResetProgress = async (id: string) => {
//     try {
//       await resetProgress(id);
//       Alert.alert("초기화 완료", "진행도가 초기화되었습니다.");
//     } catch (e) {
//       Alert.alert("초기화 실패", "데이터베이스 오류가 발생했습니다.");
//       console.error(e);
//     }
//   };

//   return (
//     <FlatList
//       data={subjects}
//       keyExtractor={(item) => item.id}
//       renderItem={({ item }) => (
//         <View
//           style={{ padding: 12, borderBottomWidth: 1, borderColor: "#ccc" }}
//         >
//           <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
//           <View style={{ flexDirection: "row", marginTop: 8 }}>
//             <Button
//               title="진행도 초기화"
//               onPress={() => handleResetProgress(item.id)}
//             />
//             <View style={{ width: 12 }} />
//             <Button
//               color="red"
//               title="과목 삭제"
//               onPress={() => handleDelete(item.id)}
//             />
//           </View>
//         </View>
//       )}
//     />
//   );
// }

// app/subjectSettings.tsx

import { View, Text, Alert, FlatList, StyleSheet } from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { resetProgress } from "@/lib/db/progress";
import { deleteSubject, getAllSubjects } from "@/lib/db/subject";
import { SectionCard, ActionButton } from "@/components/ui/ActionComponents";
import { ConfirmSheet } from "@/components/sheets/ConfirmSheet";

type Subject = {
  id: string;
  title: string;
};

// 어떤 동작에 대한 확인을 요청했는지 관리하기 위한 타입
type ConfirmAction = {
  type: "reset" | "delete";
  subject: Subject;
};

export default function SubjectSettingsScreen() {
  const navigation = useNavigation();
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // ConfirmSheet를 제어하기 위한 state
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "과목 별 설정",
      // ScreenHeaderWithFAB 와 비슷한 스타일로 맞출 수도 있습니다.
    });
  }, [navigation]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const list = await getAllSubjects();
    setSubjects(list);
  };

  // 진행도 초기화 요청 (ConfirmSheet 열기)
  const requestResetProgress = (subject: Subject) => {
    setConfirmAction({ type: "reset", subject });
  };

  // 과목 삭제 요청 (ConfirmSheet 열기)
  const requestDeleteSubject = (subject: Subject) => {
    setConfirmAction({ type: "delete", subject });
  };

  // 사용자가 ConfirmSheet에서 최종 확인을 눌렀을 때 실행될 함수
  const handleConfirm = async () => {
    if (!confirmAction) return;

    const { type, subject } = confirmAction;

    try {
      if (type === "reset") {
        await resetProgress(subject.id);
        Alert.alert(
          "초기화 완료",
          `'${subject.title}' 과목의 진행도가 초기화되었습니다.`
        );
      } else if (type === "delete") {
        await deleteSubject(subject.id);
        Alert.alert("삭제 완료", `'${subject.title}' 과목이 삭제되었습니다.`);
        await loadSubjects(); // 목록 새로고침
      }
    } catch (e) {
      Alert.alert("오류", "작업에 실패했습니다. 다시 시도해주세요.");
      console.error(e);
    } finally {
      setConfirmAction(null); // ConfirmSheet 닫기
    }
  };

  return (
    <>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SectionCard title={item.title}>
            <ActionButton
              icon="restart-alt"
              label="진행도 초기화"
              onPress={() => requestResetProgress(item)}
              variant="primary"
            />
            <ActionButton
              icon="delete-forever"
              label="과목 삭제"
              onPress={() => requestDeleteSubject(item)}
              variant="danger"
            />
          </SectionCard>
        )}
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>설정할 과목이 없습니다.</Text>
          </View>
        }
      />

      {/* 확인 Bottom Sheet */}
      <ConfirmSheet
        visible={!!confirmAction}
        title={confirmAction?.type === "reset" ? "진행도 초기화" : "과목 삭제"}
        description={`'${confirmAction?.subject.title}' 과목을 정말 ${
          confirmAction?.type === "reset" ? "초기화" : "삭제"
        }하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`}
        confirmText={confirmAction?.type === "reset" ? "초기화" : "삭제"}
        confirmVariant="danger"
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 16,
  },
  emptyContainer: {
    marginTop: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
