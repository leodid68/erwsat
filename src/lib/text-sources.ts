/**
 * Text sources: Project Gutenberg + Wikipedia + The Guardian
 */

export interface TextChunk {
  id: string;
  name: string;
  text: string;
  wordCount: number;
}

export interface GutenbergBook {
  id: number;
  title: string;
  authors: string[];
  subjects: string[];
  languages: string[];
}

export interface GutenbergResult {
  book: GutenbergBook;
  chunks: TextChunk[];
}

export interface WikipediaResult {
  title: string;
  extract: string;
  chunks: TextChunk[];
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Count complete sentences (ending with . ! ?)
 */
function countSentences(text: string): number {
  const matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 0;
}

/**
 * Calculate ratio of numbers/symbols vs letters
 */
function getJunkRatio(text: string): number {
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const numbers = (text.match(/[0-9]/g) || []).length;
  const symbols = (text.match(/[^a-zA-Z0-9\s.,!?'"()-]/g) || []).length;
  const total = letters + numbers + symbols;
  if (total === 0) return 1;
  return (numbers + symbols) / total;
}

/**
 * SAT passage length: 125-200 words (real SAT medium difficulty range)
 */
const SAT_MIN_WORDS = 125;
const SAT_MAX_WORDS = 200;
const SAT_TARGET_WORDS = 160;

/**
 * Junk keywords that indicate bad content
 */
const JUNK_PATTERNS = [
  /^figure\s*\d/i,
  /^table\s*\d/i,
  /^references$/i,
  /^bibliography$/i,
  /^acknowledgments?$/i,
  /^appendix/i,
  /https?:\/\//i,
  /©|\(c\)/i,
  /^\[\d+\]/,  // Citation markers
  /^fig\.\s*\d/i,
  /^source:/i,
  /^image:/i,
  /^photo:/i,
  /doi\.org/i,
  /isbn/i,
  /pp\.\s*\d+/i,  // Page numbers
  /\[Illustration/i,  // Gutenberg illustrations
  /^INTRODUCTION$/im,
  /^PREFACE$/im,
  /^CONTENTS$/im,
  /^CHAPTER\s+[IVXLCDM]+$/im,  // Just chapter headers alone
  /Project Gutenberg/i,
  /eBook/i,
  /www\./i,
];

/**
 * Check dialogue ratio (too much dialogue = not good for comprehension)
 */
function getDialogueRatio(text: string): number {
  const quotes = (text.match(/[""][^""]*[""]/g) || []);
  const dialogueChars = quotes.reduce((sum, q) => sum + q.length, 0);
  return dialogueChars / text.length;
}

/**
 * Check if passage starts with a complete sentence (capital letter)
 */
function startsWithCompleteSentence(text: string): boolean {
  const trimmed = text.trim();
  // Should start with capital letter or opening quote + capital
  return /^[A-Z""][A-Za-z]/.test(trimmed);
}

/**
 * Check if passage ends with complete sentence
 */
function endsWithCompleteSentence(text: string): boolean {
  const trimmed = text.trim();
  // Should end with period, question mark, or exclamation (possibly after quote)
  return /[.!?][""]?$/.test(trimmed);
}

/**
 * Check if text has narrative flow (not just a list or disconnected sentences)
 */
function hasNarrativeFlow(text: string): boolean {
  // Look for narrative connectors
  const connectors = [
    /\bhowever\b/i, /\btherefore\b/i, /\bmoreover\b/i, /\bfurthermore\b/i,
    /\bconsequently\b/i, /\bas a result\b/i, /\bin addition\b/i,
    /\bfor example\b/i, /\bfor instance\b/i, /\bin fact\b/i,
    /\bon the other hand\b/i, /\bnevertheless\b/i, /\bmeanwhile\b/i,
    /\bafter\b/i, /\bbefore\b/i, /\bwhen\b/i, /\bwhile\b/i, /\balthough\b/i,
    /\bbecause\b/i, /\bsince\b/i, /\bthus\b/i, /\bhence\b/i,
    /\bhe\b/i, /\bshe\b/i, /\bthey\b/i, /\bit\b/i, /\bthis\b/i, /\bthat\b/i,
  ];

  let connectorCount = 0;
  for (const pattern of connectors) {
    if (pattern.test(text)) connectorCount++;
  }

  // Should have at least 3 different connectors for narrative flow
  return connectorCount >= 3;
}

/**
 * Check if text is quality content suitable for SAT questions
 */
function isQualityContent(text: string): boolean {
  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  const junkRatio = getJunkRatio(text);

  // Too short (below SAT minimum)
  if (wordCount < SAT_MIN_WORDS) return false;

  // Not enough sentences (need prose, not lists)
  if (sentenceCount < 3) return false;

  // Too many numbers/symbols (likely a table or data)
  if (junkRatio > 0.25) return false;

  // Too much dialogue (> 40% is dialogue-heavy)
  if (getDialogueRatio(text) > 0.4) return false;

  // Should start and end with complete sentences
  if (!startsWithCompleteSentence(text)) return false;
  if (!endsWithCompleteSentence(text)) return false;

  // Contains junk patterns
  const firstLine = text.split('\n')[0].trim();
  for (const pattern of JUNK_PATTERNS) {
    if (pattern.test(firstLine) || pattern.test(text.slice(0, 200))) {
      return false;
    }
  }

  // Average word length too short (likely gibberish or abbreviations)
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  if (avgWordLength < 3) return false;

  // Should have some narrative flow
  if (!hasNarrativeFlow(text)) return false;

  return true;
}

/**
 * Clean text for SAT-style reading
 */
function cleanForSAT(text: string): string {
  return text
    // Remove Gutenberg illustration markers
    .replace(/\[Illustration[^\]]*\]/gi, '')
    // Remove copyright notices
    .replace(/\[_Copyright[^\]]*\]/gi, '')
    // Remove chapter headings
    .replace(/^CHAPTER\s+[IVXLCDM\d]+\.?\s*/gim, '')
    // Remove citation markers like [1], [2,3]
    .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
    // Remove bracketed editor notes
    .replace(/\[[^\]]{0,50}\]/g, '')
    // Remove footnote markers
    .replace(/\*+/g, '')
    // Remove superscript-style markers like M^{r.}
    .replace(/\^?\{[^}]*\}/g, '')
    // Normalize quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Remove underscores used for emphasis
    .replace(/_([^_]+)_/g, '$1')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Split text into SAT-length chunks with quality filtering
 */
function splitIntoChunks(text: string, targetWords: number = SAT_TARGET_WORDS): TextChunk[] {
  const chunks: TextChunk[] = [];
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  let currentChunk = '';
  let currentWordCount = 0;
  let chunkIndex = 0;

  const saveChunk = () => {
    const cleanedText = cleanForSAT(currentChunk.trim());
    const wordCount = countWords(cleanedText);

    if (wordCount >= SAT_MIN_WORDS && isQualityContent(cleanedText)) {
      chunks.push({
        id: `chunk-${chunkIndex++}`,
        name: `Passage ${chunkIndex}`,
        text: cleanedText,
        wordCount: wordCount,
      });
    }
    currentChunk = '';
    currentWordCount = 0;
  };

  for (const para of paragraphs) {
    const cleanPara = cleanForSAT(para);
    const paraWords = countWords(cleanPara);

    // Skip very short or junk paragraphs
    if (paraWords < 20) continue;
    if (getJunkRatio(cleanPara) > 0.3) continue;

    // If single paragraph is very long, split by sentences
    if (paraWords > SAT_MAX_WORDS) {
      if (currentWordCount >= SAT_MIN_WORDS) {
        saveChunk();
      }

      const sentences = cleanPara.match(/[^.!?]+[.!?]+/g) || [cleanPara];
      for (const sentence of sentences) {
        const sentenceWords = countWords(sentence);
        if (currentWordCount + sentenceWords > SAT_MAX_WORDS && currentWordCount >= SAT_MIN_WORDS) {
          saveChunk();
          currentChunk = sentence;
          currentWordCount = sentenceWords;
        } else {
          currentChunk += ' ' + sentence;
          currentWordCount += sentenceWords;
        }
      }
    } else if (currentWordCount + paraWords > SAT_MAX_WORDS && currentWordCount >= SAT_MIN_WORDS) {
      saveChunk();
      currentChunk = cleanPara;
      currentWordCount = paraWords;
    } else {
      currentChunk += '\n\n' + cleanPara;
      currentWordCount += paraWords;
    }
  }

  // Don't forget the last chunk
  if (currentWordCount >= SAT_MIN_WORDS) {
    saveChunk();
  }

  return chunks;
}

/**
 * Clean text from Gutenberg (remove headers, footers, front matter, etc.)
 */
function cleanGutenbergText(text: string): string {
  // Remove Gutenberg header
  const startMarkers = [
    '*** START OF THE PROJECT GUTENBERG',
    '*** START OF THIS PROJECT GUTENBERG',
    '*END*THE SMALL PRINT',
  ];

  let cleanText = text;
  for (const marker of startMarkers) {
    const idx = cleanText.indexOf(marker);
    if (idx !== -1) {
      const endOfLine = cleanText.indexOf('\n', idx);
      cleanText = cleanText.slice(endOfLine + 1);
      break;
    }
  }

  // Remove Gutenberg footer
  const endMarkers = [
    '*** END OF THE PROJECT GUTENBERG',
    '*** END OF THIS PROJECT GUTENBERG',
    'End of the Project Gutenberg',
    'End of Project Gutenberg',
  ];

  for (const marker of endMarkers) {
    const idx = cleanText.indexOf(marker);
    if (idx !== -1) {
      cleanText = cleanText.slice(0, idx);
      break;
    }
  }

  // Try to skip front matter (introduction, preface, contents) and find actual story
  // Look for "Chapter 1", "CHAPTER I", "Chapter One", "BOOK ONE", "Part One", etc.
  const storyStartPatterns = [
    /\n\s*CHAPTER\s+(?:ONE|1|I)[\.\s\n]/i,
    /\n\s*BOOK\s+(?:ONE|1|I)[\.\s\n]/i,
    /\n\s*PART\s+(?:ONE|1|I)[\.\s\n]/i,
    /\n\s*I\.\s*\n/,  // Roman numeral chapter
    /\n\s*1\.\s*\n/,  // Numeric chapter
  ];

  for (const pattern of storyStartPatterns) {
    const match = cleanText.match(pattern);
    if (match && match.index !== undefined) {
      // Found story start - keep a little before for context
      const startIdx = Math.max(0, match.index);
      cleanText = cleanText.slice(startIdx);
      break;
    }
  }

  // Clean up whitespace
  return cleanText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

/**
 * Search Project Gutenberg books
 */
export async function searchGutenberg(query: string): Promise<GutenbergBook[]> {
  const url = `https://gutendex.com/books/?search=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to search Gutenberg');
  }

  const data = await response.json();

  return data.results.slice(0, 10).map((book: any) => ({
    id: book.id,
    title: book.title,
    authors: book.authors?.map((a: any) => a.name) || [],
    subjects: book.subjects || [],
    languages: book.languages || [],
  }));
}

/**
 * Fetch book text from Project Gutenberg (raw text for Sonnet processing)
 */
export async function fetchGutenbergBookRaw(bookId: number): Promise<{ book: GutenbergBook; fullText: string }> {
  // First get book metadata
  const metaUrl = `https://gutendex.com/books/${bookId}`;
  const metaResponse = await fetch(metaUrl);
  if (!metaResponse.ok) {
    throw new Error('Book not found');
  }

  const meta = await metaResponse.json();

  // Find plain text URL
  const formats = meta.formats || {};
  const textUrl = formats['text/plain; charset=utf-8']
    || formats['text/plain; charset=us-ascii']
    || formats['text/plain']
    || null;

  if (!textUrl) {
    throw new Error('No plain text version available for this book');
  }

  // Fetch the text
  const textResponse = await fetch(textUrl);
  if (!textResponse.ok) {
    throw new Error('Failed to download book text');
  }

  let text = await textResponse.text();
  text = cleanGutenbergText(text);

  // Only take first ~15000 words (about 50 pages) to keep it manageable
  const words = text.split(/\s+/);
  if (words.length > 15000) {
    text = words.slice(0, 15000).join(' ') + '...';
  }

  return {
    book: {
      id: bookId,
      title: meta.title,
      authors: meta.authors?.map((a: any) => a.name) || [],
      subjects: meta.subjects || [],
      languages: meta.languages || [],
    },
    fullText: text,
  };
}

/**
 * Fetch book text from Project Gutenberg (with basic chunking)
 */
export async function fetchGutenbergBook(bookId: number): Promise<GutenbergResult> {
  const { book, fullText } = await fetchGutenbergBookRaw(bookId);
  const chunks = splitIntoChunks(fullText, 300);

  return {
    book,
    chunks,
  };
}

/**
 * Search Wikipedia articles
 */
export async function searchWikipedia(query: string): Promise<Array<{ title: string; snippet: string }>> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=10`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to search Wikipedia');
  }

  const data = await response.json();

  return data.query.search.map((result: any) => ({
    title: result.title,
    snippet: result.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
  }));
}

/**
 * Fetch Wikipedia article content (raw text for Sonnet processing)
 */
export async function fetchWikipediaArticleRaw(title: string): Promise<{ title: string; fullText: string }> {
  // Get article extract (plain text)
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&explaintext=true&format=json&origin=*`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch Wikipedia article');
  }

  const data = await response.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];

