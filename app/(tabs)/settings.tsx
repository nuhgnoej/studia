// app/settings.tsx

import ScreenHeaderWithFAB from "@/components/ScreenHeaderWithFAB";
import { initDatabase } from "@/lib/db";
import { auth } from "@/lib/firebase/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors, CommonColorVariant } from "../../constants/Colors";
import { commonStyles } from "../../styles/common";

/* ---------------- Types & Constants ---------------- */

type LoadingKey = null | "db" | "logout" | "async";
type ThemeMode = "system" | "light" | "dark";
const THEME_MODE_KEY = "settings.themeMode";
const THEME_DARK_TOGGLE_KEY = "settings.darkToggle";

/* ---------------- Main Screen ---------------- */

export default function SettingsScreen() {
  const router = useRouter();

  // auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // loading per action
  const [loading, setLoading] = useState<LoadingKey>(null);

  // theme
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [darkQuickToggle, setDarkQuickToggle] = useState(false);
  const [radioOpen, setRadioOpen] = useState(false);

  // confirm bottom sheet
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setIsLoggedIn(!!user));
    return unsub;
  }, []);

  // Load saved settings
  useEffect(() => {
    (async () => {
      const savedMode = (await AsyncStorage.getItem(
        THEME_MODE_KEY
      )) as ThemeMode | null;
      const savedToggle = await AsyncStorage.getItem(THEME_DARK_TOGGLE_KEY);
      if (savedMode) setThemeMode(savedMode);
      if (savedToggle != null) setDarkQuickToggle(savedToggle === "1");
    })();
  }, []);

  // Persist settings
  useEffect(() => {
    AsyncStorage.setItem(THEME_MODE_KEY, themeMode).catch(() => {});
  }, [themeMode]);

  useEffect(() => {
    AsyncStorage.setItem(
      THEME_DARK_TOGGLE_KEY,
      darkQuickToggle ? "1" : "0"
    ).catch(() => {});
  }, [darkQuickToggle]);

  const handleLogout = async () => {
    try {
      setLoading("logout");
      await signOut(auth);
      router.push("/login");
    } finally {
      setLoading(null);
    }
  };

  const clearAsyncStorage = async () => {
    try {
      setLoading("async");
      await AsyncStorage.clear();
      Alert.alert("성공", "AsyncStorage가 초기화되었습니다.");
    } catch (error) {
      Alert.alert("오류", "초기화에 실패했습니다.");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  // Bottom Sheet로 확인 받기
  const requestResetDatabase = () => setConfirmOpen(true);

  const actuallyResetDatabase = async () => {
    try {
      setLoading("db");
      await initDatabase();
      Alert.alert("완료", "로컬 데이터베이스가 초기화되었습니다.");
    } finally {
      setLoading(null);
    }
  };

  const AccountButton = useMemo(
    () =>
      isLoggedIn ? (
        <ActionButton
          icon="logout"
          label="로그아웃"
          onPress={handleLogout}
          variant="neutral"
          loading={loading === "logout"}
        />
      ) : (
        <ActionButton
          icon="login"
          label="로그인 화면으로"
          onPress={() => router.push("/login")}
          variant="neutral"
        />
      ),
    [isLoggedIn, loading]
  );

  return (
    <LinearGradient
      colors={["#F5F7FA", "#E4EBF5"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={commonStyles.container}>
        <ScreenHeaderWithFAB
          title="설정"
          description="앱 사용 환경을 원하는 대로 설정하세요."
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 디스플레이 / 테마 */}
          <SectionCard title="디스플레이">
            <SwitchRow
              icon="dark-mode"
              label="다크 모드 (빠른 전환)"
              value={darkQuickToggle}
              onValueChange={setDarkQuickToggle}
              helper="즉시 다크 테마로 전환합니다. 테마 모드(시스템/라이트/다크)와 별개로 동작합니다."
            />
            <ListRow
              icon="palette"
              label="테마 모드"
              valueText={
                themeMode === "system"
                  ? "시스템 기본"
                  : themeMode === "light"
                  ? "라이트"
                  : "다크"
              }
              onPress={() => setRadioOpen(true)}
            />
          </SectionCard>

          {/* 일반 설정 */}
          <SectionCard title="일반">
            <ActionButton
              icon="tune"
              label="각 과목 별 초기화 (문제세트, 진행률)"
              onPress={() => router.push("/subjectSettings")}
              variant="primary"
            />
            <ActionButton
              icon="delete-forever"
              label="로컬 DB 초기화 (문제 세트, 진행률)"
              onPress={requestResetDatabase}
              variant="danger"
              loading={loading === "db"}
            />
            <Caption>
              초기화 시 기기에 저장된 문제 세트와 진행률이 모두 삭제됩니다.
              되돌릴 수 없습니다.
            </Caption>
            {AccountButton}
          </SectionCard>

          {/* 개발자용 설정 */}
          <SectionCard title="개발자 전용" badge="DEV">
            <ActionButton
              icon="cleaning-services"
              label="AsyncStorage 초기화"
              onPress={clearAsyncStorage}
              variant="danger"
              loading={loading === "async"}
            />
            <Caption>
              디버깅용. 사용자 데이터에 영향이 있을 수 있습니다.
            </Caption>
          </SectionCard>
        </ScrollView>
      </View>

      {/* Radio Sheet: 테마 모드 선택 */}
      <RadioSheet
        title="테마 모드"
        visible={radioOpen}
        options={[
          {
            key: "system",
            label: "시스템 기본",
            description: "OS 설정을 따릅니다.",
          },
          {
            key: "light",
            label: "라이트",
            description: "밝은 테마를 사용합니다.",
          },
          {
            key: "dark",
            label: "다크",
            description: "어두운 테마를 사용합니다.",
          },
        ]}
        selectedKey={themeMode}
        onSelect={(k) => setThemeMode(k as ThemeMode)}
        onClose={() => setRadioOpen(false)}
      />

      {/* Confirm Bottom Sheet: 로컬 DB 초기화 */}
      <ConfirmSheet
        visible={confirmOpen}
        title="⚠ 로컬 데이터베이스 초기화"
        description={
          "기기에 저장된 모든 문제 세트와 진행률이 삭제됩니다.\n" +
          "이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?"
        }
        confirmText="초기화"
        confirmVariant="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          await actuallyResetDatabase();
        }}
      />
    </LinearGradient>
  );
}

