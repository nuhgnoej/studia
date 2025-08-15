import SocialLogInButtons from "@/components/SocialLogInButtons";
import { iosClientId, webClientId } from "@/constants";
import { auth } from "@/lib/firebase/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Login failed");
      Alert.alert("Login failed", e?.message ?? "");
    } finally {
      setIsLoading(false);
    }
  };

  if (!webClientId) {
    console.error("Google Web Client ID가 설정되지 않았습니다.");
  }

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

            {error ? (
              <Text style={{ color: "#d00", marginBottom: 12 }}>{error}</Text>
            ) : null}

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
              onPress={() => router.replace("/signup")}
              disabled={isLoading}
            >
              <Text style={styles.signupText}>
                Don&apos;t have an account?{" "}
                <Text style={styles.signupLink}>Sign up</Text>
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
                    router.replace("/");
                  } catch (e: any) {
                    console.error("Firebase sign-in error", e);
                    Alert.alert("Google 로그인 실패", e?.message ?? "");
                    setError(e?.message ?? "Google sign-in failed");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                onError={(msg) => setError(msg)}
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
