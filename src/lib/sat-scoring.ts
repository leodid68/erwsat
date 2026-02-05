// SAT ERW Score Estimation System
// SAT ERW section: 200-800 points
// Based on 54 questions in the real SAT ERW section

// Raw score to scaled score conversion table (approximate)
// This is based on typical SAT scoring curves
const SCORE_CONVERSION_TABLE: Record<number, number> = {
  54: 800, 53: 790, 52: 780, 51: 770, 50: 760,
  49: 750, 48: 740, 47: 730, 46: 720, 45: 710,
  44: 700, 43: 690, 42: 680, 41: 670, 40: 660,
  39: 650, 38: 640, 37: 630, 36: 620, 35: 610,
  34: 600, 33: 590, 32: 580, 31: 570, 30: 560,
  29: 550, 28: 540, 27: 530, 26: 520, 25: 510,
  24: 500, 23: 490, 22: 480, 21: 470, 20: 460,
  19: 450, 18: 440, 17: 430, 16: 420, 15: 410,
  14: 400, 13: 390, 12: 380, 11: 370, 10: 360,
  9: 350, 8: 340, 7: 330, 6: 320, 5: 310,
  4: 300, 3: 280, 2: 260, 1: 240, 0: 200,
};

// Difficulty multipliers for adaptive scoring
export const DIFFICULTY_MULTIPLIERS = {
  easy: 0.8,
  medium: 1.0,
  hard: 1.2,
};

export interface SATScoreEstimate {
  rawScore: number;
  totalQuestions: number;
  scaledScore: number;
  percentile: number;
  performanceLevel: 'below' | 'approaching' | 'meeting' | 'exceeding';
  adjustedScore?: number; // Score adjusted for difficulty
}

/**
 * Calculate estimated SAT score from quiz performance
 */
export function estimateSATScore(
  correctAnswers: number,
  totalQuestions: number,
  difficultyBreakdown?: { easy: number; medium: number; hard: number }
): SATScoreEstimate {
  // Normalize to 54-question scale (SAT ERW standard)
  const normalizedRaw = Math.round((correctAnswers / totalQuestions) * 54);

  // Get scaled score from conversion table
  const scaledScore = SCORE_CONVERSION_TABLE[normalizedRaw] ||
    interpolateScore(normalizedRaw);

  // Calculate adjusted score if difficulty breakdown provided
  let adjustedScore: number | undefined;
  if (difficultyBreakdown) {
    const totalDifficultyQuestions = difficultyBreakdown.easy + difficultyBreakdown.medium + difficultyBreakdown.hard;
    if (totalDifficultyQuestions > 0) {
      const weightedDifficulty =
        (difficultyBreakdown.easy * DIFFICULTY_MULTIPLIERS.easy +
         difficultyBreakdown.medium * DIFFICULTY_MULTIPLIERS.medium +
         difficultyBreakdown.hard * DIFFICULTY_MULTIPLIERS.hard) / totalDifficultyQuestions;

      // Adjust score based on difficulty (harder tests = bonus)
      const adjustmentFactor = weightedDifficulty;
      const rawAdjusted = Math.round(normalizedRaw * adjustmentFactor);
      adjustedScore = SCORE_CONVERSION_TABLE[Math.min(54, rawAdjusted)] ||
        interpolateScore(Math.min(54, rawAdjusted));
    }
  }

  // Calculate percentile (approximate based on score)
  const percentile = calculatePercentile(scaledScore);

  // Determine performance level
  const performanceLevel = getPerformanceLevel(scaledScore);

  return {
    rawScore: correctAnswers,
    totalQuestions,
    scaledScore,
    percentile,
    performanceLevel,
    adjustedScore,
  };
}

/**
 * Interpolate score for values not in the table
 */
function interpolateScore(rawScore: number): number {
  if (rawScore >= 54) return 800;
  if (rawScore <= 0) return 200;

  const lowerRaw = Math.floor(rawScore);
  const upperRaw = Math.ceil(rawScore);

  const lowerScore = SCORE_CONVERSION_TABLE[lowerRaw] || 200;
  const upperScore = SCORE_CONVERSION_TABLE[upperRaw] || 800;

  const fraction = rawScore - lowerRaw;
  return Math.round(lowerScore + (upperScore - lowerScore) * fraction);
}

/**
 * Calculate approximate percentile from scaled score
 */
function calculatePercentile(scaledScore: number): number {
  // Approximate percentiles based on College Board data
  if (scaledScore >= 750) return 99;
  if (scaledScore >= 700) return 93;
  if (scaledScore >= 650) return 83;
  if (scaledScore >= 600) return 69;
  if (scaledScore >= 550) return 53;
  if (scaledScore >= 500) return 37;
  if (scaledScore >= 450) return 23;
  if (scaledScore >= 400) return 12;
  if (scaledScore >= 350) return 5;
  return 1;
}

/**
 * Get performance level based on score
 */
function getPerformanceLevel(scaledScore: number): 'below' | 'approaching' | 'meeting' | 'exceeding' {
  if (scaledScore >= 700) return 'exceeding';
  if (scaledScore >= 550) return 'meeting';
  if (scaledScore >= 450) return 'approaching';
  return 'below';
}

/**
 * Get score color for UI
 */
export function getScoreColor(scaledScore: number): string {
  if (scaledScore >= 700) return 'text-emerald-400';
  if (scaledScore >= 550) return 'text-blue-400';
  if (scaledScore >= 450) return 'text-amber-400';
  return 'text-red-400';
}

/**
 * Get score badge variant
 */
export function getScoreBadgeColor(scaledScore: number): string {
  if (scaledScore >= 700) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (scaledScore >= 550) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (scaledScore >= 450) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

/**
 * Get performance level label in French
 */
export function getPerformanceLevelLabel(level: SATScoreEstimate['performanceLevel']): string {
  switch (level) {
    case 'exceeding': return 'Excellent';
    case 'meeting': return 'Satisfaisant';
    case 'approaching': return 'En progression';
    case 'below': return 'À améliorer';
  }
}

/**
 * Calculate adaptive difficulty based on recent performance
 * Returns recommended difficulty distribution for next quiz
 */
export function calculateAdaptiveDifficulty(
  recentAccuracy: number // 0-100
): { easy: number; medium: number; hard: number } {
  if (recentAccuracy >= 80) {
    // High performer: more hard questions
    return { easy: 10, medium: 40, hard: 50 };
  } else if (recentAccuracy >= 60) {
    // Medium performer: balanced
    return { easy: 20, medium: 50, hard: 30 };
  } else if (recentAccuracy >= 40) {
    // Struggling: more easy/medium
    return { easy: 40, medium: 45, hard: 15 };
  } else {
    // Needs foundation: mostly easy
    return { easy: 60, medium: 35, hard: 5 };
  }
}
