// app/(tabs)/archive.tsx

import { commonStyles } from "../../styles/common";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import OfficialArchive from "../archive/OfficialArchive";
import CommunityArchive from "../archive/CommunityArchive";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ScreenHeaderWithFAB from "@/components/ScreenHeaderWithFAB";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";


const Tab = createMaterialTopTabNavigator();

export default function ArchiveScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const description = user
    ? "원하는 문제를 다운받으세요."
    : "로그인 후 아카이브를 확인할 수 있습니다.";
  if (!user)
    return (
      <View style={commonStyles.container}>
        {/* 공통 헤더 컴포넌트 */}
        <ScreenHeaderWithFAB title="문제 아카이브" description={description} />
        <TouchableOpacity
          onPress={() => router.push("/login")}
          activeOpacity={0.7}
          style={styles.iosLoginButton}
        >
          <Text style={styles.iosLoginButtonText}>로그인하러 가기</Text>
        </TouchableOpacity>
      </View>
    );
  return (
  
      <View style={commonStyles.container}>
        {/* 공통 헤더 컴포넌트 */}
        <ScreenHeaderWithFAB
          title="문제 아카이브"
          description={"원하는 문제를 다운받으세요."}
        />

        {/* 내부 탭 */}
        <Tab.Navigator
          screenOptions={{
            tabBarLabelStyle: { fontWeight: "bold" },
            tabBarIndicatorStyle: { backgroundColor: "#333" },
            tabBarStyle: {
              shadowOpacity: 0,
              elevation: 0,
            },
          }}
        >
          <Tab.Screen name="공식 아카이브" component={OfficialArchive} />
          <Tab.Screen name="커뮤니티 아카이브" component={CommunityArchive} />
        </Tab.Navigator>
      </View>
  
  );
}

const styles = StyleSheet.create({
  iosLoginButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  iosLoginButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
});
