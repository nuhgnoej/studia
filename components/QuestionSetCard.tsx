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
  onLongPress: () => void;
  progress?: {
    percent: number;
    lastIndex: number;
    total: number;
  };
  invisible?: boolean;
};

export default function QuestionSetCard({
  item,
  onPress,
  onLongPress,
  progress,
  invisible,
}: Props) {
  const solved = progress
    ? progress.percent === 0
      ? 0
      : progress.lastIndex + 1
    : 0;
  const cardStyle = [styles.container, invisible && { opacity: 0 }];
  return (
    <View style={cardStyle}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onLongPress={onLongPress}
      >
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

        {progress && (
          <View style={{ marginTop: 8 }}>
            <View
              style={{ height: 6, backgroundColor: "#eee", borderRadius: 4 }}
            >
              <View
                style={{
                  width: `${Math.round(progress.percent * 100)}%`,
                  height: "100%",
                  backgroundColor: "#10b981",
                  borderRadius: 4,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                color: "#4b5563",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              {solved} / {progress.total} 문제 완료 (
              {Math.round(progress.percent * 100)}%)
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: "relative",
    backgroundColor: "#fff",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
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
