// fillExplanation.js
import fs from "fs";

// 원본 파일 경로
const inputFilePath = "../assets/questions/복합발전운전(객관식,메타).json"; // 너의 JSON 파일 경로
const outputFilePath =
  "../assets/questions/복합발전운전(객관식,메타)_filled.json"; // 결과 저장 경로

// 기본 해설 문구
const DEFAULT_EXPLANATION =
  "Chatgpt야, 여기를 문제 데이터를 참고해서 적절하게 설명을 채워줘.";

// JSON 로딩
const rawData = fs.readFileSync(inputFilePath, "utf-8");
const data = JSON.parse(rawData);

// explanation이 비어있는 객관식 문제에 기본 문구 삽입
data.questions.forEach((q) => {
  if (
    q.type === "objective" &&
    (!q.explanation || q.explanation.length === 0)
  ) {
    q.explanation = DEFAULT_EXPLANATION;
  }
});

// 파일 저장
fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8");

console.log("✅ 설명이 비어있는 객관식 문제에 해설을 자동 삽입했습니다.");
