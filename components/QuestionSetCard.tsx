// components/QuestionSetCard.tsx
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { deleteQuestionSetById } from "@/lib/db/delete";

export default function QuestionSetCard({
  item,
  onDeleted,
}: {
  item: any;
  onDeleted: () => void;
}) {
  const handleDelete = async () => {
    Alert.alert("삭제 확인", `${item.title} 세트를 정말 삭제하시겠습니까?`, [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await deleteQuestionSetById(item.id);
          onDeleted();
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDetail}>ID: {item.id}</Text>
        <Text style={styles.cardDetail}>문제 수: {item.num_questions}</Text>
        <Text style={styles.cardDetail}>업로드일: {item.created_at}</Text>
      </View>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
        <Ionicons name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    color: "#555",
  },
  deleteButton: {
    marginLeft: 16,
    backgroundColor: "tomato",
    padding: 8,
    borderRadius: 8,
  },
});
