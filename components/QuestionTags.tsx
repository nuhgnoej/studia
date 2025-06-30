// components/QuestionTags.tsx

import { View, Text, StyleSheet } from "react-native";

export default function QuestionTags({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <Text key={tag} style={styles.tag}>
          #{tag}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: "#374151",
  },
});
