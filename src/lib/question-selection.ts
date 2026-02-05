import { Question, TextGenre } from '@/types/question';

/**
 * Configuration for question selection
 */
export interface SelectionConfig {
  targetCount: number;
  maxQuestionsPerPassage: number;  // Max 2 for SAT-like
  minUniquePassagePercent: number; // 80% for SAT-like
  ensureGenreDiversity: boolean;
  difficultyDistribution?: {
    easy: number;    // percentage
    medium: number;
    hard: number;
  };
}

/**
 * Default SAT-like configuration
 */
export const SAT_SELECTION_CONFIG: SelectionConfig = {
  targetCount: 54,
  maxQuestionsPerPassage: 2,
  minUniquePassagePercent: 80,
  ensureGenreDiversity: true,
  difficultyDistribution: {
    easy: 20,
    medium: 50,
    hard: 30,
  },
};

/**
 * Group questions by passage
 */
function groupByPassage(questions: Question[]): Map<string, Question[]> {
  const groups = new Map<string, Question[]>();

  questions.forEach((q) => {
    // Use passageId if available, otherwise hash the passage text
    const key = q.passageId || hashPassage(q.passage);

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(q);
  });

  return groups;
}

/**
 * Simple hash for passage text (for grouping similar passages)
 */
function hashPassage(passage: string): string {
  // Normalize and take first 100 chars for comparison
  const normalized = passage.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 100);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `passage-${hash}`;
}

/**
 * Detect genre from passage text if not specified
 */
export function detectGenre(passage: string, source?: string): TextGenre {
  const text = (passage + ' ' + (source || '')).toLowerCase();

  // Poetry indicators
  if (text.includes('poem') || text.includes('verse') || text.includes('stanza') ||
      /\n\s*\n/.test(passage) && passage.split('\n').length > 5) {
    return 'poetry';
  }

  // Scientific indicators
  if (text.includes('study') || text.includes('research') || text.includes('experiment') ||
      text.includes('hypothesis') || text.includes('data') || text.includes('findings')) {
    return 'science';
  }

  // Historical indicators
  if (text.includes('century') || text.includes('historical') || text.includes('declaration') ||
      /\b(18|19)\d{2}\b/.test(text) || text.includes('president') || text.includes('congress')) {
    return 'history';
  }

  // Journalism indicators
  if (text.includes('reporter') || text.includes('news') || text.includes('article') ||
      text.includes('according to') || text.includes('sources say')) {
    return 'journalism';
  }

  // Social science indicators
  if (text.includes('psychology') || text.includes('society') || text.includes('behavior') ||
      text.includes('economic') || text.includes('cultural')) {
    return 'social-science';
  }

  // Literature indicators
  if (text.includes('novel') || text.includes('story') || text.includes('character') ||
      text.includes('narrator') || text.includes('she said') || text.includes('he said')) {
    return 'literature';
  }

  // Memoir indicators
  if (text.includes('i remember') || text.includes('my father') || text.includes('my mother') ||
      text.includes('when i was') || text.includes('autobiography')) {
    return 'memoir';
  }

  // Humanities
  if (text.includes('art') || text.includes('philosophy') || text.includes('aesthetic') ||
      text.includes('culture') || text.includes('museum')) {
    return 'humanities';
  }

  return 'other';
}

/**
 * Select questions with passage diversity for SAT-like experience
 */
