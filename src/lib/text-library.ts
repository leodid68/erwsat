/**
 * Text Library - Random text selection by category
 */

export type TextCategory =
  | 'literature'    // Classic novels (Gutenberg)
  | 'poetry'        // Poems (Gutenberg)
  | 'drama'         // Plays (Gutenberg)
  | 'history'       // Historical articles (Wikipedia)
  | 'science'       // Science articles (Wikipedia + Guardian)
  | 'politics'      // Political news (Guardian)
  | 'culture'       // Culture/Arts (Guardian)
  | 'opinion';      // Opinion/Editorial (Guardian)

export interface TextSource {
  provider: 'gutenberg' | 'wikipedia' | 'guardian';
  query: string;
  category: TextCategory;
}

export interface LibraryItem {
  id: string;
  title: string;
  author?: string;
  category: TextCategory;
  provider: 'gutenberg' | 'wikipedia' | 'guardian';
  preview: string;
}

// Pre-defined search queries for each category
export const CATEGORY_SOURCES: Record<TextCategory, TextSource[]> = {
  literature: [
    { provider: 'gutenberg', query: 'Jane Austen', category: 'literature' },
    { provider: 'gutenberg', query: 'Charles Dickens', category: 'literature' },
    { provider: 'gutenberg', query: 'Mark Twain', category: 'literature' },
    { provider: 'gutenberg', query: 'Charlotte Bronte', category: 'literature' },
    { provider: 'gutenberg', query: 'Herman Melville', category: 'literature' },
    { provider: 'gutenberg', query: 'Nathaniel Hawthorne', category: 'literature' },
    { provider: 'gutenberg', query: 'Oscar Wilde', category: 'literature' },
    { provider: 'gutenberg', query: 'Virginia Woolf', category: 'literature' },
  ],
  poetry: [
    { provider: 'gutenberg', query: 'Emily Dickinson', category: 'poetry' },
    { provider: 'gutenberg', query: 'Walt Whitman', category: 'poetry' },
    { provider: 'gutenberg', query: 'William Wordsworth', category: 'poetry' },
    { provider: 'gutenberg', query: 'John Keats', category: 'poetry' },
    { provider: 'gutenberg', query: 'Percy Shelley', category: 'poetry' },
    { provider: 'gutenberg', query: 'Robert Frost poetry', category: 'poetry' },
  ],
  drama: [
    { provider: 'gutenberg', query: 'William Shakespeare', category: 'drama' },
    { provider: 'gutenberg', query: 'Oscar Wilde plays', category: 'drama' },
    { provider: 'gutenberg', query: 'George Bernard Shaw', category: 'drama' },
    { provider: 'gutenberg', query: 'Anton Chekhov', category: 'drama' },
  ],
  history: [
    { provider: 'wikipedia', query: 'American Revolution', category: 'history' },
    { provider: 'wikipedia', query: 'French Revolution', category: 'history' },
    { provider: 'wikipedia', query: 'Industrial Revolution', category: 'history' },
    { provider: 'wikipedia', query: 'Civil Rights Movement', category: 'history' },
    { provider: 'wikipedia', query: 'World War history', category: 'history' },
    { provider: 'wikipedia', query: 'Ancient Rome', category: 'history' },
    { provider: 'wikipedia', query: 'Renaissance', category: 'history' },
  ],
  science: [
    { provider: 'wikipedia', query: 'Climate change science', category: 'science' },
    { provider: 'wikipedia', query: 'Evolution biology', category: 'science' },
    { provider: 'wikipedia', query: 'Quantum physics', category: 'science' },
    { provider: 'wikipedia', query: 'Genetics DNA', category: 'science' },
    { provider: 'guardian', query: 'science discovery', category: 'science' },
    { provider: 'guardian', query: 'space exploration', category: 'science' },
  ],
  politics: [
    { provider: 'guardian', query: 'democracy government', category: 'politics' },
    { provider: 'guardian', query: 'international relations', category: 'politics' },
    { provider: 'guardian', query: 'policy reform', category: 'politics' },
    { provider: 'wikipedia', query: 'Political philosophy', category: 'politics' },
  ],
  culture: [
    { provider: 'guardian', query: 'art exhibition', category: 'culture' },
    { provider: 'guardian', query: 'literature review', category: 'culture' },
    { provider: 'guardian', query: 'film cinema', category: 'culture' },
    { provider: 'wikipedia', query: 'Modern art movement', category: 'culture' },
  ],
  opinion: [
    { provider: 'guardian', query: 'opinion editorial', category: 'opinion' },
    { provider: 'guardian', query: 'analysis commentary', category: 'opinion' },
  ],
};

export const CATEGORY_LABELS: Record<TextCategory, string> = {
  literature: 'Littérature classique',
  poetry: 'Poésie',
  drama: 'Théâtre',
  history: 'Histoire',
  science: 'Science',
  politics: 'Politique',
  culture: 'Culture & Arts',
  opinion: 'Opinion & Édito',
};

export const CATEGORY_ICONS: Record<TextCategory, string> = {
  literature: '📚',
  poetry: '🎭',
  drama: '🎪',
  history: '🏛️',
  science: '🔬',
  politics: '⚖️',
  culture: '🎨',
  opinion: '💬',
};

/**
 * Get random sources for a category
 */
export function getRandomSources(category: TextCategory, count: number = 3): TextSource[] {
  const sources = CATEGORY_SOURCES[category];
  const shuffled = [...sources].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get random sources from multiple categories (mix)
 */
export function getRandomMixSources(count: number = 5): TextSource[] {
  const allCategories = Object.keys(CATEGORY_SOURCES) as TextCategory[];
  const result: TextSource[] = [];

  // Shuffle categories
  const shuffledCategories = [...allCategories].sort(() => Math.random() - 0.5);

  let i = 0;
  while (result.length < count) {
    const category = shuffledCategories[i % shuffledCategories.length];
    const sources = CATEGORY_SOURCES[category];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];

    // Avoid duplicates
    if (!result.some(s => s.query === randomSource.query)) {
      result.push(randomSource);
    }
    i++;

    // Prevent infinite loop
    if (i > count * 3) break;
  }

  return result;
}
