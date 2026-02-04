export type QuestionType =
  // Information and Ideas
  | 'central-ideas'
  | 'inferences'
  | 'command-of-evidence'
  // Craft and Structure
  | 'words-in-context'
  | 'text-structure-purpose'
  | 'cross-text-connections'
  // Expression of Ideas
  | 'rhetorical-synthesis'
  | 'transitions'
  // Standard English Conventions
  | 'boundaries'
  | 'form-structure-sense';

export type AnswerId = 'A' | 'B' | 'C' | 'D';

export interface AnswerChoice {
  id: AnswerId;
  text: string;
}

export interface DistractorAnalysis {
  A: string;
  B: string;
  C: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  passage: string;
  passageSource?: string;
  questionText: string;
  choices: AnswerChoice[];
  correctAnswer: AnswerId;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  distractorAnalysis?: DistractorAnalysis;
  createdAt: Date;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  // Information and Ideas
  'central-ideas': 'Central Ideas',
  'inferences': 'Inferences',
  'command-of-evidence': 'Evidence',
  // Craft and Structure
  'words-in-context': 'Words in Context',
  'text-structure-purpose': 'Text Structure',
  'cross-text-connections': 'Cross-Text',
  // Expression of Ideas
  'rhetorical-synthesis': 'Rhetorical Synthesis',
  'transitions': 'Transitions',
  // Standard English Conventions
  'boundaries': 'Boundaries',
  'form-structure-sense': 'Form & Sense',
};

export const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  // Information and Ideas
  'central-ideas': 'Identify main ideas and key supporting details',
  'inferences': 'Draw logical conclusions from the text',
  'command-of-evidence': 'Select evidence that supports a claim',
  // Craft and Structure
  'words-in-context': 'Determine meaning of words/phrases in context',
  'text-structure-purpose': 'Analyze text structure and author\'s purpose',
  'cross-text-connections': 'Compare and connect ideas across two texts',
  // Expression of Ideas
  'rhetorical-synthesis': 'Combine information from notes effectively',
  'transitions': 'Select appropriate transition words',
  // Standard English Conventions
  'boundaries': 'Apply punctuation rules (commas, semicolons, colons)',
  'form-structure-sense': 'Fix subject-verb agreement, tense, pronouns',
};

// Group question types by SAT domain for UI organization (official SAT order)
export const QUESTION_TYPE_DOMAINS: Record<string, { label: string; types: QuestionType[] }> = {
  'information-ideas': {
    label: 'Information and Ideas',
    types: ['central-ideas', 'inferences', 'command-of-evidence'],
  },
  'craft-structure': {
    label: 'Craft and Structure',
    types: ['words-in-context', 'text-structure-purpose', 'cross-text-connections'],
  },
  'expression': {
    label: 'Expression of Ideas',
    types: ['rhetorical-synthesis', 'transitions'],
  },
  'conventions': {
    label: 'Standard English Conventions',
    types: ['boundaries', 'form-structure-sense'],
  },
};
