import React from "react";
import { Linking } from "react-native";
import {
  SectionCard,
  ActionButton,
  Caption,
} from "@/components/ui/ActionComponents";
import { useNotification } from "@/contexts/NotificationContext";

// 본인의 후원 페이지 URL로 교체해주세요.
const DEVELOPER_DONATION_URL = "https://buymeacoffee.com/odineyes2o";

export default function SupportDeveloperCard() {
  const { showNotification } = useNotification();

  const handleBuyCoffee = async () => {
    try {
      const supported = await Linking.canOpenURL(DEVELOPER_DONATION_URL);
      if (supported) {
        await Linking.openURL(DEVELOPER_DONATION_URL);
      } else {
        showNotification({
          title: "오류",
          description: "링크를 열 수 없습니다.",
          status: "error",
        });
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
      showNotification({
        title: "오류",
        description: "링크를 여는 중 문제가 발생했습니다.",
        status: "error",
      });
    }
  };

  return (
    <SectionCard title="개발자 후원">
      <ActionButton
        icon="local-cafe"
        label="개발자에게 커피 사주기"
        onPress={handleBuyCoffee}
        variant="neutral"
      />
      <Caption>
        앱이 마음에 드셨다면, 커피 한 잔으로 개발자에게 힘을 보태주세요! 후원은
        더 좋은 기능을 만드는 데 큰 도움이 됩니다.
      </Caption>
    </SectionCard>
  );
}
