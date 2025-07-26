// test.ts

import * as fs from "fs";
import * as path from "path";

type ValidationError = {
  index: number;
  id?: any;
  message: string;
};

function checkDuplicateIds(questions: any[]) {
  const seen = new Set<string>();
  const duplicates: { id: any; index: number }[] = [];

  questions.forEach((q, i) => {
    const key = `${q.id}`;
    if (seen.has(key)) {
      duplicates.push({ id: q.id, index: i });
    } else {
      seen.add(key);
    }
  });

  return duplicates;
}

function validateQuestionSet(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || !Array.isArray(data.questions)) {
    return [
      {
        index: -1,
        message: "questions 배열이 존재하지 않거나 올바르지 않습니다.",
      },
    ];
  }

  data.questions.forEach((q: any, index: number) => {
    const id = q?.id;

    if (!q.type || typeof q.type !== "string") {
      errors.push({
        index,
        id,
        message: `type이 누락되었거나 string이 아닙니다.`,
      });
    }

    if (!q.question || typeof q.question !== "object") {
      errors.push({ index, id, message: `question 객체가 누락되었습니다.` });
    } else {
      const qt = q.question.questionText;
      const qe = q.question.questionExplanation;
      if (!qt || typeof qt !== "string") {
        errors.push({
          index,
          id,
          message: `questionText가 누락되었거나 string이 아닙니다.`,
        });
      }
      if (!Array.isArray(qe)) {
        errors.push({
          index,
          id,
          message: `questionExplanation은 배열이어야 합니다.`,
        });
      }
    }

    if (!Array.isArray(q.choices) && q.type === "objective") {
      errors.push({
        index,
        id,
        message: `객관식인데 choices 배열이 없습니다.`,
      });
    }

    if (!q.answer || typeof q.answer !== "object") {
      errors.push({ index, id, message: `answer 객체가 누락되었습니다.` });
    } else {
      const at = q.answer.answerText;
      const ae = q.answer.answerExplanation;
      if (!at || typeof at !== "string") {
        errors.push({
          index,
          id,
          message: `answerText가 누락되었거나 string이 아닙니다.`,
        });
      }
      if (!ae || typeof ae !== "string") {
        errors.push({
          index,
          id,
          message: `answerExplanation이 누락되었거나 string이 아닙니다.`,
        });
      }
    }

    if (!Array.isArray(q.tags)) {
      errors.push({ index, id, message: `tags는 배열이어야 합니다.` });
    }
  });

  return errors;
}

// Entry point
// const filePath = process.argv[2];
const filePath =
  "/workspaces/codespaces-blank/studia-v4/assets/questions/복합발전운전(객관식).json";
if (!filePath) {
  console.error(
    "❗ JSON 파일 경로를 인자로 입력해주세요. 예: ts test.ts ./data.json"
  );
  process.exit(1);
}

try {
  const jsonPath = path.resolve(filePath);

  if (!fs.existsSync(jsonPath)) {
    console.error("❌ 파일이 존재하지 않습니다:", jsonPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const parsed = JSON.parse(raw);

  const errors = validateQuestionSet(parsed);

  const duplicates = checkDuplicateIds(parsed.questions);
  if (duplicates.length > 0) {
    console.warn("❌ 중복된 id가 발견되었습니다:");
    duplicates.forEach((d) =>
      console.warn(`  - id=${d.id} (index=${d.index + 1})`)
    );
    process.exit(1);
  }

  if (errors.length === 0) {
    console.log("✅ JSON 구조가 유효합니다.");
  } else {
    console.log(`❌ ${errors.length}개의 문제가 감지되었습니다:`);
    errors.forEach((e) => {
      console.warn(
        `  [${e.index + 1}번${e.id ? `, id=${e.id}` : ""}] ${e.message}`
      );
    });
    process.exit(1);
  }
} catch (err) {
  console.error("❌ JSON 파싱 실패:", err);
  process.exit(1);
}
