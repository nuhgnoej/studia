# 📘 Studia 문제은행 학습 앱

**Studia**는 직무 시험 대비 및 반복 학습을 위한 문제 풀이 앱입니다.  
SQLite 기반의 로컬 데이터베이스를 사용하며, Expo + React Native로 구현되었습니다.

---

## ✅ 주요 기능

- 문제 세트 선택 후 SQLite에 로드
- 객관식 / 주관식 인터페이스 분기 처리
- 제출 답안 저장 및 정오 판별
- 문제 풀이 후 자동으로 다음 문제로 진행
- `answers` 테이블 기록 및 `questions` 통계 갱신
- 분석 페이지에서 시도/정답 통계 및 가중치 기반 학습 우선순위 제공

---

## 🛠️ 기술 스택

- **React Native** (Expo SDK 53)
- **SQLite (`expo-sqlite`)**
- **TypeScript**

---

## 📁 폴더 구조

```
studia/
├── app/
│   └── (tabs)/
│       ├── index.tsx              # 문제 세트 선택 화면
│       ├── two.tsx                # 문제 풀이 화면 (임시)
│       └── analytics.tsx          # 학습 분석 화면
├── assets/
│   └── questions/                 # JSON 문제 세트 저장 위치
│       ├── basic-network.json
│       ├── frontend-core.json
│       └── system-design.json
├── components/
│   ├── ObjectiveQuestion.tsx      # 객관식 문제 컴포넌트
│   └── SubjectiveQuestion.tsx     # 주관식 문제 컴포넌트
├── lib/
│   ├── db.ts                      # SQLite DB 초기화 및 조작 함수
│   ├── types.ts                   # 공통 타입 정의
│   ├── questionFileMap.ts         # 문제 세트 정의 (자동 생성 가능)
│   └── loadQuestionsFromFile.ts   # 문제 세트 JSON 로드 및 삽입
├── scripts/
│   └── generateQuestionFileMap.ts # JSON 파일 기반 자동 등록 스크립트
```

---

## 📦 문제 세트 관리 방법

### JSON 파일 추가 및 등록

1. `assets/questions/`에 `.json` 파일 추가  
   예: `operating-systems.json`

2. `lib/questionFileMap.ts`에 아래와 같이 수동 등록

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

3. 또는 `scripts/generateQuestionFileMap.ts` 실행하여 자동 등록

---

## 📦 DB 스키마 구조

### `questions` 테이블

| 필드명           | 타입    | 설명                                    |
| ---------------- | ------- | --------------------------------------- |
| id               | INTEGER | 문제 ID                                 |
| type             | TEXT    | 문제 유형 ('objective' or 'subjective') |
| question         | TEXT    | 질문 텍스트                             |
| choices          | TEXT    | 선택지(JSON 배열) - 객관식만            |
| answer           | TEXT    | 정답 텍스트                             |
| explanation      | TEXT    | 해설                                    |
| total_attempts   | INTEGER | 총 시도 횟수                            |
| correct_attempts | INTEGER | 정답 시도 횟수                          |
| weight           | REAL    | 문제 가중치 (기본값 1.0)                |

### `answers` 테이블

| 필드명      | 타입     | 설명             |
| ----------- | -------- | ---------------- |
| id          | INTEGER  | 고유 ID          |
| question_id | INTEGER  | 참조되는 문제 ID |
| user_answer | TEXT     | 사용자의 입력    |
| is_correct  | INTEGER  | 1: 정답, 0: 오답 |
| answered_at | DATETIME | 제출 시각        |

---

## 💡 가중치(weight) 시스템

- 초기값: `1.0`
- 정답 시: `weight = max(weight - 0.1, 0.1)`
- 오답 시: `weight = min(weight + 0.1, 10.0)`
- 가중치가 높을수록 **출제 확률 증가**, 낮을수록 **출제 빈도 감소**
- 분석 페이지에서 이 가중치를 바탕으로 **학습 우선순위**를 시각화

---

## ⚠️ 빌드 및 사용시 주의사항

- DB 컬럼 변경 시 수동 마이그레이션 필요
- 앱을 재설치하거나 `DROP TABLE` 후 재생성하지 않으면 컬럼 누락 오류 발생 가능
- `scripts/`, `tools/` 디렉토리는 앱에 import하지 않으면 빌드 시 포함되지 않음
- `fs`, `path` 등 Node.js 전용 모듈은 반드시 `devDependencies`에만 추가
- `assets/questions/*.json` 파일만 앱 번들에 자동 포함됨

---

## 📈 향후 계획

- [ ] 가중치 기반 문제 출제 로직 구현 (예: 출제 우선순위 랜덤 추출)
- [ ] 문제 세트별 통계 요약 기능
- [ ] 학습 히스토리 시각화 (그래프)
- [ ] Supabase 연동 (백업/복구/로그인)
- [ ] 틀린 문제 다시 풀기 기능
- [ ] 사용자 맞춤 추천 문제 세트

---

> © 2025 Studia. All rights reserved.
