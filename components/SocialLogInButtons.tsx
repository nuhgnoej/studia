// components/SocialLogInButtons.tsx
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { memo, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  webClientId: string;
  iosClientId?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  onSuccess: (idToken: string) => void;
  onError?: (message: string) => void;
};

function SocialLogInButtons({
  webClientId,
  iosClientId,
  disabled,
  containerStyle,
  onSuccess,
  onError,
}: Props) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: webClientId,
      iosClientId: iosClientId,
      offlineAccess: true,
    });
  }, [webClientId, iosClientId]);

  // const handleGoogleLogin = async () => {
  //   if (busy || disabled) return;
  //   try {
  //     setBusy(true);
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     // 아래와 같이 any로 캐스팅하여 타입 에러를 해결합니다.
  //     const idToken = (userInfo as any).idToken;
  //     if (idToken) {
  //       onSuccess(idToken);
  //     } else {
  //       onError?.("Google 인증 토큰을 가져오지 못했습니다.");
  //     }
  //   } catch (error: any) {
  //     console.error("Google Sign-In Error:", error);
  //     if (error.code) {
  //       if (error.code !== "12501") {
  //         onError?.(`Google 로그인 오류 (${error.code})`);
  //       }
  //     } else {
  //       onError?.("Google 로그인 중 오류가 발생했습니다.");
  //     }
  //   } finally {
  //     setBusy(false);
  //   }
  // };
  const handleGoogleLogin = async () => {
    if (busy || disabled) return;
    try {
      setBusy(true);
      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();

      if (isSuccessResponse(res)) {
        // v15: User 객체는 res.data에 위치, idToken은 string | null
        let idToken = res.data.idToken;

        // 필요 시 보강: getTokens()는 { idToken, accessToken } 반환
        if (!idToken) {
          const tokens = await GoogleSignin.getTokens();
          idToken = tokens.idToken;
        }

        if (idToken) {
          onSuccess(idToken);
        } else {
          onError?.("Google 인증 토큰(idToken)을 가져오지 못했습니다.");
        }
      } else {
        // 사용자가 취소한 경우 등
        onError?.("사용자가 로그인을 취소했습니다.");
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      if (isErrorWithCode(err)) {
        if (err.code !== statusCodes.SIGN_IN_CANCELLED) {
          onError?.(`Google 로그인 오류 (${err.code})`);
        }
      } else {
        onError?.("Google 로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setBusy(false);
    }
  };
  const handleKakaoLogin = () => {
    Alert.alert("구현 중 입니다.");
  };

  const handleNaverLogin = () => {
    Alert.alert("구현 중 입니다.");
  };

  return (
    <View style={containerStyle}>
      <View style={styles.separatorRow}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>또는 소셜 로그인</Text>
        <View style={styles.separatorLine} />
      </View>

      <TouchableOpacity
        style={[styles.googleButton, (busy || disabled) && { opacity: 0.6 }]}
        disabled={busy || disabled}
        onPress={handleGoogleLogin}
        activeOpacity={0.7}
      >
        {busy ? (
          <ActivityIndicator color="#444" />
        ) : (
          <>
            <Image
              source={require("@/assets/logos/google.png")}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.googleButton, (busy || disabled) && { opacity: 0.6 }]}
        disabled={busy || disabled}
        onPress={handleKakaoLogin}
        activeOpacity={0.7}
      >
        {busy ? (
          <ActivityIndicator color="#444" />
        ) : (
          <>
            <Image
              source={require("@/assets/logos/kakao.png")}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Sign in with Kakao</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.googleButton, (busy || disabled) && { opacity: 0.6 }]}
        disabled={busy || disabled}
        onPress={handleNaverLogin}
        activeOpacity={0.7}
      >
        {busy ? (
          <ActivityIndicator color="#444" />
        ) : (
          <>
            <Image
              source={require("@/assets/logos/naver.png")}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Sign in with Naver</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default memo(SocialLogInButtons);

const styles = StyleSheet.create({
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 14,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: "#ccc" },
  separatorText: { color: "#666", marginHorizontal: 8, fontSize: 14 },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  googleIcon: { width: 20, height: 20, marginRight: 8 },
  googleButtonText: { fontSize: 15, color: "#444" },
});
