export type UserAnswer = {
  questionId: number;
  userInput: string;
  isCorrect: boolean;
};

export type Stats = {
  totalAnswered: number;
  correct: number;
  wrong: number;
};

export type AnswerRecord = {
  id?: number;
  question_id: number;
  user_answer: string;
  is_correct: boolean;
  answered_at?: string; // SQLite의 DATETIME은 string으로 처리
};

export type QuestionSet = {
  name: string; // 예: "네트워크 기초"
  file: string; // 예: "basic-network.json"
};

export type QuestionProgress = {
  id: number;
  question: string;
  weight: number;
  lastAnsweredAt?: string;
  isMastered: boolean;
};

export type RawQuestionRow = {
  id: number;
  type: string;
  question: string;
  choices: string | null;
  answer: string;
  explanation: string;
  weight: number;
};

export type AnswerStats = {
  question_id: number;
  total_attempts: number;
  correct_attempts: number;
  latest_answer: string;
};

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

export type Question = {
  id: number;
  type: string;
  subject_id?: string;
  question: {
    question: string;
    explanation: string[];
  };
  choices?: string[] | null;
  answer: string;
  explanation: string;
  tags?: string[];
  weight?: number;
  created_at?: string;
};

export type QuestionFile = {
  metadata: Metadata;
  questions: Question[];
};

export type QuestionFileMap = {
  [filename: string]: {
    name: string;
    data: QuestionFile;
  };
};
