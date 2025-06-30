import { View, Button, StyleSheet, ScrollView, Text } from "react-native";
import { handleExportData } from "@/lib/export";

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>설정</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>데이터 관리</Text>
        <Button
          title="데이터 내보내기 (Export JSON)"
          onPress={handleExportData}
        />
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
});
