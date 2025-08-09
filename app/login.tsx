// import { androidClientId, iosClientId, webClientId } from "@/constants";
import { auth } from "@/lib/firebase/firebase";
// import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   androidClientId:
  //     "258669826284-l8olrogicv0cijfoqsdenj68htn9cpv5.apps.googleusercontent.com",
  //   responseType: "id_token",
  // });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId:
      "258669826284-l8olrogicv0cijfoqsdenj68htn9cpv5.apps.googleusercontent.com",
    scopes: ["openid", "email", "profile"],
  });

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

  const handleGoogleLogin = () => {
    if (!request || isLoading) return;

    promptAsync();
  };

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = response.authentication?.idToken;
    if (!idToken) return;

    (async () => {
      setIsLoading(true);
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        router.replace("/");
      } catch (e: any) {
        console.error("Firebase sign-in error", e);
        Alert.alert("Google 로그인 실패", e?.message ?? "");
        setError(e?.message ?? "Google sign-in failed");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [response, router]);

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

            <Text
              style={{ color: "#666", marginBottom: 8, textAlign: "center" }}
            >
              또는 소셜 로그인
            </Text>

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
              style={[
                styles.googleButton,
                (!request || isLoading) && { opacity: 0.6 },
              ]}
              disabled={!request || isLoading}
              onPress={handleGoogleLogin}
            >
              {isLoading ? (
                <ActivityIndicator color="#444" />
              ) : (
                <>
                  <Image
                    source={require("@/assets/logos/google.png")}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>
                    Sign in with Google
                  </Text>
                </>
              )}
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
    marginTop: -150,
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
  loginButton: {
    borderRadius: 8,
    marginBottom: 12,
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 15,
    color: "#444",
  },
  signupLink: {
    alignItems: "center",
    marginTop: 10,
    color: "#007AFF",
    fontWeight: "600",
  },
  signupText: {
    fontSize: 14,
    color: "#666",
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
