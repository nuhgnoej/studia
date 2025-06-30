// checkAnswers.js

const fs = require("fs");

// JSON 파일 경로
const filePath = "../assets/questions/복합발전운전(객관식,메타).json";

// 파일 읽기
const rawData = fs.readFileSync(filePath, "utf-8");
const jsonData = JSON.parse(rawData);

// 배열로 저장된 answer 찾기
const arrayAnswers = jsonData.questions.filter((q) => Array.isArray(q.answer));

if (arrayAnswers.length === 0) {
  console.log("✅ 배열 형태로 저장된 answer는 없습니다.");
} else {
  console.log(
    `⚠️ 배열 형태의 answer가 ${arrayAnswers.length}개 발견되었습니다.`
  );
  console.log(
    "문제 ID 목록:",
    arrayAnswers.map((q) => q.id)
  );
  console.log("자세한 내용:", arrayAnswers);
}
