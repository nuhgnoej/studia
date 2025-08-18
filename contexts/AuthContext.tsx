// lib/contexts/AuthContext.tsx

import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  profileImageUri: string | null;
  setProfileImageUri: (uri: string | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  profileImageUri: null,
  setProfileImageUri: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        try {
          const userDocRef = doc(db, "users", authUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const photoURL = userDoc.data().photoURL || null;
            setProfileImageUri(photoURL);
            if (photoURL) {
              await AsyncStorage.setItem(
                `profileImageUri:${authUser.uid}`,
                photoURL
              );
            } else {
              await AsyncStorage.removeItem(`profileImageUri:${authUser.uid}`);
            }
          } else {
            setProfileImageUri(null);
          }
        } catch (error) {
          console.error("프로필 이미지 URI 가져오기 실패:", error);
          const cachedUri = await AsyncStorage.getItem(
            `profileImageUri:${authUser.uid}`
          );
          setProfileImageUri(cachedUri);
        }
      } else {
        if (user) {
          await AsyncStorage.removeItem(`profileImageUri:${user.uid}`);
        }
        setUser(null);
        setProfileImageUri(null);
      }
    });

    return unsubscribe;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        profileImageUri,
        setProfileImageUri: async (uri: string | null) => {
          setProfileImageUri(uri);
          if (user) {
            if (uri) {
              await AsyncStorage.setItem(`profileImageUri:${user.uid}`, uri);
            } else {
              await AsyncStorage.removeItem(`profileImageUri:${user.uid}`);
            }
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
