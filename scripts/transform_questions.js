// transform_questions.js
const fs = require("fs");

const inputFile = "../assets/questions/복합발전운전(주관식,메타).json";

const outputFile = "../assets/questions/converted.json";

// 원본 JSON 읽기
const raw = fs.readFileSync(inputFile, "utf8");
const data = JSON.parse(raw);

// 변환 실행
const convertedQuestions = data.questions.map((q) => {
//     const answerText = q.answer;
//   const filteredChoices = q.choices.filter((choice) => choice !== answerText);

  return {
    id: q.id,
    type: q.type,
    question: {
      questionText: q.question.question,
      questionExplanation: q.question.explanation ?? []
    },
    choices: q.choice,
    answer: {
        answerText: q.answer,
        answerExplanation: q.explanation || "",
    },
    tags: q.tags,
  };
});

// 새로운 JSON 구성
const transformedData = {
  ...data,
  questions: convertedQuestions,
};

// 저장
fs.writeFileSync(outputFile, JSON.stringify(transformedData, null, 2), "utf8");
console.log("✅ 변환 완료:", outputFile);
