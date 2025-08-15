// components/ExpandableFAB.tsx
import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useNotification } from "@/contexts/NotificationContext";

type Props = {
  isLoggedIn: boolean;
  onDirectUpload: (data: any) => Promise<void>;
};

export default function ExpandableFAB({ isLoggedIn, onDirectUpload }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { showNotification } = useNotification();

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
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
  const menuStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
    ],
  };
  const archiveStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -130],
        }),
      },
    ],
  };
  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {isOpen && (
        <Pressable style={StyleSheet.absoluteFill} onPress={toggleMenu} />
      )}

      {isLoggedIn && (
        <Animated.View style={[styles.subButtonContainer, archiveStyle]}>
          <TouchableOpacity
            style={styles.subButton}
            onPress={handleGoToArchive}
          >
            <MaterialIcons name="archive" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.subButtonLabel}>아카이브</Text>
        </Animated.View>
      )}

      <Animated.View style={[styles.subButtonContainer, menuStyle]}>
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
        <Animated.View style={rotation}>
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
