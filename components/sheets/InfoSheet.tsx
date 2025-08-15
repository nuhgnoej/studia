// components/sheets/InfoSheet.tsx

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheet } from "../ui/BottomSheet";

type InfoSheetStatus = "success" | "error";

export function InfoSheet({
  visible,
  title,
  description,
  status = "success",
  onClose,
}: {
  visible: boolean;
  title: string;
  description: string;
  status?: InfoSheetStatus;
  onClose: () => void;
}) {
  const statusConfig = {
    success: {
      icon: "check-circle" as const,
      color: "#16A34A", // Green
    },
    error: {
      icon: "error" as const,
      color: "#DC2626", // Red
    },
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <MaterialIcons
          name={statusConfig[status].icon}
          size={48}
          color={statusConfig[status].color}
        />
        <Text style={styles.sheetTitle}>{title}</Text>
        <Text style={styles.sheetDesc}>{description}</Text>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.sheetButton,
            { backgroundColor: pressed ? "#E5E7EB" : "#F3F4F6" },
          ]}
        >
          <Text style={styles.sheetButtonText}>확인</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    alignItems: "center", // Center align content
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  sheetDesc: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    textAlign: "center", // Center align text
  },
  sheetButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Full width
    marginTop: 8,
  },
  sheetButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
});
