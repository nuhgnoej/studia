// lib/contexts/AuthContext.tsx

import { auth } from "@/lib/firebase/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react";

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        const uri = await AsyncStorage.getItem(`profileImageUri:${user.uid}`);
        setProfileImageUri(uri || null);
      } else {
        setProfileImageUri(null);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        profileImageUri,
        setProfileImageUri,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
