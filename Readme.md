# 📘 Studia 프로젝트

## ✅ 프로젝트 개요

- **목표**: 직무 시험 대비용 문제은행 학습 앱
- **기술 스택**: Expo + React Native
- **DB**: 로컬 SQLite (서버 불필요, 추후 Supabase 연동 고려)
- **특징**:
  - 문제 저장 및 조회 기능
  - 퀴즈 UI 구성 예정
  - 비용 최소화를 위한 로컬 우선 구조

---

## 📁 디렉토리 구조

studia/
├── app/
│ └── (tabs)/
│ ├── index.tsx # 소개 페이지
│ └── two.tsx # 문제 목록 화면
├── lib/
│ ├── db.ts # SQLite DB 제어 로직
│ ├── types.ts # Question 타입 정의
│ └── loadDummy.ts # JSON 문제 불러오기
├── assets/
│ └── dummy-questions.json # 더미 문제 데이터
└── tsconfig.json

pgsql
복사
편집

---

## 🗃️ 데이터 스키마

### 🔹 SQLite 테이블

```sql
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY NOT NULL,
  type TEXT NOT NULL DEFAULT 'objective',
  question TEXT NOT NULL,
  choices TEXT,              -- JSON.stringify된 string[] 또는 "[]"
  answer TEXT NOT NULL,
  explanation TEXT
);
🔹 TypeScript 타입 (lib/types.ts)
ts
복사
편집
export type Question = {
  id: number;
  type: 'objective' | 'subjective';
  question: string;
  choices?: string[];
  answer: string;
  explanation?: string;
};
🔧 주요 기능 (lib/db.ts)
getDatabase()
→ SQLite DB 객체 제공 (lazy init)

initDatabase()
→ DB 및 테이블 초기화

insertQuestions(questions: Question[])
→ 문제 배열 삽입

getAllQuestions()
→ 전체 문제 반환

getQuestionById(id)
→ 특정 문제 반환

getQuestionCount()
→ 총 문제 수 반환

👉 모든 함수는 내부적으로 getDatabase() 호출을 통해 안전하게 DB에 접근합니다.

🧪 더미 문제 데이터 로드 (lib/loadDummy.ts)
ts
복사
편집
import data from '@/assets/dummy-questions.json';
import { insertQuestions } from './db';

export async function loadDummyQuestions() {
  const cleaned = data.map(q => ({
    id: q.id,
    question: q.question,
    choices: Array.isArray(q.choices) ? q.choices : [],
    answer: q.answer,
    explanation: q.explanation ?? '',
  }));

  await insertQuestions(cleaned);
}
📱 UI 구성 (app/(tabs)/two.tsx)
getAllQuestions() 호출 → 문제 리스트 렌더링

type === 'objective'일 때만 choices 표시

questions.length === 0일 경우 안내 메시지 표시

⚠️ 해결한 주요 이슈
answer 타입 오류 → string으로 통일

choices: null 오류 → [] 처리로 방어

DB 미초기화 오류 → 모든 함수에서 getDatabase() 호출로 해결

expo-sqlite Web 미지원 → Web 환경에서는 사용하지 않도록 설계

🧩 다음 작업 예정
- [ ] 문제 상세 보기 또는 퀴즈 모드 추가
- [ ] 사용 이력 저장 기능 설계
- [ ] Supabase 연동 고려 (로그인/백업 등)
```
