import { QuestionType } from './question';
import { QuizAttempt } from './quiz';
import { SRSItem } from './srs';
import { UnlockedBadge, WeeklyChallenge, UserGoal } from './gamification';

export interface UserProgress {
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  accuracyByType: Record<QuestionType, { correct: number; total: number }>;
  recentScores: number[]; // Last 10 quiz scores as percentages
  studyStreak: number; // Consecutive days
  lastStudyDate: string; // ISO date string
  quizHistory: QuizAttempt[];
  srsQueue: SRSItem[]; // Spaced repetition queue
  // Gamification
  unlockedBadges: UnlockedBadge[];
  weeklyChallenge: WeeklyChallenge | null;
  goals: UserGoal[];
  srsReviewCount: number; // Total SRS reviews completed
}

export interface DailyStats {
  date: string;
  questionsAnswered: number;
  accuracy: number;
}

export interface CategoryPerformance {
  type: QuestionType;
  label: string;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
}

export const createInitialProgress = (): UserProgress => ({
  totalQuizzesTaken: 0,
  totalQuestionsAnswered: 0,
  overallAccuracy: 0,
  accuracyByType: {
    // Information and Ideas
    'central-ideas': { correct: 0, total: 0 },
    'inferences': { correct: 0, total: 0 },
    'command-of-evidence': { correct: 0, total: 0 },
    // Craft and Structure
    'words-in-context': { correct: 0, total: 0 },
    'text-structure-purpose': { correct: 0, total: 0 },
    'cross-text-connections': { correct: 0, total: 0 },
    // Expression of Ideas
    'rhetorical-synthesis': { correct: 0, total: 0 },
    'transitions': { correct: 0, total: 0 },
    // Standard English Conventions
    'boundaries': { correct: 0, total: 0 },
    'form-structure-sense': { correct: 0, total: 0 },
  },
  recentScores: [],
  studyStreak: 0,
  lastStudyDate: '',
  quizHistory: [],
  srsQueue: [],
  // Gamification
  unlockedBadges: [],
  weeklyChallenge: null,
  goals: [],
  srsReviewCount: 0,
});
