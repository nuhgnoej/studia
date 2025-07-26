import { commonStyles } from "../../styles/common";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function ArchiveScreen() {
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>문제 아카이브</Text>
        <Text style={commonStyles.headerDescription}>
          여기서 원하는 문제를 다운받으세요.
        </Text>
      </View>
      <View style={styles.content}>
        <MaterialIcons name="construction" size={64} color="#ccc" />
        <Text style={styles.placeholderText}>
          문제 아카이브는 아직 구현 중입니다.
        </Text>
      </View>
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
});
