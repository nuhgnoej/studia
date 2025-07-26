const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../assets/questions/quizSet1.json');
const outputPath = path.join(__dirname, '../assets/questions/quizSet1_converted.json');

const raw = fs.readFileSync(inputPath, 'utf-8');
const data = JSON.parse(raw);

const converted = data.map((item) => {
  // 이미 변환된 경우는 건드리지 않음
  if (typeof item.question === 'object' && item.question.question) return item;
  return {
    ...item,
    question: {
      question: item.question,
      explanation: [],
    },
  };
});

fs.writeFileSync(outputPath, JSON.stringify(converted, null, 2), 'utf-8');
console.log('변환 완료:', outputPath); 