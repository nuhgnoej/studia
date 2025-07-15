// components/TagsEditor.tsx

import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";

type Props = {
  tags: string[];
  onChange: (newTags: string[]) => void;
};

export default function TagsEditor({ tags, onChange }: Props) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed.length > 0 && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const handleRemove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>태그:</Text>
      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <Pressable
            key={tag}
            style={styles.tag}
            onPress={() => handleRemove(tag)}
          >
            <Text style={styles.tagText}>#{tag} ✕</Text>
          </Pressable>
        ))}
        <TextInput
          style={styles.input}
          placeholder="추가 +"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleAdd}
          blurOnSubmit={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  tagText: {
    color: "#374151",
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    minWidth: 60,
    fontSize: 13,
  },
});
