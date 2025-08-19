import React from "react";
import { ImageBackground, StyleSheet } from "react-native";

// 배경 이미지 파일을 불러옵니다.
const backgroundImage = require("@/assets/images/bgimg-xxxhdpi.png");

// children prop의 타입을 정의합니다.
type ScreenWithBackgroundProps = {
  children: React.ReactNode;
};

export default function ScreenWithBackground({
  children,
}: ScreenWithBackgroundProps) {
  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="cover"
      style={styles.container}
      imageStyle={{ opacity: 0.1 }} // 이미지 자체의 스타일
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 전체 화면을 차지하도록 설정
    backgroundColor: "#f9fafb", // 이미지가 로드되기 전이나 투명할 때 보일 배경색
  },
});
