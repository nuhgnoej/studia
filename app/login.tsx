import { auth } from "@/lib/firebase";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { androidClientId, iosClientId, webClientId } from "@/constants";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId,
    iosClientId: iosClientId,
    androidClientId: androidClientId,
  });

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      const { idToken } = response.authentication!;
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential)
        .then(() => router.replace("/(tabs)/home"))
        .catch((e) => console.error("Firebase sign-in error", e));
    }
  }, [response, router]);

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Log In" onPress={handleLogin} />
      <Button
        title="Sign in with Google"
        onPress={() => promptAsync()}
        disabled={!request}
      />
      <Button title="Go to Signup" onPress={() => router.push("/signup")} />
    </View>
  );
}