  if (pageId === '-1') {
    throw new Error('Article not found');
  }

  const page = pages[pageId];
  let extract = page.extract || '';

  // Remove "== References ==" and everything after
  const refIdx = extract.indexOf('== References ==');
  if (refIdx !== -1) {
    extract = extract.slice(0, refIdx);
  }

  // Remove "== See also ==" and everything after
  const seeIdx = extract.indexOf('== See also ==');
  if (seeIdx !== -1) {
    extract = extract.slice(0, seeIdx);
  }

  // Remove section headers for cleaner text
  extract = extract.replace(/^==+\s*[^=]+\s*==+$/gm, '\n');
  extract = extract.replace(/\n{3,}/g, '\n\n').trim();

  // Limit to ~10000 words
  const words = extract.split(/\s+/);
  if (words.length > 10000) {
    extract = words.slice(0, 10000).join(' ') + '...';
  }

  return {
    title: page.title,
    fullText: extract,
  };
}

/**
 * Fetch Wikipedia article content (with basic chunking)
 */
export async function fetchWikipediaArticle(title: string): Promise<WikipediaResult> {
  const { title: articleTitle, fullText } = await fetchWikipediaArticleRaw(title);
  const chunks = splitIntoChunks(fullText, 300);

  return {
    title: articleTitle,
    extract: fullText,
    chunks,
  };
}

