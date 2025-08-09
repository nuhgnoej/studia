import "dotenv/config";

export default {
  expo: {
    name: "studia",
    slug: "studia",
    scheme: "studia",
    version: "1.0.0",
    plugins: ["expo-router", "@react-native-google-signin/google-signin"],
    android: {
      package: "com.odineyes2.studia",
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
    },
  },
};
