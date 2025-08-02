// app/settings.tsx

import ScreenHeaderWithFAB from "@/components/ScreenHeaderWithFAB";
import { initDatabase } from "@/lib/db";
import { auth } from "@/lib/firebase/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { commonStyles } from "../../styles/common";

export default function SettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const clearAsyncStorage = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.clear();
      Alert.alert("성공", "AsyncStorage가 초기화되었습니다.");
    } catch (error: any) {
      Alert.alert("오류", "초기화에 실패했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProfileImage = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return Alert.alert("오류", "로그인 정보가 없습니다.");
    const filePath = `${FileSystem.documentDirectory}${uid}_profile.jpg`;

    try {
      setIsLoading(true);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
      }
      await AsyncStorage.removeItem("profileImageUri");
      Alert.alert("성공", "프로필 이미지가 삭제되었습니다.");
    } catch (error: any) {
      Alert.alert("오류", "이미지 삭제에 실패했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllProfileImage = async () => {
    try {
      setIsLoading(true);
      const dir = FileSystem.documentDirectory;
      if (!dir) return;

      const files = await FileSystem.readDirectoryAsync(dir);
      const profileImages = files.filter((f) => f.endsWith("_profile.jpg"));

      for (const fileName of profileImages) {
        const filePath = `${dir}${fileName}`;
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }

      Alert.alert(`✅ ${profileImages.length}개의 프로필 이미지 삭제 완료`);
      console.log(`✅ ${profileImages.length}개의 프로필 이미지 삭제 완료`);
    } catch (err) {
      console.error("❌ deleteAllProfileImage 실패:", err);
    } finally {
      setIsLoading(false);
    }
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

  const renderButton = (label: string, onPress: () => void, color?: string) => (
    <TouchableOpacity
      style={[styles.modernButton, color ? { backgroundColor: color } : {}]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.modernButtonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#C9D6FF", "#E2E2E2"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={commonStyles.container}>
        {/* 공통 헤더 컴포넌트 */}
        <ScreenHeaderWithFAB
          title="설정"
          description={"앱 사용 환경을 원하는 대로 설정하세요."}
        />

        {/* 일반 설정 */}
        <View style={styles.bodyContainer}>
          <View style={styles.section}>
            {renderButton("각 과목 별 초기화 (문제세트, 진행률)", () =>
              router.push("/subjectSettings")
            )}

            {isLoggedIn
              ? renderButton("로그아웃", handleLogout, "#8E8E93")
              : renderButton("로그인 화면으로", () => router.push("/login"))}
          </View>

          {/* 개발자용 설정 */}
          <View style={styles.section}>
            <Text style={styles.devHeader}>🛠️ 개발자 전용</Text>
            {renderButton("로컬 DB 초기화", handleResetDatabase, "#FF3B30")}
            {renderButton("AsyncStorage 초기화", clearAsyncStorage, "#FF3B30")}
            {renderButton("프로필 이미지 삭제", deleteProfileImage, "#FF3B30")}
            {renderButton(
              "모든 프로필 이미지 삭제",
              deleteAllProfileImage,
              "#FF3B30"
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bodyContainer: {
    flex: 1,
    margin: 10,
    padding: 10,
  },
  section: {
    marginBottom: 40,
    gap: 12,
  },
  devHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#555",
  },
  modernButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modernButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
