import { auth } from "@/lib/firebase";
// import * as Google from "expo-auth-session/providers/google";
// import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from "react-native";
// import { webClientId } from "@/constants";
import { LinearGradient } from "expo-linear-gradient";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   clientId: webClientId,
  //   redirectUri: AuthSession.makeRedirectUri(),
  // });

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginButton = () => {
    Alert.alert("개발자 메세지", "구글 로그인 버튼은 구현중 입니다.");
  };

  // useEffect(() => {
  //   if (response?.type === "success") {
  //     setIsLoading(true);
  //     const { idToken } = response.authentication!;
  //     const credential = GoogleAuthProvider.credential(idToken);
  //     signInWithCredential(auth, credential)
  //       .then(() => router.replace("/"))
  //       .catch((e) => {
  //         console.error("Firebase sign-in error", e);
  //         Alert.alert("Google 로그인 실패", e.message);
  //       })
  //       .finally(() => setIsLoading(false));
  //   }
  // }, [response, router]);

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
            />
            <TextInput
              placeholder="Password"
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              editable={!isLoading}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
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
              style={styles.googleButton}
              // onPress={() => promptAsync()}
              disabled={isLoading}
              onPress={handleGoogleLoginButton}
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
