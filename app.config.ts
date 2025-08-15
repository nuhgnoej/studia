import "dotenv/config";

export default {
  expo: {
    name: "studia",
    slug: "studia",
    scheme: "studia",
    version: "1.0.0",
    icon: "./assets/images/icon.png",
    splash: {
      image: "./assets/images/splash-image.png",
      resizeMode: "contain",
      backgroundColor: "#FFFFFF",
    },
    plugins: ["expo-router", "@react-native-google-signin/google-signin"],
    android: {
      package: "com.odineyes2.studia",
      adaptiveIcon: {
        foregroundImage: "./assets/images/splash-image.png",
        backgroundColor: "#FFFFFF",
      },
    },
    intentFilters: [
      {
        action: "VIEW",
        category: ["BROWSABLE", "DEFAULT"],
        data: [{ scheme: "studia" }],
      },
    ],
    extra: {
      eas: {
        projectId: "e30c9634-c40d-4003-94eb-e73eeb5245c3",
      },
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    },
  },
};
