import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect } from "react";
import { ensureDatabaseInitialized } from "@/lib/db/bootstrap";
import { AuthProvider } from "@/contexts/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QuizModalProvider } from "@/contexts/QuizModalContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    ensureDatabaseInitialized().catch(console.error);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <BottomSheetModalProvider>
            <NotificationProvider>
              <AuthModalProvider>
                <QuizModalProvider>
                <Stack initialRouteName="(tabs)">
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
                </QuizModalProvider>
              </AuthModalProvider>
            </NotificationProvider>
          </BottomSheetModalProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
