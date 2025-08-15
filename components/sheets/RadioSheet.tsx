// components/sheets/RadioSheet.tsx

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors"; // 경로 확인 필요
import { BottomSheet } from "../ui/BottomSheet";

export function RadioSheet({
  title,
  visible,
  options,
  selectedKey,
  onSelect,
  onClose,
}: {
  title: string;
  visible: boolean;
  options: { key: string; label: string; description?: string }[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ gap: 12 }}>
        <Text style={styles.sheetTitle}>{title}</Text>
        {options.map((opt) => {
          const selected = opt.key === selectedKey;
          return (
            <Pressable
              key={opt.key}
              style={({ pressed }) => [
                styles.radioRow,
                pressed && styles.rowPressed,
              ]}
              onPress={() => {
                onSelect(opt.key);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.radioLabel}>{opt.label}</Text>
                {opt.description ? (
                  <Text style={styles.radioDesc}>{opt.description}</Text>
                ) : null}
              </View>
              <MaterialIcons
                name={
                  selected ? "radio-button-checked" : "radio-button-unchecked"
                }
                size={22}
                color={selected ? Colors.common.primary.bg : "#9CA3AF"}
              />
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  rowPressed: { opacity: 0.9 },
  radioRow: {
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radioLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  radioDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
});
