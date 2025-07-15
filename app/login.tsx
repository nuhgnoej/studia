import { webClientId } from "@/constants";
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [request, response, promptAsync] = Google.useAuthRequest({
    // webClientId:
    //   webClientId ||
    //   "258669826284-p2osv39bjllnkrko1gd09gil3i9kk4ao.apps.googleusercontent.com",
    webClientId: webClientId,
    iosClientId: "GOOGLE_IOS_CLIENT_ID",
    androidClientId: "GOOGLE_ANDROID_CLIENT_ID",
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
