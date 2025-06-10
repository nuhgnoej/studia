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
