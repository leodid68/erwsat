import { Passage } from '@/types/quiz';

// Configuration pour différents modes de découpage
export type SplitMode = 'sat' | 'medium' | 'full';

interface SplitConfig {
  minWords: number;
  maxWords: number;
}

const SPLIT_CONFIGS: Record<SplitMode, SplitConfig> = {
  sat: { minWords: 25, maxWords: 150 },      // Format SAT standard (court)
  medium: { minWords: 100, maxWords: 400 },  // Passages moyens (plus de contexte)
  full: { minWords: 50, maxWords: 2000 },    // Texte quasi-complet (max contexte)
};

// Valeurs par défaut - maintenant on utilise "medium" pour garder plus de contexte
const DEFAULT_MODE: SplitMode = 'medium';

/**
 * Split text into passages based on the selected mode
 * @param text - The text to split
 * @param mode - 'sat' (25-150 words), 'medium' (100-400 words), or 'full' (50-2000 words)
 */
export function splitIntoPassages(text: string, mode: SplitMode = DEFAULT_MODE): Passage[] {
  const config = SPLIT_CONFIGS[mode];
  const MIN_PASSAGE_WORDS = config.minWords;
  const MAX_PASSAGE_WORDS = config.maxWords;

  // Clean the text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // For 'full' mode, try to keep entire document as one passage if possible
  if (mode === 'full') {
    const totalWords = countWords(cleanedText);
    if (totalWords <= MAX_PASSAGE_WORDS && totalWords >= MIN_PASSAGE_WORDS) {
      return [createPassage(cleanedText)];
    }
  }

  // First, try to split by paragraphs
  const paragraphs = cleanedText.split(/\n\n+/).filter((p) => p.trim().length > 0);

  const passages: Passage[] = [];
  let currentPassage = '';
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = countWords(paragraph);

    // If paragraph alone is within range, use it as a passage
    if (
      paragraphWords >= MIN_PASSAGE_WORDS &&
      paragraphWords <= MAX_PASSAGE_WORDS
    ) {
      // Save any accumulated content first
      if (currentWordCount >= MIN_PASSAGE_WORDS) {
        passages.push(createPassage(currentPassage.trim()));
        currentPassage = '';
        currentWordCount = 0;
      }
      passages.push(createPassage(paragraph.trim()));
      continue;
    }

    // If paragraph is too long, split it by sentences
    if (paragraphWords > MAX_PASSAGE_WORDS) {
      // Save any accumulated content first
      if (currentWordCount >= MIN_PASSAGE_WORDS) {
        passages.push(createPassage(currentPassage.trim()));
        currentPassage = '';
        currentWordCount = 0;
      }

      const sentencePassages = splitBySentences(paragraph, MIN_PASSAGE_WORDS, MAX_PASSAGE_WORDS);
      passages.push(...sentencePassages);
      continue;
    }

    // Paragraph is too short, try to combine with others
    const combinedWordCount = currentWordCount + paragraphWords;

    if (combinedWordCount <= MAX_PASSAGE_WORDS) {
      // Add to current passage
      currentPassage += (currentPassage ? '\n\n' : '') + paragraph;
      currentWordCount = combinedWordCount;
    } else {
      // Save current passage and start new one
      if (currentWordCount >= MIN_PASSAGE_WORDS) {
        passages.push(createPassage(currentPassage.trim()));
      }
      currentPassage = paragraph;
      currentWordCount = paragraphWords;
    }
  }

  // Don't forget the last passage
  if (currentWordCount >= MIN_PASSAGE_WORDS) {
    passages.push(createPassage(currentPassage.trim()));
  }

  // If no passages meet the minimum, include whatever we have
  if (passages.length === 0 && cleanedText.length > 0) {
    passages.push(createPassage(cleanedText));
  }

  return passages;
}

/**
 * Split a long paragraph by sentences to create passages
 */
function splitBySentences(paragraph: string, minWords: number, maxWords: number): Passage[] {
  const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
  const passages: Passage[] = [];
  let currentPassage = '';
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);

    // If a single sentence is longer than max, we need to include it anyway
    if (sentenceWords > maxWords) {
      if (currentWordCount >= minWords) {
        passages.push(createPassage(currentPassage.trim()));
      }
      passages.push(createPassage(sentence.trim()));
      currentPassage = '';
      currentWordCount = 0;
      continue;
    }

    const combinedWordCount = currentWordCount + sentenceWords;

    if (combinedWordCount <= maxWords) {
      currentPassage += sentence;
      currentWordCount = combinedWordCount;
    } else {
      if (currentWordCount >= minWords) {
        passages.push(createPassage(currentPassage.trim()));
      }
      currentPassage = sentence;
      currentWordCount = sentenceWords;
    }
  }

  if (currentWordCount >= minWords) {
    passages.push(createPassage(currentPassage.trim()));
  }

  return passages;
}

/**
 * Create a Passage object from text
 */
function createPassage(text: string): Passage {
  return {
    id: crypto.randomUUID(),
    text,
    wordCount: countWords(text),
    selected: true,
  };
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Estimate reading time in seconds
 */
export function estimateReadingTime(text: string): number {
  const words = countWords(text);
  // Average reading speed: ~200 words per minute
  return Math.ceil((words / 200) * 60);
}
