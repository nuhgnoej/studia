// app/(tabs)/profile.tsx

import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { commonStyles } from "../../styles/common";
import { formatDate } from "@/lib/format";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import ScreenHeaderWithFAB from "@/components/ScreenHeaderWithFAB";

export default function ProfileScreen() {
  const { user, profileImageUri, setProfileImageUri } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(
    user?.displayName ?? ""
  );
  const [bioInput, setBioInput] = useState(bio ?? "");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);

    try {
      await updateProfile(user, { displayName: displayNameInput });
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, { displayName: displayNameInput, bio: bioInput });
      await user.reload();
      setBio(bioInput);

      Alert.alert("성공", "프로필이 저장되었습니다.");
      setEditMode(false);
    } catch (e) {
      Alert.alert("오류", "저장 실패");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      aspect: [1, 1],
      allowsEditing: true,
    });

    if (!result.canceled && user?.uid) {
      const uri = result.assets[0].uri;
      const newPath = `${FileSystem.documentDirectory}${user.uid}_profile.jpg`;
      await FileSystem.copyAsync({ from: uri, to: newPath });
      await AsyncStorage.setItem(`profileImageUri:${user.uid}`, newPath);
      setProfileImageUri(newPath);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setBio(null);
        setLoading(false);
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setBio(data.bio ?? null);
        setDisplayNameInput(data.displayName ?? user?.displayName ?? "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={commonStyles.container}>
        {/* 공통 헤더 컴포넌트 */}
        <ScreenHeaderWithFAB
          title="프로필"
          description={"로그인 후 프로필을 확인할 수 있습니다."}
        />
        <TouchableOpacity
          onPress={() => router.push("/login")}
          activeOpacity={0.7}
          style={styles.iosLoginButton}
        >
          <Text style={styles.iosLoginButtonText}>로그인하러 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#C9D6FF", "#E2E2E2"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={commonStyles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* 공통 헤더 컴포넌트 */}
            <ScreenHeaderWithFAB
              title="프로필"
              description={"계정 정보와 프로필 사진을 변경할 수 있어요."}
            />

            <View style={styles.bodyContainer}>
              {/* 프로필 헤더 */}
              <View style={styles.profileHeader}>
                <TouchableOpacity
                  style={styles.profileImageWrapper}
                  onPress={handlePickImage}
                >
                  <View style={styles.profileImageOuter}>
                    {profileImageUri ? (
                      <Image
                        source={{ uri: profileImageUri }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <FontAwesome name="user" size={60} color="#aaa" />
                    )}
                    <View style={styles.cameraIconOverlay}>
                      <FontAwesome name="camera" size={18} color="#fff" />
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.profileInfoBox}>
                  {editMode ? (
                    <TextInput
                      value={displayNameInput}
                      onChangeText={setDisplayNameInput}
                      style={styles.input}
                    />
                  ) : (
                    <Text style={styles.profileTitle}>
                      {user?.displayName || "No Name"}
                    </Text>
                  )}
                  <Text style={styles.profileDescription}>{user?.email}</Text>
                </View>
              </View>

              <View style={styles.profileDetailBox}>
                <Text style={styles.profileDetailLabel}>UID:</Text>
                <Text style={styles.profileDetailValue}>{user?.uid}</Text>

                <Text style={styles.profileDetailLabel}>가입일:</Text>
                <Text style={styles.profileDetailValue}>
                  {formatDate(user?.metadata?.creationTime)}
                </Text>

                <Text style={styles.profileDetailLabel}>최근 로그인:</Text>
                <Text style={styles.profileDetailValue}>
                  {formatDate(user?.metadata?.lastSignInTime)}
                </Text>

                <Text style={styles.profileDetailLabel}>자기소개:</Text>

                {editMode ? (
                  <TextInput
                    multiline
                    value={bioInput}
                    onChangeText={setBioInput}
                    style={[styles.input, { height: 80 }]}
                  />
                ) : (
                  <Text style={styles.profileDetailValue}>
                    {bio || "자기소개가 없습니다."}
                  </Text>
                )}
              </View>

              {/* 버튼 영역 */}
              <View style={styles.buttonContainer}>
                {/* 수정버튼 */}
                {!editMode ? (
                  <TouchableOpacity
                    onPress={() => {
                      setDisplayNameInput(user?.displayName ?? "");
                      setBioInput(bio ?? "");
                      setEditMode(true);
                    }}
                    style={{ width: "100%" }}
                  >
                    <LinearGradient
                      colors={["#3494e6", "#ec6ead"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.fullWidthButton}
                    >
                      <Text style={[styles.buttonText, { color: "#fff" }]}>
                        수정
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.rowButtonGroup}>
                    {/* 저장 버튼 */}
                    <TouchableOpacity
                      onPress={handleSaveProfile}
                      disabled={saving}
                      style={{ flex: 1 }}
                    >
                      <LinearGradient
                        colors={["#2193b0", "#6dd5ed"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.halfButton,
                          {
                            opacity: saving ? 0.6 : 1,
                          },
                        ]}
                      >
                        {saving ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={[styles.buttonText, { color: "#fff" }]}>
                            저장
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* 취소 버튼 */}
                    <TouchableOpacity
                      onPress={() => {
                        setEditMode(false);
                        setDisplayNameInput(user?.displayName ?? "");
                        setBioInput(bio ?? "");
                      }}
                      style={{ flex: 1 }}
                    >
                      <LinearGradient
                        colors={["#0f0c29", "#302b63"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.halfButton}
                      >
                        <Text style={[styles.buttonText, { color: "#fff" }]}>
                          취소
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bodyContainer: {
    flex: 1,
    margin: 10,
    padding: 10,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
  },
  profileDescription: {
    fontSize: 16,
    color: "#333",
    marginTop: 4,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
  },
  profileDetailBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileDetailLabel: {
    fontWeight: "600",
    marginTop: 8,
    color: "#555",
  },
  profileDetailValue: {
    marginTop: 2,
    marginBottom: 8,
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  fullWidthButton: {
    width: "100%",
    backgroundColor: "#aaa",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  rowButtonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 12,
  },
  iosLoginButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  iosLoginButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  profileImageOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3, // 기존보다 더 두껍게
    borderColor: "#3494e6", // 강조되는 브랜드 컬러 등
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    position: "relative",
    // 그림자 효과
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  cameraIconOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#666",
    borderRadius: 12,
    padding: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfoBox: {
    flex: 1,
    justifyContent: "center",
  },
});
