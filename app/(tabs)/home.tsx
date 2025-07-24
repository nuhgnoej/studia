// app/home.tsx

import QuestionSetCard from "@/components/QuestionSetCard";
import { getAllQuestionSets } from "@/lib/db/query";
import { auth } from "@/lib/firebase";
import { useFocusEffect, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useCallback, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const [sets, setSets] = useState<any[]>([]);

  const loadSets = async () => {
    const results = await getAllQuestionSets();
    setSets(results);
  };

  useFocusEffect(
    useCallback(() => {
      loadSets().catch(console.error);
    }, [])
  );

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>홈</Text>
        <Text style={styles.welcomeText}>
          {auth.currentUser
            ? `Welcome, ${auth.currentUser?.email}`
            : "Welcome, This is OnDevice Mode."}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.buttonRow}>
        <Button title="Upload JSON" onPress={() => router.replace("/upload")} />
        <View style={{ width: 12 }} />
        {auth.currentUser ? (
          <Button title="Sign Out" color="tomato" onPress={handleSignOut} />
        ) : (
          <Button
            title="Log In"
            color="tomato"
            onPress={() => router.push("/login")}
          />
        )}
      </View>

      {/* List */}
      <FlatList
        data={sets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <QuestionSetCard
            item={item}
            onDeleted={loadSets}
            onPress={() => router.push(`/subject/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  welcomeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    color: "#555",
  },
});
