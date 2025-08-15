import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase/firebase";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../styles/common";
import { useAuthModal } from "@/contexts/AuthModalContext";

type ScreenHeaderProps = {
  title: string;
  description?: string;
};

export default function ScreenHeaderWithFAB({
  title,
  description,
}: ScreenHeaderProps) {
  const [fabOpen, setFabOpen] = useState(false);
  const { isLoggedIn, profileImageUri } = useAuth();
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  const fabActions = isLoggedIn
    ? [
        {
          text: "프로필",
          icon: require("@/assets/icons/profile.png"),
          name: "profile",
          color: "#f9f9f9",
          onPress: () => {
            router.push("/profile");
          },
        },
        {
          text: "로그아웃",
          icon: require("@/assets/icons/logout.png"),
          name: "logout",
          color: "#f9f9f9",
          onPress: async () => {
            await signOut(auth);
            openAuthModal("login");
          },
        },
      ]
    : [
        {
          text: "로그인",
          icon: require("@/assets/icons/login.png"),
          name: "login",
          color: "#f9f9f9",
          onPress: async () => {
            openAuthModal("login");
          },
        },
      ];

  const fabIcon =
    isLoggedIn && profileImageUri ? (
      <Image
        source={{ uri: profileImageUri }}
        style={commonStyles.profileImage}
      />
    ) : (
      <FontAwesome name="user-circle" size={48} color="#ccc" />
    );

  return (
    <View style={commonStyles.headerShadowWrapper}>
      <View style={[commonStyles.header, commonStyles.headerRow]}>
        <View style={{ flex: 1 }}>
          <Text style={commonStyles.headerTitle}>{title}</Text>
          {description && (
            <Text style={commonStyles.headerWelcomeText}>{description}</Text>
          )}
        </View>
      </View>

      {fabIcon && (
        <View style={commonStyles.fabWrapper}>
          <TouchableOpacity
            style={commonStyles.fabButton}
            onPress={() => setFabOpen((prev) => !prev)}
            activeOpacity={0.7}
          >
            {fabIcon}
          </TouchableOpacity>

          {fabOpen && (
            <View style={commonStyles.actionList}>
              {fabActions.map((action, index) => (
                <View key={action.name}>
                  <TouchableOpacity
                    style={[
                      commonStyles.actionItem,
                      { backgroundColor: action.color },
                    ]}
                    onPress={action.onPress}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={action.icon}
                      style={commonStyles.actionIcon}
                    />
                    <Text style={commonStyles.actionText}>{action.text}</Text>
                  </TouchableOpacity>

                  {index !== fabActions.length - 1 && (
                    <View style={commonStyles.separator} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
