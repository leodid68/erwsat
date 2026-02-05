/**
 * Official SAT Questions - Scraped from College Board
 * 2193 authentic questions with passages, answers, and rationales
 */

import officialQuestions from '@/data/official-sat-questions.json';

export interface OfficialSATQuestion {
  id: string;
  assessment: string;
  section: string;
  domain: string;
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  passage: string;
  questionText: string;
  choices: Array<{ id: string; text: string }>;
  correctAnswer: string;
  rationale: string;
}

// Domain mapping to match our app's naming
const DOMAIN_MAP: Record<string, string> = {
  'Information and Ideas': 'Information & Ideas',
  'Craft and Structure': 'Craft & Structure',
  'Standard English Conventions': 'Standard English Conventions',
  'Expression of Ideas': 'Expression of Ideas',
};

/**
 * Get all official SAT questions
 */
export function getAllOfficialQuestions(): OfficialSATQuestion[] {
  return officialQuestions as OfficialSATQuestion[];
}

/**
 * Get questions filtered by criteria
 */
export function getOfficialQuestions(filters?: {
  domain?: string;
  skill?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  limit?: number;
}): OfficialSATQuestion[] {
  let questions = getAllOfficialQuestions();

  if (filters?.domain) {
    questions = questions.filter(q =>
      q.domain === filters.domain || DOMAIN_MAP[q.domain] === filters.domain
    );
  }

  if (filters?.skill) {
    questions = questions.filter(q => q.skill === filters.skill);
  }

  if (filters?.difficulty) {
    questions = questions.filter(q => q.difficulty === filters.difficulty);
  }

  if (filters?.limit) {
    // Shuffle and take limit
    questions = shuffleArray(questions).slice(0, filters.limit);
  }

  return questions;
}

/**
 * Get random questions for placement test
 * Returns 27 questions per module with proper domain distribution
 */
export function getPlacementTestQuestions(): {
  module1: OfficialSATQuestion[];
  module2: OfficialSATQuestion[];
} {
  const allQuestions = getAllOfficialQuestions();

  // Separate by difficulty
  const easyMedium = allQuestions.filter(q => q.difficulty === 'easy' || q.difficulty === 'medium');
  const hardQuestions = allQuestions.filter(q => q.difficulty === 'hard');

  // Module 1: Easy/Medium questions (27)
  const module1 = selectWithDistribution(easyMedium, 27);

  // Module 2: Hard questions (27)
  const module2 = selectWithDistribution(hardQuestions, 27);

  return { module1, module2 };
}

/**
 * Select questions with SAT domain distribution
 * Craft & Structure ~28%, Info & Ideas ~26%, Conventions ~26%, Expression ~20%
 */
function selectWithDistribution(questions: OfficialSATQuestion[], total: number): OfficialSATQuestion[] {
  const distribution = {
    'Craft and Structure': Math.round(total * 0.28),
    'Information and Ideas': Math.round(total * 0.26),
    'Standard English Conventions': Math.round(total * 0.26),
    'Expression of Ideas': Math.round(total * 0.20),
  };

  // Adjust to hit exact total
  const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (sum !== total) {
    distribution['Craft and Structure'] += total - sum;
  }

  const selected: OfficialSATQuestion[] = [];

  for (const [domain, count] of Object.entries(distribution)) {
    const domainQuestions = questions.filter(q => q.domain === domain);
    const shuffled = shuffleArray(domainQuestions);
    selected.push(...shuffled.slice(0, count));
  }

  // If we don't have enough questions in some domains, fill from others
  if (selected.length < total) {
    const usedIds = new Set(selected.map(q => q.id));
    const remaining = questions.filter(q => !usedIds.has(q.id));
    const shuffled = shuffleArray(remaining);
    selected.push(...shuffled.slice(0, total - selected.length));
  }

  return shuffleArray(selected).slice(0, total);
}

/**
 * Get random questions for practice mode
 */
export function getPracticeQuestions(options: {
  count: number;
  domains?: string[];
  skills?: string[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}): OfficialSATQuestion[] {
  let questions = getAllOfficialQuestions();

  if (options.domains && options.domains.length > 0) {
    questions = questions.filter(q =>
      options.domains!.includes(q.domain) ||
      options.domains!.includes(DOMAIN_MAP[q.domain] || q.domain)
    );
  }

  if (options.skills && options.skills.length > 0) {
    questions = questions.filter(q => options.skills!.includes(q.skill));
  }

  if (options.difficulty && options.difficulty !== 'mixed') {
    questions = questions.filter(q => q.difficulty === options.difficulty);
  }

  return shuffleArray(questions).slice(0, options.count);
}

/**
 * Get all unique skills from official questions
 */
export function getAvailableSkills(): string[] {
  const skills = new Set(getAllOfficialQuestions().map(q => q.skill));
  return Array.from(skills).sort();
}

/**
 * Get question counts by domain
 */
export function getQuestionStats(): Record<string, { total: number; byDifficulty: Record<string, number> }> {
  const questions = getAllOfficialQuestions();
  const stats: Record<string, { total: number; byDifficulty: Record<string, number> }> = {};

  for (const q of questions) {
    if (!stats[q.domain]) {
      stats[q.domain] = { total: 0, byDifficulty: { easy: 0, medium: 0, hard: 0 } };
    }
    stats[q.domain].total++;
    stats[q.domain].byDifficulty[q.difficulty]++;
  }

  return stats;
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Convert official question format to app format
 */
export function convertToAppFormat(question: OfficialSATQuestion): {
  id: string;
  passage: string;
  passageSource: string;
  questionStem: string;
  choices: { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  domain: string;
  skill: string;
} {
  const choices: { A: string; B: string; C: string; D: string } = {
    A: '',
    B: '',
    C: '',
    D: '',
  };

  for (const choice of question.choices) {
    if (choice.id === 'A' || choice.id === 'B' || choice.id === 'C' || choice.id === 'D') {
      choices[choice.id] = choice.text;
    }
  }

  return {
    id: question.id,
    passage: question.passage,
    passageSource: 'Official SAT (College Board)',
    questionStem: question.questionText,
    choices,
    correctAnswer: question.correctAnswer as 'A' | 'B' | 'C' | 'D',
    explanation: question.rationale,
    domain: DOMAIN_MAP[question.domain] || question.domain,
    skill: question.skill,
  };
}
