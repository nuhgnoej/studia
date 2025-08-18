// components/auth/LoginContent.tsx

import React, { useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import SocialLogInButtons from "@/components/auth/SocialLogInButtons";
import { iosClientId, webClientId } from "@/constants";
import { LinearGradient } from "expo-linear-gradient";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useNotification } from "@/contexts/NotificationContext";

interface LoginContentProps {
  onLoginSuccess: () => void;
  onNavigateToSignup: () => void;
}

export default function LoginContent({
  onLoginSuccess,
  onNavigateToSignup,
}: LoginContentProps) {
  const { showNotification } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string>("");

  const handleLogin = async () => {
    setIsLoading(true);
    // setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess();
    } catch (e: any) {
      let description = "아이디 또는 비밀번호를 확인해주세요.";
      if (e.code === "auth/invalid-credential") {
        description = "아이디 또는 비밀번호가 올바르지 않습니다.";
      }
      showNotification({
        title: "로그인 실패",
        description,
        status: "error",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      showNotification({
        title: "이메일 필요",
        description: "비밀번호를 재설정할 이메일 주소를 입력해주세요.",
        status: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showNotification({
        title: "이메일 전송 완료",
        description: `${email} 주소로 비밀번호 재설정 링크를 보냈습니다. 받은편지함을 확인해주세요.`,
        status: "success",
      });
    } catch (e: any) {
      let description = "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      if (e.code === "auth/user-not-found") {
        description = "가입되지 않은 이메일 주소입니다.";
      }
      showNotification({
        title: "전송 실패",
        description,
        status: "error",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Login</Text>

            <TextInput
              placeholder="Email"
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              editable={!isLoading}
              value={email}
            />
            <TextInput
              placeholder="Password"
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              editable={!isLoading}
              value={password}
            />

            {/* {error ? (
              <Text style={{ color: "#d00", marginBottom: 12 }}>{error}</Text>
            ) : null} */}

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
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
                  <Text style={[styles.loginButtonText, { color: "#fff" }]}>
                    Login
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={onNavigateToSignup}
              disabled={isLoading}
            >
              <Text style={styles.signupText}>
                Don&apos;t have an account?{" "}
                <Text style={styles.signupLink}>Sign up</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={handlePasswordReset}
              disabled={isLoading}
            >
              <Text style={styles.signupText}>
                Forgot your password?{" "}
                <Text style={styles.signupLink}>Reset your password</Text>
              </Text>
            </TouchableOpacity>

            {/* webClientId가 있을 때만 소셜 로그인 버튼을 보여줍니다. */}
            {webClientId && (
              <SocialLogInButtons
                webClientId={webClientId}
                iosClientId={iosClientId}
                disabled={isLoading}
                onSuccess={async (idToken) => {
                  setIsLoading(true);
                  try {
                    const cred = GoogleAuthProvider.credential(idToken);
                    await signInWithCredential(auth, cred);
                    onLoginSuccess();
                  } catch (e: any) {
                    showNotification({
                      title: "Google 로그인 실패",
                      description:
                        "로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
                      status: "error",
                    });
                    console.error("Firebase sign-in error", e);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                onError={(msg) => {
                  showNotification({
                    title: "소셜 로그인 오류",
                    description: msg,
                    status: "error",
                  });
                }}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f4f4f4",
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginTop: -50,
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
  loginButton: { borderRadius: 8, marginBottom: 12 },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  signupLink: {
    alignItems: "center",
    marginTop: 10,
    color: "#007AFF",
    fontWeight: "600",
  },
  signupText: { fontSize: 14, color: "#666" },
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
