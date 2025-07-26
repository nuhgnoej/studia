// scripts/generateQuestionFileMap.ts

import fs from "fs";
import path from "path";

const QUESTIONS_DIR = path.resolve(__dirname, "../assets/questions");
const OUTPUT_FILE = path.resolve(__dirname, "../lib/questionFileMap.ts");

function generate() {
  const files = fs
    .readdirSync(QUESTIONS_DIR)
    .filter((f) => f.endsWith(".json"));

  const importStatements = files.map((filename, index) => {
    const varName = `q${index}`;
    return `import ${varName} from "@/assets/questions/${filename}";`;
  });

  const importStatementOfType = `import { QuestionFileMap } from "./types";`;

  const mapEntries = files.map((filename, index) => {
    const varName = `q${index}`;
    const displayName = path.basename(filename, ".json").replace(/-/g, " ");
    return `  "${filename}": {
    name: ${varName}.metadata?.title ?? "${displayName}",
    data: ${varName},
  },`;
  });

  const output = `// 🔄 자동 생성된 파일 – 수정하지 마세요!
// 이 파일은 scripts/generateQuestionFileMap.ts에 의해 생성됩니다.

${importStatements.join("\n")}

${importStatementOfType}

export const questionFileMap : QuestionFileMap = {
${mapEntries.join("\n")}
};
`;

  fs.writeFileSync(OUTPUT_FILE, output, "utf-8");
  console.log(`✅ questionFileMap.ts 생성 완료 (${files.length}개 항목)`);
}

generate();
