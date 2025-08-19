// components/ui/Chip.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const Chip = ({ label }: { label: string }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#E5E7EB", // light gray
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  chipText: {
    color: "#374151", // dark gray
    fontSize: 14,
    fontWeight: "500",
  },
});