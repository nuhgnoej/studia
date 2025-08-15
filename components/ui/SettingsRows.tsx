// components/ui/SettingsRows.tsx

import React from "react";
import { View, Text, StyleSheet, Pressable, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors"; // 경로 확인 필요

export function SwitchRow({
  icon,
  label,
  value,
  onValueChange,
  helper,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  helper?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <MaterialIcons name={icon} size={18} color="#111827" />
        </View>
        <View style={{ gap: 2 }}>
          <Text style={styles.rowLabel}>{label}</Text>
          {helper ? <Text style={styles.rowHelper}>{helper}</Text> : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
        thumbColor={value ? Colors.common.primary.bg : "#fff"}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

export function ListRow({
  icon,
  label,
  valueText,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  valueText?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <MaterialIcons name={icon} size={18} color="#111827" />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {valueText ? <Text style={styles.valueText}>{valueText}</Text> : null}
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F8FAFB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowPressed: {
    opacity: 0.9,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  rowHelper: {
    fontSize: 12,
    color: "#6B7280",
  },
  valueText: {
    fontSize: 13,
    color: "#6B7280",
  },
});