/* ---------------- Reusable UI ---------------- */

function SectionCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <Text style={styles.caption}>{children}</Text>;
}

function ActionButton({
  icon,
  label,
  onPress,
  variant = "primary",
  loading,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  onPress: () => void;
  variant?: CommonColorVariant;
  loading?: boolean;
}) {
  const palette = Colors.common[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? palette.pressedBg : palette.bg },
      ]}
      disabled={!!loading}
      android_ripple={{ color: "rgba(255,255,255,0.12)" }}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          <MaterialIcons name={icon} size={20} color={palette.fg} />
          <Text style={[styles.buttonText, { color: palette.fg }]}>
            {label}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={palette.fg} />
        </>
      )}
    </Pressable>
  );
}

/* ---- Rows ---- */

function SwitchRow({
  icon,
  label,
  value,
  onValueChange,
  helper,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  helper?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <MaterialIcons name={icon} size={18} color="#111827" />
        </View>
        <View style={{ gap: 2 }}>
          <Text style={styles.rowLabel}>{label}</Text>
          {helper ? <Text style={styles.rowHelper}>{helper}</Text> : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
        thumbColor={value ? Colors.common.primary.bg : "#fff"}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

function ListRow({
  icon,
  label,
  valueText,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  valueText?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <MaterialIcons name={icon} size={18} color="#111827" />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {valueText ? <Text style={styles.valueText}>{valueText}</Text> : null}
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

/* ---- Radio Sheet ---- */

function RadioSheet({
  title,
  visible,
  options,
  selectedKey,
  onSelect,
  onClose,
}: {
  title: string;
  visible: boolean;
  options: { key: string; label: string; description?: string }[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ gap: 12 }}>
        <Text style={styles.sheetTitle}>{title}</Text>
        {options.map((opt) => {
          const selected = opt.key === selectedKey;
          return (
            <Pressable
              key={opt.key}
              style={({ pressed }) => [
                styles.radioRow,
                pressed && styles.rowPressed,
              ]}
              onPress={() => {
                onSelect(opt.key);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.radioLabel}>{opt.label}</Text>
                {opt.description ? (
                  <Text style={styles.radioDesc}>{opt.description}</Text>
                ) : null}
              </View>
              <MaterialIcons
                name={
                  selected ? "radio-button-checked" : "radio-button-unchecked"
                }
                size={22}
                color={selected ? Colors.common.primary.bg : "#9CA3AF"}
              />
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

/* ---- Confirm Sheet ---- */

function ConfirmSheet({
  visible,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: CommonColorVariant;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const palette = Colors.common[confirmVariant];

  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <View style={{ gap: 12 }}>
        <Text style={styles.sheetTitle}>{title}</Text>
        {description ? (
          <Text style={styles.sheetDesc}>{description}</Text>
        ) : null}

        <Pressable
          onPress={onConfirm}
          style={({ pressed }) => [
            styles.sheetButton,
            { backgroundColor: pressed ? palette.pressedBg : palette.bg },
          ]}
        >
          <Text style={[styles.sheetButtonText, { color: palette.fg }]}>
            {confirmText}
          </Text>
        </Pressable>

        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.sheetButton,
            { backgroundColor: pressed ? "#E5E7EB" : "#F3F4F6" },
          ]}
        >
          <Text style={[styles.sheetButtonText, { color: "#111827" }]}>
            {cancelText}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

/* ---- BottomSheet primitive (no external libs) ---- */

function BottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const close = () => {
    Animated.timing(translateY, {
      toValue: 300,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <Pressable style={styles.sheetBackdrop} onPress={close} />
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.sheetHandle} />
        <View style={styles.sheetContent}>{children}</View>
        <SafeAreaSpacer />
      </Animated.View>
    </Modal>
  );
}

function SafeAreaSpacer() {
  return <View style={{ height: Platform.OS === "ios" ? 12 : 8 }} />;
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 16,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.04)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#111827",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  button: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },

  caption: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    marginTop: -2,
  },

  /* rows */
  row: {
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F8FAFB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowPressed: {
    opacity: 0.9,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  rowHelper: {
    fontSize: 12,
    color: "#6B7280",
  },
  valueText: {
    fontSize: 13,
    color: "#6B7280",
  },

  /* bottom sheet */
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
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sheetDesc: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  sheetButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  /* radio */
  radioRow: {
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  radioDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
