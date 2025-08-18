// components/ExpandableFAB.tsx
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Text,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useNotification } from "@/contexts/NotificationContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  isLoggedIn: boolean;
  onDirectUpload: (data: any) => Promise<void>;
};

export default function ExpandableFAB({ isLoggedIn, onDirectUpload }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useSharedValue(0);
  const router = useRouter();
  const { showNotification } = useNotification();

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    animation.value = withSpring(toValue, { damping: 12, stiffness: 100 });
    setIsOpen(!isOpen);
  };

  const handleDirectUpload = async () => {
    toggleMenu();
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });
      if (res.canceled || !res.assets?.[0]) return;

      const uri = res.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(uri);
      await onDirectUpload(JSON.parse(content));
    } catch (err) {
      showNotification({
        title: "업로드 실패",
        description: `파일을 처리하는 중 오류가 발생했습니다.: ${err}`,
        status: "error",
      });
    }
  };

  const handleGoToArchive = () => {
    toggleMenu();
    router.push("/archive");
  };

  // --- 애니메이션 스타일 ---
  const animatedRotation = useAnimatedStyle(() => {
    const rotate = interpolate(animation.value, [0, 1], [0, 45]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  const animatedMenuStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: animation.value },
        { translateY: interpolate(animation.value, [0, 1], [0, -70]) },
      ],
      opacity: animation.value, // 부드러운 등장을 위해 opacity 추가
    };
  });

  const animatedArchiveStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: animation.value },
        { translateY: interpolate(animation.value, [0, 1], [0, -130]) },
      ],
      opacity: animation.value,
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: animation.value,
      // 메뉴가 닫혔을 때 터치되지 않도록 pointerEvents 설정
      pointerEvents: animation.value === 1 ? "auto" : "none",
    };
  });

  return (
    <View style={styles.container}>
      <AnimatedPressable
        style={[StyleSheet.absoluteFill, animatedBackdropStyle]}
        onPress={toggleMenu}
      />

      {isLoggedIn && (
        <Animated.View
          style={[styles.subButtonContainer, animatedArchiveStyle]}
        >
          <TouchableOpacity
            style={styles.subButton}
            onPress={handleGoToArchive}
          >
            <MaterialIcons name="archive" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.subButtonLabel}>아카이브</Text>
        </Animated.View>
      )}

      {isOpen && (
        <Pressable style={StyleSheet.absoluteFill} onPress={toggleMenu} />
      )}

      <Animated.View style={[styles.subButtonContainer, animatedMenuStyle]}>
        <TouchableOpacity style={styles.subButton} onPress={handleDirectUpload}>
          <MaterialIcons name="upload-file" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.subButtonLabel}>직접 업로드</Text>
      </Animated.View>

      <TouchableOpacity
        style={styles.fab}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        {/* 7. Animated.View에 새로운 animated 스타일들을 적용합니다. */}
        <Animated.View style={animatedRotation}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 32,
    right: 32,
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
  },
  subButtonContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
  },
  subButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007aff",
    justifyContent: "center",
    alignItems: "center",
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
