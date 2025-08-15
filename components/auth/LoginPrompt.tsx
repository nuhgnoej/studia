import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ActionButton } from "@/components/ui/ActionComponents";
import { useAuthModal } from "@/contexts/AuthModalContext";

export default function LoginPrompt() {
  const { openAuthModal } = useAuthModal();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <MaterialIcons name="lock-outline" size={48} color="#9CA3AF" />
        <Text style={styles.title}>로그인이 필요합니다</Text>
        <Text style={styles.description}>
          로그인하고 모든 기능을 이용해 보세요.
        </Text>
        <View style={styles.buttonContainer}>
          <ActionButton
            icon="login"
            label="로그인 / 회원가입"
            onPress={() => openAuthModal("login")}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    // SectionCard의 그림자 스타일을 가져옴
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.04)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 24,
    width: "100%",
  },
});
