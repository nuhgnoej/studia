// components/profile/InterestSection.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SectionCard } from "@/components/ui/ActionComponents";
import { Chip } from "@/components/ui/Chip";
import { MaterialIcons } from "@expo/vector-icons";

type InterestSectionProps = {
  interests: string[];
  onPressEdit: () => void;
};

export default function InterestSection({
  interests,
  onPressEdit,
}: InterestSectionProps) {
  return (
    <SectionCard
      title="관심분야"
      actionButton={
        <TouchableOpacity onPress={onPressEdit} style={styles.editButton}>
          <MaterialIcons name="edit" size={20} color="#4B5563" />
        </TouchableOpacity>
      }
    >
      <View style={styles.chipContainer}>
        {interests.length > 0 ? (
          interests.map((item) => <Chip key={item} label={item} />)
        ) : (
          <Text style={styles.placeholderText}>
            관심분야를 추가하여 맞춤형 콘텐츠를 추천 받아보세요!
          </Text>
        )}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  editButton: {
    padding: 4,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  placeholderText: {
    color: "#6B7280",
    fontSize: 14,
    fontStyle: "italic",
  },
});