export function selectQuestionsWithDiversity(
  allQuestions: Question[],
  config: SelectionConfig = SAT_SELECTION_CONFIG
): Question[] {
  if (allQuestions.length === 0) return [];

  // Enrich questions with genre if missing
  const enrichedQuestions = allQuestions.map((q) => ({
    ...q,
    genre: q.genre || detectGenre(q.passage, q.passageSource),
    passageId: q.passageId || hashPassage(q.passage),
  }));

  // Group by passage
  const passageGroups = groupByPassage(enrichedQuestions);

  // Group by genre
  const genreGroups = new Map<TextGenre, Question[]>();
  enrichedQuestions.forEach((q) => {
    const genre = q.genre || 'other';
    if (!genreGroups.has(genre)) {
      genreGroups.set(genre, []);
    }
    genreGroups.get(genre)!.push(q);
  });

  // Calculate how many unique passages we need
  const minUniquePassages = Math.ceil(config.targetCount * (config.minUniquePassagePercent / 100));

  const selected: Question[] = [];
  const usedPassages = new Map<string, number>(); // passageId -> count
  const usedGenres = new Map<TextGenre, number>(); // genre -> count

  // Shuffle function
  const shuffle = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get available genres sorted by least used
  const getNextGenre = (): TextGenre | null => {
    const availableGenres = Array.from(genreGroups.keys()).filter((genre) => {
      const questions = genreGroups.get(genre) || [];
      return questions.some((q) => {
        const passageCount = usedPassages.get(q.passageId!) || 0;
        return passageCount < config.maxQuestionsPerPassage && !selected.includes(q);
      });
    });

    if (availableGenres.length === 0) return null;

    // Sort by least used
    availableGenres.sort((a, b) => {
      const countA = usedGenres.get(a) || 0;
      const countB = usedGenres.get(b) || 0;
      return countA - countB;
    });

    return availableGenres[0];
  };

  // Select questions
  let attempts = 0;
  const maxAttempts = config.targetCount * 10;

  while (selected.length < config.targetCount && attempts < maxAttempts) {
    attempts++;

    // Prioritize genre diversity
    const targetGenre = config.ensureGenreDiversity ? getNextGenre() : null;

    // Get candidates
    let candidates = enrichedQuestions.filter((q) => {
      if (selected.includes(q)) return false;

      const passageCount = usedPassages.get(q.passageId!) || 0;
      if (passageCount >= config.maxQuestionsPerPassage) return false;

      // Check if we need more unique passages
      const currentUniquePassages = usedPassages.size;
      if (currentUniquePassages < minUniquePassages && passageCount > 0) {
        // Prefer new passages until we have enough unique ones
        return false;
      }

      if (targetGenre && q.genre !== targetGenre) return false;

      return true;
    });

    // If no candidates with current constraints, relax genre constraint
    if (candidates.length === 0 && targetGenre) {
      candidates = enrichedQuestions.filter((q) => {
        if (selected.includes(q)) return false;
        const passageCount = usedPassages.get(q.passageId!) || 0;
        return passageCount < config.maxQuestionsPerPassage;
      });
    }

    if (candidates.length === 0) break;

    // Apply difficulty distribution if specified
    if (config.difficultyDistribution) {
      const currentCounts = {
        easy: selected.filter((q) => q.difficulty === 'easy').length,
        medium: selected.filter((q) => q.difficulty === 'medium').length,
        hard: selected.filter((q) => q.difficulty === 'hard').length,
      };

      const targetCounts = {
        easy: Math.round(config.targetCount * (config.difficultyDistribution.easy / 100)),
        medium: Math.round(config.targetCount * (config.difficultyDistribution.medium / 100)),
        hard: Math.round(config.targetCount * (config.difficultyDistribution.hard / 100)),
      };

      // Find which difficulty we need most
      const needsMost = (['easy', 'medium', 'hard'] as const)
        .filter((d) => currentCounts[d] < targetCounts[d])
        .sort((a, b) => (targetCounts[b] - currentCounts[b]) - (targetCounts[a] - currentCounts[a]))[0];

      if (needsMost) {
        const filtered = candidates.filter((q) => q.difficulty === needsMost);
        if (filtered.length > 0) {
          candidates = filtered;
        }
      }
    }

    // Randomly select from candidates
    const shuffled = shuffle(candidates);
    const question = shuffled[0];

    if (question) {
      selected.push(question);

      const passageId = question.passageId!;
      usedPassages.set(passageId, (usedPassages.get(passageId) || 0) + 1);

      const genre = question.genre || 'other';
      usedGenres.set(genre, (usedGenres.get(genre) || 0) + 1);
    }
  }

  // Shuffle final selection
  return shuffle(selected);
}

/**
 * Get statistics about question selection
 */
export function getSelectionStats(questions: Question[]): {
  totalQuestions: number;
  uniquePassages: number;
  passageDiversityPercent: number;
  genreDistribution: Record<TextGenre, number>;
  difficultyDistribution: Record<string, number>;
} {
  const passageIds = new Set(questions.map((q) => q.passageId || hashPassage(q.passage)));

  const genreDistribution = {} as Record<TextGenre, number>;
  const difficultyDistribution = { easy: 0, medium: 0, hard: 0 };

  questions.forEach((q) => {
    const genre = q.genre || detectGenre(q.passage, q.passageSource);
    genreDistribution[genre] = (genreDistribution[genre] || 0) + 1;
    difficultyDistribution[q.difficulty]++;
  });

  return {
    totalQuestions: questions.length,
    uniquePassages: passageIds.size,
    passageDiversityPercent: questions.length > 0
      ? Math.round((passageIds.size / questions.length) * 100)
      : 0,
    genreDistribution,
    difficultyDistribution,
  };
}
