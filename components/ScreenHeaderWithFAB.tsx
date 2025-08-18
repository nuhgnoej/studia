import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  ImageSourcePropType,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase/firebase";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { commonStyles } from "../styles/common";

type ScreenHeaderProps = {
  title: string;
  description?: string;
};

// 개별 액션 버튼을 위한 서브 컴포넌트
const ActionButton = ({ action, style }: { action: FabAction; style: any }) => (
  <Animated.View style={[styles.subButtonContainer, style]}>
    <TouchableOpacity style={styles.subButton} onPress={action.onPress}>
      <Image source={action.icon} style={commonStyles.actionIcon} />
    </TouchableOpacity>
    <Text style={styles.subButtonLabel}>{action.text}</Text>
  </Animated.View>
);

type FabAction = {
  text: string;
  icon: ImageSourcePropType;
  name: string;
  onPress: () => void;
};

export default function ScreenHeaderWithFAB({
  title,
  description,
}: ScreenHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, profileImageUri } = useAuth();
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const animation = useSharedValue(0);

  // --- 애니메이션 로직 ---
  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    animation.value = withSpring(toValue, { damping: 12, stiffness: 100 });
    setIsOpen(!isOpen);
  };

  // --- 동적 액션 정의 ---
  const fabActions: FabAction[] = isLoggedIn
    ? [
        {
          text: "프로필",
          icon: require("@/assets/icons/profile.png"),
          name: "profile",
          onPress: () => {
            toggleMenu();
            router.push("/profile");
          },
        },
        {
          text: "로그아웃",
          icon: require("@/assets/icons/logout.png"),
          name: "logout",
          onPress: async () => {
            toggleMenu();
            await signOut(auth);
          },
        },
      ]
    : [
        {
          text: "로그인",
          icon: require("@/assets/icons/login.png"),
          name: "login",
          onPress: () => {
            toggleMenu();
            openAuthModal("login");
          },
        },
      ];

  // --- 애니메이션 스타일 정의 ---
  const firstActionStyle = useAnimatedStyle(() => {
    const translateY = interpolate(animation.value, [0, 1], [0, 70]);
    return {
      transform: [{ scale: animation.value }, { translateY }],
      opacity: animation.value,
    };
  });

  const secondActionStyle = useAnimatedStyle(() => {
    const translateY = interpolate(animation.value, [0, 1], [0, 140]);
    return {
      transform: [{ scale: animation.value }, { translateY }],
      opacity: animation.value,
    };
  });

  const actionStyles = [firstActionStyle, secondActionStyle];

  return (
    <>
      <View style={commonStyles.headerShadowWrapper}>
        <View style={[commonStyles.header, commonStyles.headerRow]}>
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.headerTitle}>{title}</Text>
            {description && (
              <Text style={commonStyles.headerWelcomeText}>{description}</Text>
            )}
          </View>

          <View style={styles.fabContainer}>
            {fabActions.map((action, index) => (
              <ActionButton
                key={action.name}
                action={action}
                style={actionStyles[index]}
              />
            ))}

            <TouchableOpacity
              style={styles.fab}
              onPress={toggleMenu}
              activeOpacity={0.8}
            >
              {isLoggedIn && profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  style={commonStyles.profileImage}
                />
              ) : (
                <MaterialIcons name="person-outline" size={28} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

// --- 새로운 스타일 정의 ---
const styles = StyleSheet.create({
  fabContainer: {
    alignItems: "flex-end",
  },
  fab: {
    backgroundColor: "#007aff",
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 20,
  },
  // fabIconImage: {
  //   width: 56,
  //   height: 56,
  //   borderRadius: 28,
  // },
  subButtonContainer: {
    position: "absolute",
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },
  subButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  subButtonLabel: {
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 12,
    fontSize: 12,
  },
});
