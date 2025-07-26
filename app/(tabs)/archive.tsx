// app/(tabs)/archive.tsx

import { commonStyles } from "../../styles/common";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import OfficialArchive from "../archive/OfficialArchive";
import CommunityArchive from "../archive/CommunityArchive";
import { View } from "react-native";
import ScreenHeaderWithFAB from "@/components/ScreenHeaderWithFAB";

const Tab = createMaterialTopTabNavigator();

export default function ArchiveScreen() {
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
        }}
      >
        <Tab.Screen name="공식 아카이브" component={OfficialArchive} />
        <Tab.Screen name="커뮤니티 아카이브" component={CommunityArchive} />
      </Tab.Navigator>
    </View>
  );
}
