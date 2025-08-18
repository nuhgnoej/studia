// app/(tabs)/profile.tsx

import ScreenHeaderWithFAB from "@/components/ScreenHeaderWithFAB";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/firebase";
import { formatDate } from "@/lib/format";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { commonStyles } from "../../styles/common";
import { SectionCard, ActionButton } from "@/components/ui/ActionComponents";
import { ValueRow, EditableRow } from "@/components/ui/SettingsRows";
import { useNotification } from "@/contexts/NotificationContext";
import LoginPrompt from "@/components/auth/LoginPrompt";

export default function ProfileScreen() {
  const { user, profileImageUri, setProfileImageUri } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState<string | null>(null);
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
      showNotification({
        title: "성공",
        description: "프로필이 저장되었습니다.",
        status: "success",
      });
    } catch (e) {
      showNotification({
        title: "오류",
        description: "저장에 실패했습니다.",
        status: "error",
      });
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showNotification({
        title: "알림",
        description: "앨범에 접근하려면 권한이 필요합니다.",
        status: "info",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && user?.uid) {
      const uri = result.assets[0].uri;
      const storage = getStorage();
      const storageRef = ref(storage, `profileImages/${user.uid}_profile.jpg`);

      try {
        showNotification({
          title: "알림",
          description: "이미지를 업로드하고 있습니다...",
          status: "info",
        });
        const response = await fetch(uri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        const imageURL = await getDownloadURL(storageRef);
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { photoURL: imageURL });
        await updateProfile(user, { photoURL: imageURL });
        await AsyncStorage.setItem(`profileImageUri:${user.uid}`, imageURL);
        setProfileImageUri(imageURL);
        await user.reload();
        showNotification({
          title: "성공",
          description: "프로필 이미지가 변경되었습니다.",
          status: "success",
        });
      } catch (error) {
        console.error("이미지 업로드 실패", error);
        showNotification({
          title: "오류",
          description: "이미지 업로드에 실패했습니다.",
          status: "error",
        });
      }
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
        <ScreenHeaderWithFAB
          title="프로필"
          description={"로그인 후 프로필을 확인할 수 있습니다."}
        />
        <LoginPrompt />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScreenHeaderWithFAB
        title="프로필"
        description="계정 정보와 프로필 사진을 변경할 수 있어요."
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- 프로필 요약 카드 --- */}
        <SectionCard title={user.displayName || "No Name"}>
          <View style={styles.profileSummaryContainer}>
            <TouchableOpacity
              onPress={handlePickImage}
              style={styles.profileImageWrapper}
            >
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  style={styles.profileImage}
                />
              ) : (
                <FontAwesome name="user-circle" size={64} color="#bbb" />
              )}
              <View style={styles.cameraIconOverlay}>
                <FontAwesome name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <EditableRow
                icon="badge"
                label="이름"
                value={displayNameInput}
                onChangeText={setDisplayNameInput}
                placeholder="이름을 입력하세요"
              />
              <ValueRow icon="email" label="이메일" value={user.email || ""} />
            </View>
          </View>
        </SectionCard>

        {/* --- 자기소개 카드 --- */}
        <SectionCard title="자기소개">
          <EditableRow
            icon="notes"
            label="소개글"
            value={bioInput}
            onChangeText={setBioInput}
            placeholder="자기소개를 입력하세요."
            multiline
          />
        </SectionCard>

        {/* --- 계정 정보 카드 --- */}
        <SectionCard title="계정 정보">
          <ValueRow icon="vpn-key" label="UID" value={user.uid} />
          <ValueRow
            icon="event"
            label="가입일"
            value={formatDate(user.metadata.creationTime)}
          />
          <ValueRow
            icon="login"
            label="최근 로그인"
            value={formatDate(user.metadata.lastSignInTime)}
          />
        </SectionCard>

        {/* --- 액션 버튼 --- */}
        <View style={styles.buttonContainer}>
          <ActionButton
            icon="save"
            label="프로필 저장"
            onPress={handleSaveProfile}
            variant="primary"
            loading={saving}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// --- 새로운 스타일 정의 ---
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 16,
  },
  profileSummaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cameraIconOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 12,
  },
  buttonContainer: {
    marginTop: 8,
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
});
