export type Question = {
  id: number;
  type: "objective" | "subjective";
  question: string;
  choices?: string[];
  answer: string;
  explanation?: string;
};

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
