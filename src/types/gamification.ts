import { LucideIcon } from 'lucide-react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  condition: BadgeCondition;
}

export type BadgeCondition =
  | { type: 'quizzes_completed'; count: number }
  | { type: 'streak_days'; count: number }
  | { type: 'accuracy_percent'; value: number }
  | { type: 'questions_answered'; count: number }
  | { type: 'perfect_quiz' }
  | { type: 'srs_reviews'; count: number };

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string; // ISO date
}

export interface WeeklyChallenge {
  id: string;
  week: string; // ISO week (e.g., "2024-W01")
  description: string;
  target: number;
  current: number;
  type: 'quizzes' | 'questions' | 'accuracy' | 'streak';
  rewardBadgeId?: string;
  completed: boolean;
}

export interface UserGoal {
  id: string;
  description: string;
  targetDate: string; // ISO date
  target: number;
  current: number;
  type: 'score' | 'quizzes' | 'streak';
  completed: boolean;
}

// Available badges definition
export const AVAILABLE_BADGES: Badge[] = [
  // Getting Started
  {
    id: 'first-quiz',
    name: 'Premier Pas',
    description: 'Complétez votre premier quiz',
    icon: 'Rocket',
    condition: { type: 'quizzes_completed', count: 1 },
  },
  {
    id: 'ten-quizzes',
    name: 'Régulier',
    description: '10 quiz complétés',
    icon: 'Target',
    condition: { type: 'quizzes_completed', count: 10 },
  },
  {
    id: 'fifty-quizzes',
    name: 'Assidu',
    description: '50 quiz complétés',
    icon: 'Medal',
    condition: { type: 'quizzes_completed', count: 50 },
  },

  // Streak badges
  {
    id: 'streak-3',
    name: 'Persévérant',
    description: '3 jours d\'affilée',
    icon: 'Flame',
    condition: { type: 'streak_days', count: 3 },
  },
  {
    id: 'streak-7',
    name: 'Dévoué',
    description: '7 jours d\'affilée',
    icon: 'Zap',
    condition: { type: 'streak_days', count: 7 },
  },
  {
    id: 'streak-30',
    name: 'Implacable',
    description: '30 jours d\'affilée',
    icon: 'Crown',
    condition: { type: 'streak_days', count: 30 },
  },

  // Performance badges
  {
    id: 'perfect',
    name: 'Parfait',
    description: '100% sur un quiz',
    icon: 'Star',
    condition: { type: 'perfect_quiz' },
  },
  {
    id: 'accuracy-70',
    name: 'Compétent',
    description: '70% de précision globale',
    icon: 'BadgeCheck',
    condition: { type: 'accuracy_percent', value: 70 },
  },
  {
    id: 'accuracy-80',
    name: 'Expert',
    description: '80% de précision globale',
    icon: 'Award',
    condition: { type: 'accuracy_percent', value: 80 },
  },
  {
    id: 'accuracy-90',
    name: 'Maître',
    description: '90% de précision globale',
    icon: 'GraduationCap',
    condition: { type: 'accuracy_percent', value: 90 },
  },

  // Volume badges
  {
    id: 'century',
    name: 'Centurion',
    description: '100 questions répondues',
    icon: 'Shield',
    condition: { type: 'questions_answered', count: 100 },
  },
  {
    id: 'five-hundred',
    name: 'Vétéran',
    description: '500 questions répondues',
    icon: 'Swords',
    condition: { type: 'questions_answered', count: 500 },
  },
  {
    id: 'thousand',
    name: 'Millénaire',
    description: '1000 questions répondues',
    icon: 'Trophy',
    condition: { type: 'questions_answered', count: 1000 },
  },

  // SRS badges
  {
    id: 'srs-10',
    name: 'Réviseur',
    description: '10 révisions SRS complétées',
    icon: 'Brain',
    condition: { type: 'srs_reviews', count: 10 },
  },
  {
    id: 'srs-50',
    name: 'Mémorisateur',
    description: '50 révisions SRS complétées',
    icon: 'Lightbulb',
    condition: { type: 'srs_reviews', count: 50 },
  },
];

// Get current ISO week string
export function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Generate a weekly challenge
export function generateWeeklyChallenge(): WeeklyChallenge {
  const week = getCurrentWeek();
  const challenges: Omit<WeeklyChallenge, 'id' | 'week' | 'current' | 'completed'>[] = [
    { description: 'Compléter 5 quiz cette semaine', target: 5, type: 'quizzes' },
    { description: 'Répondre à 50 questions', target: 50, type: 'questions' },
    { description: 'Maintenir une série de 5 jours', target: 5, type: 'streak' },
    { description: 'Compléter 3 quiz cette semaine', target: 3, type: 'quizzes' },
    { description: 'Répondre à 100 questions', target: 100, type: 'questions' },
  ];

  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

  return {
    id: `challenge-${week}`,
    week,
    ...randomChallenge,
    current: 0,
    completed: false,
  };
}
