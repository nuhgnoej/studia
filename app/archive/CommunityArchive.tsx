import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const mockData = [
  {
    id: "1",
    title: "복합발전운전원 기출 세트 2024",
    uploader: "odineyes",
    description: "2024년 기출을 기반으로 구성된 복합 발전 문제 세트입니다.",
    questionsCount: 120,
  },
  {
    id: "2",
    title: "전기이론 기본 세트",
    uploader: "user123",
    description: "전기이론 개념 및 계산 문제 위주로 구성된 세트입니다.",
    questionsCount: 80,
  },
];

export default function CommunityArchive() {
  return (
    <View>
      {/* 문제 카드 목록 렌더링 */}
      <FlatList
        data={mockData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.meta}>
                📦 {item.questionsCount}문제 · 업로더: {item.uploader}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={() => {
                Alert.alert("아카이브 다운로드 서비스는 구현 중입니다.");
              }}
            >
              <MaterialIcons name="file-download" size={20} color="white" />
              <Text style={{ color: "white", marginLeft: 6 }}>다운로드</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  card: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: "#666",
  },
  meta: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  downloadBtn: {
    marginTop: 12,
    backgroundColor: "#444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
});
