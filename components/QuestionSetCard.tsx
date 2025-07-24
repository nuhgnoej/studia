// components/QuestionSetCard.tsx

import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  item: {
    id: string;
    title: string;
    description?: string;
    image?: string;
  };
  onPress?: () => void;
};

export default function QuestionSetCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={
          item.image
            ? { uri: item.image }
            : require("@/assets/images/default-card.png")
        }
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.cardDetail} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: "relative",
    minWidth: 0,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)", // 흐린 오버레이 (optional)
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  cardDetail: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 6,
  },
});
