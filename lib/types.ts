// lib/types.ts

// 문제 유형
export type QuestionType = "objective" | "subjective";

// 메타데이터
export type Metadata = {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: string[];
  difficulty: string;
  version: string;
  created_at: string;
  updated_at: string;
  author: string;
  source: string;
  tags: string[];
  license: string;
  num_questions: number;
};

// 단일 문제
export type Question = {
  id: number;
  subject_id: string;
  type: QuestionType;
  question: {
    questionText: string;
    questionExplanation: string[];
  };
  choices?: string[]; // 객관식일 경우
  answer: {
    answerText: string;
    answerExplanation: string;
  };
  tags?: string[];
  weight?: number;
  created_at?: string;
};

// 전체 JSON 파일 구조
export type QuestionFile = {
  metadata: Metadata;
  questions: Question[];
};

// 여러 파일을 메모리 또는 디스크에 매핑한 형태
export type QuestionFileMap = {
  [filename: string]: {
    name: string; // 표시용 이름
    data: QuestionFile;
  };
};

// 사용자 답안 기록
export type UserAnswer = {
  questionId: number;
  userInput: string;
  isCorrect: boolean;
};

// DB에 저장될 정답 기록
export type AnswerRecord = {
  id?: number;
  question_id: number;
  subject_id: string;
  user_answer: string;
  is_correct: boolean;
  answered_at?: string;
};

// 개별 문제 진척도
export type QuestionProgress = {
  id: number;
  question: string;
  weight: number;
  lastAnsweredAt?: string;
  isMastered: boolean;
};

// 문제별 통계
export type AnswerStats = {
  question_id: number;
  total_attempts: number;
  correct_attempts: number;
  latest_answer: string;
};

// JSON 구조가 SQLite row로 변환되었을 때의 형태
export type RawQuestionRow = {
  id: number;
  subject_id: string;
  type: QuestionType;
  question: string; // JSON.stringify 된 question 객체
  choices: string | null; // JSON.stringify 또는 null
  answer: string; // JSON.stringify 된 answer 객체
  explanation: string;
  weight: number;
  created_at: string;
};
