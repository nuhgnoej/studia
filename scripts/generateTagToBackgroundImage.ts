import fs from "fs";
import path from "path";

// 경로 설정
const tagsPath = path.resolve(__dirname, "../assets/tags.json");
const backgroundsPath = path.resolve(__dirname, "../assets/backgrounds");
const outputPath = path.resolve(__dirname, "../lib/tagToBackgroundImage.ts");

// 태그 불러오기
const tags = JSON.parse(fs.readFileSync(tagsPath, "utf-8")) as string[];

// 배경 이미지 파일 목록
const backgroundFiles = fs.readdirSync(backgroundsPath);
const backgroundSet = new Set(
  backgroundFiles
    .filter((f) => f.endsWith(".png"))
    .map((f) => f.replace(".png", ""))
);

// 라인 생성
const lines: string[] = [];

lines.push(`export const tagToBackgroundImage: Record<string, any> = {`);

for (const tag of tags) {
  const line = `${tag}: require("../assets/backgrounds/${tag}.png"),`;

  if (backgroundSet.has(tag)) {
    lines.push(`  ${line}`);
  } else {
    lines.push(`  // ${line}`);
  }
}

lines.push(`};\n`);

lines.push(
  `export const defaultBackground = require("../assets/backgrounds/default.png");\n`
);

// 파일 쓰기
fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");

console.log("✅ tagToBackgroundImage.ts 생성 완료!");
