// components/ui/BottomSheet.tsx

import React, { useEffect } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export function BottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const translateY = useSharedValue(300);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 300, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      {/* 6. reanimated의 Animated.View에 새로운 animatedStyle을 적용합니다. */}
      <Animated.View style={[styles.sheetContainer, animatedStyle]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetContent}>{children}</View>
        <SafeAreaSpacer />
      </Animated.View>
    </Modal>
  );
}

export function SafeAreaSpacer() {
  return <View style={{ height: Platform.OS === "ios" ? 12 : 8 }} />;
}

const styles = StyleSheet.create({
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.05)",
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
});
