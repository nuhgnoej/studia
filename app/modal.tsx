// app/modal.tsx
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";
import { Stack } from "expo-router";

export default function ModalScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "소개",
          headerBackTitle: "뒤로",
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📘 Studia(Beta)</Text>
        <Text style={styles.subtitle}>직무 시험 대비 문제 풀이 앱</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>✅ 주요 기능</Text>
          <Text style={styles.text}>• 문제 세트 선택 후 풀이</Text>
          <Text style={styles.text}>• 객관식 / 주관식 자동 분기</Text>
          <Text style={styles.text}>• 정답 판별 및 풀이 결과 저장</Text>
          <Text style={styles.text}>• SQLite 기반 오프라인 저장</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>📦 향후 업데이트 예정</Text>
          <Text style={styles.text}>• 정답률 분석 대시보드</Text>
          <Text style={styles.text}>• Supabase 연동 (로그인 및 백업)</Text>
          <Text style={styles.text}>• 틀린 문제 복습 기능</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>ℹ️ 앱 정보</Text>
          <Text style={styles.text}>버전: 1.0.0</Text>
          <Text style={styles.text}>개발자: odineyes</Text>
        </View>

        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "flex-start",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 22,
  },
});
