import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Studia",
  slug: "studia",
  owner: "odineyes2",
  scheme: "studia",
  extra: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  },
};

export default config;

// export default {
//   expo: {
//     slug: "studia",
//     owner: "odineyes2",
//     extra: {
//       webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
//     },
//   },
// };
