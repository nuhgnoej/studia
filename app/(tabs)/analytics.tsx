import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { getAnswersBySubjectId } from "@/lib/db";
import { questionFileMap } from "@/lib/questionFileMap";
import { AnswerRecord } from "@/lib/types";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function AnalyticsScreen() {
  const [quizStats, setQuizStats] = useState<AnswerRecord[] | []>([]);

  const fetchStats = async (subject_id: string) => {
    const results = await getAnswersBySubjectId(subject_id);
    return results;
  };

  const handlePress = async (filename: string) => {
    const results = await fetchStats(filename);
    setQuizStats(results);
  };

  return (
    <ScrollView style={styles.container}>
      <TabBarIcon name="bar-chart" />
      <Text>This is future Analytics</Text>
      {Object.entries(questionFileMap).map(([filename, { name }]) => (
        <Pressable
          key={filename}
          style={styles.button}
          onPress={() => handlePress(filename)}
        >
          <Text style={styles.buttonText}>{name}</Text>
        </Pressable>
      ))}
      {quizStats ? (
        <Text>{JSON.stringify(quizStats)}</Text>
      ) : (
        <Text>Not loaded...</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  buttonText: {
    fontSize: 16,
  },
});
