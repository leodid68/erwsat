import { TextGenre } from './question';
import { TextCategory } from '@/lib/text-library';

/**
 * A saved passage in the user's library
 */
export interface SavedPassage {
  id: string;
  title: string;
  author?: string;
  source: string; // Original source (book title, article name, etc.)
  sourceUrl?: string;
  provider: 'gutenberg' | 'wikipedia' | 'guardian' | 'file';
  providerId?: string | number; // ID to re-fetch from source (Gutenberg book ID, Wikipedia title, Guardian article ID)
  category: TextCategory;
  genre: TextGenre;

  // The actual text content
  text: string;
  wordCount: number;

  // Metadata for reuse tracking
  timesUsed: number;
  questionsGenerated: string[]; // Question IDs generated from this passage
  lastUsedAt?: string; // ISO date
  savedAt: string; // ISO date

  // SAT relevance
  satRelevanceScore?: number; // 0-100, how suitable for SAT
  difficulty?: 'easy' | 'medium' | 'hard';

  // Tags for filtering
  tags: string[];
}

/**
 * Distribution matching official SAT (approximate)
 */
export const SAT_GENRE_DISTRIBUTION: Record<TextGenre, number> = {
  'literature': 25,      // Classic and contemporary literature
  'science': 25,         // Natural sciences
  'history': 20,         // Historical documents, founding documents
  'social-science': 20,  // Psychology, sociology, economics
  'humanities': 5,       // Art, philosophy
  'journalism': 3,       // Current events
  'poetry': 1,           // Occasionally appears
  'memoir': 1,           // Personal narratives
  'other': 0,
};

/**
 * Map TextCategory to TextGenre for consistency
 */
export const CATEGORY_TO_GENRE: Record<TextCategory, TextGenre> = {
  'literature': 'literature',
  'poetry': 'poetry',
  'drama': 'literature', // Drama counts as literature
  'history': 'history',
  'science': 'science',
  'politics': 'social-science',
  'culture': 'humanities',
  'opinion': 'journalism',
};

/**
 * Stats about the passage library
 */
export interface PassageLibraryStats {
  totalPassages: number;
  totalWordCount: number;
  byGenre: Record<TextGenre, number>;
  byProvider: Record<string, number>;
  averageUsage: number;
  unusedCount: number;
  potentialQuestions: number; // Estimated questions that could be generated
}

/**
 * Calculate potential questions from passage count
 * Assumes ~3 questions per unique passage on average
 */
export function estimatePotentialQuestions(passageCount: number): number {
  return Math.floor(passageCount * 3);
}

/**
 * Get library statistics
 */
export function getLibraryStats(passages: SavedPassage[]): PassageLibraryStats {
  const byGenre = {} as Record<TextGenre, number>;
  const byProvider = {} as Record<string, number>;
  let totalWordCount = 0;
  let totalUsage = 0;
  let unusedCount = 0;

  passages.forEach((p) => {
    // Count by genre
    byGenre[p.genre] = (byGenre[p.genre] || 0) + 1;

    // Count by provider
    byProvider[p.provider] = (byProvider[p.provider] || 0) + 1;

    // Sum word count
    totalWordCount += p.wordCount;

    // Track usage
    totalUsage += p.timesUsed;
    if (p.timesUsed === 0) unusedCount++;
  });

  return {
    totalPassages: passages.length,
    totalWordCount,
    byGenre,
    byProvider,
    averageUsage: passages.length > 0 ? totalUsage / passages.length : 0,
    unusedCount,
    potentialQuestions: estimatePotentialQuestions(passages.length),
  };
}

/**
 * Filter options for library browsing
 */
export interface PassageFilterOptions {
  genre?: TextGenre;
  provider?: string;
  minWordCount?: number;
  maxWordCount?: number;
  unused?: boolean;
  searchQuery?: string;
}

/**
 * Filter passages based on criteria
 */
export function filterPassages(
  passages: SavedPassage[],
  options: PassageFilterOptions
): SavedPassage[] {
  return passages.filter((p) => {
    if (options.genre && p.genre !== options.genre) return false;
    if (options.provider && p.provider !== options.provider) return false;
    if (options.minWordCount && p.wordCount < options.minWordCount) return false;
    if (options.maxWordCount && p.wordCount > options.maxWordCount) return false;
    if (options.unused && p.timesUsed > 0) return false;
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      const searchText = `${p.title} ${p.author || ''} ${p.text}`.toLowerCase();
      if (!searchText.includes(query)) return false;
    }
    return true;
  });
}

/**
 * Select passages with SAT-like distribution
 */
export function selectPassagesWithSATDistribution(
  passages: SavedPassage[],
  count: number
): SavedPassage[] {
  const selected: SavedPassage[] = [];
  const usedIds = new Set<string>();

  // Calculate target counts per genre
  const targetByGenre: Record<TextGenre, number> = {} as Record<TextGenre, number>;
  for (const [genre, percentage] of Object.entries(SAT_GENRE_DISTRIBUTION)) {
    targetByGenre[genre as TextGenre] = Math.round(count * (percentage / 100));
  }

  // First pass: try to fill each genre's quota
  for (const [genre, target] of Object.entries(targetByGenre)) {
    if (target === 0) continue;

    const genrePassages = passages.filter(
      (p) => p.genre === genre && !usedIds.has(p.id)
    );

    // Prioritize unused passages
    genrePassages.sort((a, b) => a.timesUsed - b.timesUsed);

    const toTake = Math.min(target, genrePassages.length);
    for (let i = 0; i < toTake; i++) {
      selected.push(genrePassages[i]);
      usedIds.add(genrePassages[i].id);
    }
  }

  // Second pass: fill remaining slots with any unused passages
  if (selected.length < count) {
    const remaining = passages
      .filter((p) => !usedIds.has(p.id))
      .sort((a, b) => a.timesUsed - b.timesUsed);

    while (selected.length < count && remaining.length > 0) {
      const passage = remaining.shift()!;
      selected.push(passage);
      usedIds.add(passage.id);
    }
  }

  // Shuffle for variety
  return selected.sort(() => Math.random() - 0.5);
}
