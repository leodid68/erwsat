import { AnswerId, QuestionType, TextGenre } from './question';

// Placement test specific types
export type PlacementDifficulty = 'Medium' | 'Hard';
export type PlacementDomain =
  | 'Craft & Structure'
  | 'Information & Ideas'
  | 'Standard English Conventions'
  | 'Expression of Ideas';

export type PlacementSkill =
  | 'Words in Context'
  | 'Text Structure and Purpose'
  | 'Central Ideas and Details'
  | 'Command of Evidence (Textual)'
  | 'Command of Evidence (Quantitative)'
  | 'Inferences'
  | 'Boundaries'
  | 'Form, Structure, and Sense'
  | 'Transitions'
  | 'Rhetorical Synthesis';

export interface PlacementQuestion {
  id: string;
  domain: PlacementDomain;
  skill: PlacementSkill;
  text_source: string;
  passage: string;
  question_stem: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: AnswerId;
  explanation: string;
}

export interface PlacementModule {
  module_id: 1 | 2;
  difficulty: PlacementDifficulty;
  time_limit_minutes: number;
  questions: PlacementQuestion[];
}

export interface PlacementTest {
  test_name: string;
  modules: [PlacementModule, PlacementModule]; // Always 2 modules
}

export interface PlacementAttempt {
  id: string;
  testName: string;
  moduleScores: {
    module1: {
      score: number;
      total: number;
      timeSpent: number;
      answers: Record<string, AnswerId>;
    };
    module2?: {
      score: number;
      total: number;
      timeSpent: number;
      answers: Record<string, AnswerId>;
    };
  };
  estimatedScore: number; // 200-800 scale
  completedAt: Date;
}

// Map placement skills to our internal QuestionType
export const SKILL_TO_QUESTION_TYPE: Record<PlacementSkill, QuestionType> = {
  'Words in Context': 'words-in-context',
  'Text Structure and Purpose': 'text-structure-purpose',
  'Central Ideas and Details': 'central-ideas',
  'Command of Evidence (Textual)': 'command-of-evidence',
  'Command of Evidence (Quantitative)': 'command-of-evidence',
  'Inferences': 'inferences',
  'Boundaries': 'boundaries',
  'Form, Structure, and Sense': 'form-structure-sense',
  'Transitions': 'transitions',
  'Rhetorical Synthesis': 'rhetorical-synthesis',
};

// Map placement domains to our internal domain structure
export const DOMAIN_TO_INTERNAL: Record<PlacementDomain, string> = {
  'Craft & Structure': 'craft-structure',
  'Information & Ideas': 'information-ideas',
  'Standard English Conventions': 'conventions',
  'Expression of Ideas': 'expression',
};

// Score calculation based on raw scores (simplified SAT scoring)
export function calculateEstimatedScore(
  module1Score: number,
  module1Total: number,
  module2Score?: number,
  module2Total?: number
): number {
  // Module 1 determines base range
  const module1Percent = module1Score / module1Total;

  if (module2Score === undefined || module2Total === undefined) {
    // Only Module 1 completed - estimate based on Module 1 alone
    return Math.round(200 + (module1Percent * 400));
  }

  const module2Percent = module2Score / module2Total;

  // Combined scoring
  // Module 1 (Medium): contributes to 400-600 range
  // Module 2 (Hard): contributes to 600-800 range

  // Base from Module 1
  let baseScore = 200 + (module1Percent * 400);

  // Bonus from Module 2 (Hard)
  // Good performance on hard module pushes score higher
  let hardBonus = module2Percent * 200;

  // Final score capped at 800
  const finalScore = Math.min(800, Math.round(baseScore + hardBonus));

  return finalScore;
}

// Determine if student should get hard or easy module 2 based on module 1 performance
export function determineModule2Difficulty(
  module1Score: number,
  module1Total: number
): 'Hard' | 'Easy' {
  const percentage = (module1Score / module1Total) * 100;
  // In real SAT: ~65% correct triggers hard module
  return percentage >= 60 ? 'Hard' : 'Easy';
}
