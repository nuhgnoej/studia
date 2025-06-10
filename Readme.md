# 📘 Studia 문제은행 학습 앱

**Studia**는 직무 시험 대비를 위한 문제 풀이 앱입니다.  
SQLite 기반의 로컬 데이터베이스를 사용하며, Expo + React Native로 구현되었습니다.

---

## ✅ 주요 기능

- 문제 세트 선택 후 SQLite에 로드
- 객관식 / 주관식 인터페이스 분기 처리
- 제출 답안 저장 및 정오 판별
- 문제 풀이 후 자동으로 다음 문제로 진행
- 추후 대시보드 기능 예정

---

## 🛠️ 기술 스택

- **React Native** (Expo SDK 53)
- **SQLite (expo-sqlite)**
- TypeScript

---

## 📁 폴더 구조

```
studia/
├── app/
│   └── (tabs)/
│       ├── index.tsx          # 문제 세트 선택 화면
│       └── two.tsx            # 문제 풀이 화면
├── assets/
│   └── questions/             # JSON 문제 세트 저장 위치
│       ├── basic-network.json
│       ├── frontend-core.json
│       └── system-design.json
├── components/
│   ├── ObjectiveQuestion.tsx
│   └── SubjectiveQuestion.tsx
├── lib/
│   ├── db.ts                  # SQLite DB 로직
│   ├── types.ts               # Question 타입 정의
│   ├── questionFileMap.ts     # 문제 세트 정의 (자동 생성 가능)
│   └── loadQuestionsFromFile.ts
├── scripts/
│   └── generateQuestionFileMap.ts  # 자동 등록 스크립트 (Node.js)
```

---

## 📦 문제 세트 관리

### 문제 세트 추가 방법

1. `assets/questions/`에 JSON 파일을 추가  
   예: `operating-systems.json`

2. `lib/questionFileMap.ts`에 등록  
   예:

   ```ts
   import os from "@/assets/questions/operating-systems.json";

   export const questionFileMap = {
     "operating-systems.json": {
       name: "운영체제 기초",
       data: os,
     },
     // ...
   };
   ```

> 또는 `scripts/generateQuestionFileMap.ts`를 실행하여 자동 생성 가능

---

## ⚠️ 빌드시 주의사항

- `scripts/`, `tools/` 등의 Node.js 전용 스크립트는 앱에 import하지 않으면 APK에 포함되지 않음
- `fs`, `path` 등 Node.js 전용 모듈은 `devDependencies`에만 넣기
- `assets/questions/*.json`만 앱 번들에 포함됨

---

## 🚀 향후 계획

- 문제 풀이 결과 요약 대시보드
- Supabase 연동으로 백업/로그인
- 틀린 문제 다시 풀기 기능

---

> © 2025 Studia. All rights reserved.
