// components/FAB.tsx

import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

type Props = {
  icon?: keyof typeof MaterialIcons.glyphMap;
  label?: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function FAB({ icon = "add", label, onPress, style, textStyle }: Props) {
  return (
    <TouchableOpacity style={[styles.fab, style]} onPress={onPress} activeOpacity={0.8}>
      <MaterialIcons name={icon} size={24} color="#fff" />
      {label && <Text style={[styles.label, textStyle]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 32,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  label: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
});
