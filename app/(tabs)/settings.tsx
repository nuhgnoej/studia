import {
  View,
  Button,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
} from "react-native";
import { handleExportData } from "@/lib/export";
import { questionFileMap } from "@/lib/questionFileMap";

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>설정</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>데이터 내보내기</Text>
        <View>
          {Object.entries(questionFileMap).map(([filename, { name }]) => (
            <Pressable
              key={filename}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => handleExportData(filename)}
            >
              <Text style={styles.buttonText}>{name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 필요시 데이터 초기화 버튼도 추가 가능 */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  buttonText: {
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
