// components/profile/InterestSelectModal.tsx

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { INTEREST_OPTIONS } from "@/lib/constants";
import { ActionButton } from "../ui/ActionComponents";
import { CheckboxRow } from "../ui/SettingsRows";

type Props = {
  visible: boolean;
  initialInterests: string[];
  onClose: () => void;
  onSave: (interests: string[]) => void;
};

export default function InterestSelectModal({
  visible,
  initialInterests,
  onClose,
  onSave,
}: Props) {
  const [selected, setSelected] = useState<string[]>(initialInterests);

  const handleToggle = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = () => {
    onSave(selected);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>관심분야 선택</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>닫기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {INTEREST_OPTIONS.map((option) => (
              <CheckboxRow
                key={option}
                label={option}
                value={selected.includes(option)}
                onValueChange={() => handleToggle(option)}
              />
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <ActionButton
              label="저장하기"
              onPress={handleSave}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// --- 스타일 (길어서 생략 가능) ---
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  closeButton: { fontSize: 16, color: "#007AFF" },
  scrollContent: { paddingVertical: 16 },
  footer: { paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
});
