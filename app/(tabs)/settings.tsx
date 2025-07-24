import { StyleSheet, Text, View, Button, Alert } from "react-native";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { initDatabase } from "@/lib/db";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function SettingsScreen() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return unsubscribe; // cleanup
  }, []);

  const handleResetDatabase = async () => {
    Alert.alert("경고", "로컬 데이터베이스를 초기화하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "초기화",
        style: "destructive",
        onPress: async () => {
          await initDatabase();
          Alert.alert("완료", "로컬 데이터베이스가 초기화되었습니다.");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <View style={styles.item}>
        <Button
          title="로컬 DB 초기화"
          onPress={handleResetDatabase}
          color="crimson"
        />
      </View>

      <View style={styles.item}>
        {isLoggedIn ? (
          <Button title="로그아웃" onPress={handleLogout} color="gray" />
        ) : (
          <Button
            title="로그인 화면으로"
            // onPress={() => router.replace("/login")}
            onPress={() => router.push("/login")}
            color="blue"
          />
        )}
      </View>
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
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold" },
  item: { marginBottom: 20 },
  description: { fontSize: 16, color: "#333" },
});
