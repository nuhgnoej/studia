// tagExtractor.ts

import { questionFileMap } from "@/lib/questionFileMap";
import * as fs from "fs";
import * as path from "path";

export function extractUniqueTags(): string[] {
  const tagSet = new Set<string>();

  Object.values(questionFileMap).forEach((entry) => {
    entry.data.questions.forEach((q) => {
      q.tags?.forEach((tag) => {
        tagSet.add(tag);
      });
    });
  });

  return Array.from(tagSet).sort();
}

// ✅ 실행 로직
function main() {
  const tags = extractUniqueTags();
  console.log("✅ 추출된 태그 목록:", tags);

  const outputDir = path.resolve(__dirname, "../assets");
  const outputPath = path.join(outputDir, "tags.json");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(tags, null, 2), "utf-8");

  console.log(`✅ 태그 목록이 저장되었습니다: ${outputPath}`);
}

main();
