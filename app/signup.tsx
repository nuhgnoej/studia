import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { auth, db } from "@/lib/firebase";
import { androidClientId, iosClientId, webClientId } from "@/constants";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId,
    iosClientId: iosClientId,
    androidClientId: androidClientId,
  });

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Account created!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Signup failed", error.message);
    }
  };

  useEffect(() => {
    const signInWithGoogle = async () => {
      if (response?.type === "success") {
        const { idToken } = response.authentication!;
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        // Firestore에 이미 있는지 확인
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            createdAt: serverTimestamp(),
          });
        }

        Alert.alert("Success", "Signed up with Google!");
        router.replace("/(tabs)/home");
      }
    };
    signInWithGoogle();
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
      <Button title="Sign Up" onPress={handleSignup} />
      <Button title="Go to Login" onPress={() => router.push("/login")} />
    </View>
  );
}
