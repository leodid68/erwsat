import { Question, AnswerId, QuestionType } from './question';

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  sourceDocument?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface QuestionResult {
  questionId: string;
  selectedAnswer: AnswerId | null; // null = unanswered
  isCorrect: boolean;
  timeSpent: number; // seconds
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  answers: Record<string, AnswerId>;
  score: number;
  totalQuestions: number;
  timeSpent: number; // seconds
  completedAt: Date;
  questionResults: QuestionResult[];
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, AnswerId>;
  flaggedQuestions: Set<string>;
  startTime: Date;
  questionStartTime: Date;
}

export interface ExtractedDocument {
  id: string;
  filename: string;
  extractedText: string;
  passages: Passage[];
  uploadedAt: Date;
}

export interface Passage {
  id: string;
  text: string;
  wordCount: number;
  selected: boolean;
}

export interface GenerationRequest {
  passages: Passage[];
  questionTypes: QuestionType[];
  questionsPerPassage: number;
}
