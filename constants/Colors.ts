/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    card: "#FFFFFF",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    card: "#2A2E2F",
  },
  common: {
    primary: {
      bg: "#2563EB",
      fg: "#fff",
      pressedBg: "#1D4ED8", // 딥 블루 눌림
    },
    danger: {
      bg: "#DC2626",
      fg: "#fff",
      pressedBg: "#B91C1C", // 진홍색 눌림
    },
    neutral: {
      bg: "#374151",
      fg: "#fff",
      pressedBg: "#1F2937", // 다크 그레이 눌림
    },
    success: {
      // 'success' 변형 추가
      bg: "#16A34A", // Green 600
      fg: "#FFFFFF",
      pressedBg: "#15803D", // Green 700
    },
  },
} as const;

export type CommonColorVariant = keyof typeof Colors.common;
