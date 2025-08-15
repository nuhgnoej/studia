import { auth, db } from "@/lib/firebase/firebase";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      setProfileImageUri(uri);
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);

    if (!email || !password || !displayName.trim()) {
      Alert.alert("입력 오류", "이메일, 비밀번호, 이름을 모두 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 1. 선택한 이미지를 앱 내부에 저장 (Storage 업로드는 생략)
      if (profileImageUri) {
        const newPath = `${FileSystem.documentDirectory}${user.uid}_profile.jpg`;
        await FileSystem.copyAsync({
          from: profileImageUri,
          to: newPath,
        });
        await AsyncStorage.setItem(`profileImageUri:${user.uid}`, newPath);
      }

      // 2. Firebase Auth 프로필 설정 (photoURL 생략)
      await updateProfile(user, {
        displayName,
      });

      // 3. Firestore에 사용자 정보 저장 (photoURL 생략 또는 null로 명시)
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName,
        bio,
        photoURL: null,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Account created!");
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Signup failed", error.message);
      console.log("Signup failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 10}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>
          <View style={styles.card}>
            <Text style={styles.title}>Sign Up</Text>

            <TouchableOpacity
              style={styles.profileImageWrapper}
              onPress={handlePickImage}
            >
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  style={styles.profileImage}
                />
              ) : (
                <FontAwesome name="user-circle" size={100} color="#bbb" />
              )}
            </TouchableOpacity>

            <TextInput
              placeholder="Email"
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              editable={!isLoading}
            />
            <TextInput
              placeholder="Password"
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              editable={!isLoading}
            />

            <TextInput
              placeholder="Display Name"
              onChangeText={setDisplayName}
              autoCapitalize="none"
              style={styles.input}
              editable={!isLoading}
            />

            <TextInput
              placeholder="Bio"
              onChangeText={setBio}
              autoCapitalize="none"
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#3494e6", "#ec6ead"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fullWidthButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signupButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginLink}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f4f4f4",
    paddingTop: 60,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 10,
    width: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  signupButton: {
    borderRadius: 8,
    marginBottom: 16,
  },
  signupButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginLink: {
    alignItems: "center",
    color: "#007AFF",
    fontWeight: "600",
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  profileImageWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
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
});
