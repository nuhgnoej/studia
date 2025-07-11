const fs = require("fs");

const inputFilePath =
  "../assets/questions/복합발전운전(객관식,메타)_filled.json";
const questionsJson = JSON.parse(fs.readFileSync(inputFilePath, "utf8"));
const questions = questionsJson.questions;

const explanationFilePath = "../assets/questions/explanations.json";
const explanations = JSON.parse(fs.readFileSync(explanationFilePath, "utf8"));

const explanationMap = new Map();
explanations.forEach((item) => {
  explanationMap.set(item.id, item.explanation);
});

const updatedQuestions = questions.map((q) => {
  const id = q.id;
  if (explanationMap.has(id)) {
    q.explanation = explanationMap.get(id); // 💡 핵심 수정
  }
  return q;
});

questionsJson.questions = updatedQuestions;

const outputFilePath =
  "../assets/questions/복합발전운전(객관식,메타)_merged.json";

fs.writeFileSync(
  outputFilePath,
  JSON.stringify(questionsJson, null, 2),
  "utf8"
);

console.log("✅ explanation 병합 완료 → 복합발전운전(객관식,메타)_merged.json");
