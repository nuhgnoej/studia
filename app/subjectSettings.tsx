// app/subjectSettings.tsx

import { View, Text, Button, Alert, FlatList } from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { resetProgress } from "@/lib/db/progress";
import { deleteSubject, getAllSubjects } from "@/lib/db/subject";
import { useNavigation } from "expo-router";

export default function SubjectSettingsScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "과목 설정",
      headerStyle: {
        backgroundColor: "#f4f4f4",
      },
      headerTintColor: "#333",
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 18,
      },
    });
  }, [navigation]);

  const [subjects, setSubjects] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const list = await getAllSubjects();
    setSubjects(list);
  };

  const handleDelete = (id: string) => {
    Alert.alert("과목 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSubject(id);
            await loadSubjects();
          } catch (e: any) {
            Alert.alert("삭제 실패", "데이터베이스 오류가 발생했습니다.");
            console.error(e);
          }
        },
      },
    ]);
  };

  const handleResetProgress = async (id: string) => {
    try {
      await resetProgress(id);
      Alert.alert("초기화 완료", "진행도가 초기화되었습니다.");
    } catch (e) {
      Alert.alert("초기화 실패", "데이터베이스 오류가 발생했습니다.");
      console.error(e);
    }
  };

  return (
    <FlatList
      data={subjects}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          style={{ padding: 12, borderBottomWidth: 1, borderColor: "#ccc" }}
        >
          <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <Button
              title="진행도 초기화"
              onPress={() => handleResetProgress(item.id)}
            />
            <View style={{ width: 12 }} />
            <Button
              color="red"
              title="과목 삭제"
              onPress={() => handleDelete(item.id)}
            />
          </View>
        </View>
      )}
    />
  );
}
