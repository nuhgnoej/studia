// components/sheets/ConfirmSheet.tsx

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors, CommonColorVariant } from "../../constants/Colors"; // 경로 확인 필요
import { BottomSheet } from "../ui/BottomSheet";

export function ConfirmSheet({
  visible,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: CommonColorVariant;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const palette = Colors.common[confirmVariant];

  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <View style={{ gap: 12 }}>
        <Text style={styles.sheetTitle}>{title}</Text>
        {description ? (
          <Text style={styles.sheetDesc}>{description}</Text>
        ) : null}
        <Pressable
          onPress={onConfirm}
          style={({ pressed }) => [
            styles.sheetButton,
            { backgroundColor: pressed ? palette.pressedBg : palette.bg },
          ]}
        >
          <Text style={[styles.sheetButtonText, { color: palette.fg }]}>
            {confirmText}
          </Text>
        </Pressable>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.sheetButton,
            { backgroundColor: pressed ? "#E5E7EB" : "#F3F4F6" },
          ]}
        >
          <Text style={[styles.sheetButtonText, { color: "#111827" }]}>
            {cancelText}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  sheetDesc: { fontSize: 14, color: "#374151", lineHeight: 20 },
  sheetButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetButtonText: { fontSize: 16, fontWeight: "700" },
});
