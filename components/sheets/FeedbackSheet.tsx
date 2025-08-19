import { db } from "@/lib/firebase/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Platform } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/contexts/NotificationContext";
import * as Application from "expo-application";
import { ActionButton } from "../ui/ActionComponents";
import { BottomSheet } from "../ui/BottomSheet";

type FeedbackSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export default function FeedbackSheet({
  visible,
  onClose,
}: FeedbackSheetProps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (feedbackText.trim().length === 0) {
      showNotification({
        title: "알림",
        description: "피드백 내용을 입력해주세요.",
        status: "info",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        text: feedbackText,
        userId: user?.uid ?? null,
        createdAt: serverTimestamp(),
        platform: Platform.OS,
        appVersion: Application.nativeApplicationVersion,
      });

      showNotification({
        title: "감사합니다!",
        description: "소중한 피드백이 전송되었습니다.",
        status: "success",
      });
      setFeedbackText("");
      onClose();
    } catch (error) {
      console.error("피드백 전송 실패:", error);
      showNotification({
        title: "오류",
        description: "피드백 전송에 실패했습니다.",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <Text style={styles.title}>피드백 보내기</Text>
        <TextInput
          style={styles.input}
          placeholder="여기에 의견을 입력해주세요..."
          multiline
          value={feedbackText}
          onChangeText={setFeedbackText}
        />
        <ActionButton
          label="전송"
          onPress={handleSubmit}
          variant="primary"
          loading={isSubmitting}
          icon="send"
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  title: { fontSize: 18, fontWeight: "700" },
  input: {
    minHeight: 120,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
  },
});
