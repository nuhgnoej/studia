// components/QuestionSetCard.tsx

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTagIcon } from "@/hooks/useTagIcon";
import { useMemo } from "react";

type Props = {
  item: {
    id: string;
    title: string;
    description?: string;
    tags?: string;
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

  const parsedTags = useMemo(() => {
    if (item.tags && typeof item.tags === "string") {
      try {
        return JSON.parse(item.tags);
      } catch (e) {
        console.error("Failed to parse tags:", item.tags, e);
        return [];
      }
    }
    return [];
  }, [item.tags]);

  const { iconSource, isLoading } = useTagIcon(parsedTags);

  return (
    <View style={cardStyle}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        {/* 아이콘 이미지 (배경 역할) */}
        <View style={styles.imageContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4338ca" />
          ) : (
            <Image
              source={iconSource}
              style={styles.image} // 스타일 변경
              resizeMode="cover"
            />
          )}
        </View>

        {/* 제목과 설명이 포함된 반투명 오버레이 */}
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

        {/* 진행률 표시 바 (내부로 이동) */}
        {progress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.round(progress.percent * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
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
    backgroundColor: "#f3f4f6",
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
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
  progressContainer: {
    // 변경: 스타일 수정
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
