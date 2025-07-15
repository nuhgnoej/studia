import { StyleSheet, Text, View, Button, Alert } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { initDatabase } from "@/lib/db";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

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
      <Text style={styles.title}>설정</Text>

      <View style={styles.item}>
        <Button
          title="로컬 DB 초기화"
          onPress={handleResetDatabase}
          color="crimson"
        />
      </View>

      <View style={styles.item}>
        <Button title="로그아웃" onPress={handleLogout} color="gray" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24 },
  item: { marginBottom: 20 },
});
