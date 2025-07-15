// components/QuestionSetCard.tsx

import { Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  item: {
    id: string;
    title: string;
    description?: string;
  };
  onDeleted?: () => void;
  onPress?: () => void;
};

export default function QuestionSetCard({ item, onDeleted, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.cardDetail}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
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
});
