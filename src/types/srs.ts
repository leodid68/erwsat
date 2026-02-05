export interface SRSItem {
  questionId: string;
  quizId: string;
  interval: number; // days until next review
  easeFactor: number; // difficulty multiplier (default 2.5)
  repetitions: number; // number of successful reviews
  nextReview: string; // ISO date
  lastReview: string; // ISO date
}

// SM-2 algorithm grades
// 0 = complete blackout
// 1 = incorrect, but recognized on seeing answer
// 2 = incorrect, but easy to recall
// 3 = correct with difficulty
// 4 = correct with hesitation
// 5 = perfect response
export type SRSGrade = 0 | 1 | 2 | 3 | 4 | 5;

export const SRS_GRADE_LABELS: Record<SRSGrade, string> = {
  0: 'Aucun souvenir',
  1: 'Incorrect',
  2: 'Difficile',
  3: 'Correct (difficile)',
  4: 'Correct',
  5: 'Parfait',
};

export const SRS_GRADE_COLORS: Record<SRSGrade, string> = {
  0: 'text-red-500',
  1: 'text-red-400',
  2: 'text-orange-400',
  3: 'text-amber-400',
  4: 'text-emerald-400',
  5: 'text-emerald-500',
};

// Default ease factor for new items
export const DEFAULT_EASE_FACTOR = 2.5;

// Minimum ease factor to prevent intervals from becoming too short
export const MIN_EASE_FACTOR = 1.3;

// Calculate next interval using SM-2 algorithm
export function calculateNextInterval(
  currentInterval: number,
  easeFactor: number,
  grade: SRSGrade,
  repetitions: number
): { interval: number; easeFactor: number; repetitions: number } {
  // Failed review (grade < 3): reset to beginning
  if (grade < 3) {
    return {
      interval: 1,
      easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 0.2),
      repetitions: 0,
    };
  }

  // Successful review
  let newInterval: number;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(currentInterval * easeFactor);
  }

  // Adjust ease factor based on grade
  const newEaseFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  );

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: repetitions + 1,
  };
}
