// app/(tabs)/index.tsx
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function TabOneScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 Studia</Text>
      <Text style={styles.subtitle}>당신만의 문제은행 학습 도우미</Text>

      <View style={styles.separator} />

      <Text style={styles.paragraph}>
        Studia는 직무 시험 준비를 위한 카드 기반 학습 앱입니다.{"\n"}
        JSON으로 구성된 문제은행을 로컬에 저장하고, 언제 어디서든 반복 학습할 수
        있어요.
      </Text>

      <Text style={styles.paragraph}>
        ✨ 주요 기능:
        {"\n"}• 오프라인 카드 학습
        {"\n"}• 오답 노트 관리
        {"\n"}• 통계 기반 복습
      </Text>

      <Text style={styles.paragraph}>하단 탭을 통해 학습을 시작해 보세요!</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  separator: {
    marginVertical: 24,
    height: 1,
    width: "80%",
  },
});