// ============ THE GUARDIAN ============

export interface GuardianArticle {
  id: string;
  title: string;
  section: string;
  date: string;
  webUrl: string;
}

export interface GuardianResult {
  article: GuardianArticle;
  chunks: TextChunk[];
}

/**
 * Search The Guardian articles
 * Requires GUARDIAN_API_KEY environment variable
 */
export async function searchGuardian(
  query: string,
  apiKey: string
): Promise<GuardianArticle[]> {
  const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${apiKey}&page-size=10&show-fields=headline`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid Guardian API key');
    }
    throw new Error('Failed to search The Guardian');
  }

  const data = await response.json();

  if (data.response.status !== 'ok') {
    throw new Error('Guardian API error');
  }

  return data.response.results.map((article: any) => ({
    id: article.id,
    title: article.webTitle,
    section: article.sectionName,
    date: article.webPublicationDate?.split('T')[0] || '',
    webUrl: article.webUrl,
  }));
}

/**
 * Fetch Guardian article content (raw text for Sonnet processing)
 */
export async function fetchGuardianArticleRaw(
  articleId: string,
  apiKey: string
): Promise<{ article: GuardianArticle; fullText: string }> {
  const url = `https://content.guardianapis.com/${articleId}?api-key=${apiKey}&show-fields=bodyText,headline`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }

  const data = await response.json();

  if (data.response.status !== 'ok') {
    throw new Error('Article not found');
  }

  const content = data.response.content;
  let bodyText = content.fields?.bodyText || '';

  // Clean up the text
  bodyText = bodyText
    .replace(/<[^>]*>/g, '') // Remove any HTML tags
    .replace(/\s+/g, ' ')
    .trim();

  return {
    article: {
      id: content.id,
      title: content.webTitle,
      section: content.sectionName,
      date: content.webPublicationDate?.split('T')[0] || '',
      webUrl: content.webUrl,
    },
    fullText: bodyText,
  };
}

/**
 * Fetch Guardian article content (with basic chunking)
 */
export async function fetchGuardianArticle(
  articleId: string,
  apiKey: string
): Promise<GuardianResult> {
  const { article, fullText } = await fetchGuardianArticleRaw(articleId, apiKey);

  // Split into paragraphs (Guardian text is usually one blob)
  // Try to split on sentence endings followed by capital letters
  const bodyText = fullText.replace(/\. ([A-Z])/g, '.\n\n$1');

  const chunks = splitIntoChunks(bodyText, 300);

  return {
    article,
    chunks,
  };
}
