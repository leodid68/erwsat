import Anthropic from '@anthropic-ai/sdk';
import { QuestionType, Question, AnswerId } from '@/types/question';
import { getAnthropicApiKey, isAnthropicConfigured as checkConfigured } from './env-loader';

// Cache clients by API key to reuse connections
const clientCache = new Map<string, Anthropic>();

function getAnthropicClient(apiKey?: string): Anthropic {
  const key = apiKey || getAnthropicApiKey();
  if (!key) {
    throw new Error('No Anthropic API key provided');
  }

  // Return cached client if available
  if (clientCache.has(key)) {
    return clientCache.get(key)!;
  }

  // Create new client
  const client = new Anthropic({
    apiKey: key,
    baseURL: 'https://api.anthropic.com',
    timeout: 120000,
  });

  clientCache.set(key, client);
  return client;
}

const MODEL = 'claude-sonnet-4-5-20241022';

/**
 * Select best passages from text using Claude Sonnet
 * Returns passages that are suitable for SAT-style reading comprehension
 */
export async function selectPassagesWithSonnet(
  fullText: string,
  maxPassages: number = 5,
  apiKey?: string
): Promise<Array<{ text: string; reason: string }>> {
  const textToAnalyze = fullText.slice(0, 15000);

  const response = await getAnthropicClient(apiKey).messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: `You are an expert SAT reading comprehension passage selector. You analyze texts and extract the best passages for standardized test preparation. Always respond with valid JSON only.`,
    messages: [
      {
        role: 'user',
        content: `Select ${maxPassages} passages from this text for SAT reading comprehension practice.

CRITERIA FOR PROSE:
- 125-200 words each
- Self-contained, clear narrative flow
- Good for inference and vocabulary questions
- Avoid dialogue-heavy or list sections

SPECIAL RULES FOR POETRY:
- ALWAYS keep poems WHOLE if under 200 words - never excerpt a poem
- For longer poems, select complete stanzas (never break mid-stanza)
- Poetry can be shorter than prose (even 50-100 words is acceptable for a complete short poem)
- Include the poem's title if present
- Preserve line breaks and stanza structure exactly

DETECTION: If text contains verse structure (short lines, stanzas, rhyme patterns, or is explicitly labeled as poetry), apply poetry rules.

<source_text>
${textToAnalyze}
</source_text>

Return a JSON array only, no markdown or explanation:
[{"text": "passage text (preserve line breaks with \\n)", "reason": "one sentence explanation"}]`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = content.text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    // Try to find JSON array in response
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Sonnet response:', content.text.slice(0, 500));
    throw new Error(`Failed to parse passage selection response: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

/**
 * Generate SAT-style question using Claude Sonnet
 * Uses the same detailed prompts as the fine-tuned model
 */
export async function generateQuestionWithSonnet(
  passage: string,
  questionType: QuestionType,
  difficulty: 'easy' | 'medium' | 'hard',
  apiKey?: string
): Promise<Omit<Question, 'id' | 'passageSource' | 'createdAt'>> {
  // Import the same prompts used by fine-tuned model
  const { buildQuestionPrompt } = await import('./prompts/sat-question-prompts');

  const prompt = buildQuestionPrompt(passage, questionType, difficulty);

  const response = await getAnthropicClient(apiKey).messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    let jsonStr = content.text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    return JSON.parse(jsonStr);
  } catch {
    throw new Error('Failed to parse question generation response');
  }
}

/**
 * Check if Anthropic API is configured
 */
export function isAnthropicConfigured(): boolean {
  return checkConfigured();
}

/**
 * Generate a complete placement test question with unique passage
 * Uses the same methodology as official SAT
 */
export interface PlacementQuestionSpec {
  domain: 'Craft & Structure' | 'Information & Ideas' | 'Standard English Conventions' | 'Expression of Ideas';
  skill: string;
  difficulty: 'Medium' | 'Hard';
  textSource?: string; // Optional: preferred author/source style
}

export interface GeneratedPlacementQuestion {
  passage: string;
  passageSource: string;
  questionStem: string;
  choices: { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  domain: string;
  skill: string;
}

const TEXT_SOURCES = {
  literature: ['Charles Dickens', 'Jane Austen', 'Nathaniel Hawthorne', 'Charlotte Brontë', 'Henry James', 'George Eliot'],
  science: ['The Guardian Science', 'Scientific American', 'Nature News', 'New Scientist'],
  history: ['The Federalist Papers', 'Abraham Lincoln', 'Frederick Douglass', 'Declaration of Independence'],
  socialScience: ['The Atlantic', 'The Economist', 'Psychology Today'],
};

export async function generatePlacementQuestionWithPassage(
  spec: PlacementQuestionSpec,
  questionIndex: number,
  apiKey?: string
): Promise<GeneratedPlacementQuestion> {
  // Select appropriate text source based on domain
  let sourceCandidates: string[];
  if (spec.domain === 'Craft & Structure' || spec.domain === 'Information & Ideas') {
    // Mix of literature and informational texts
    sourceCandidates = questionIndex % 2 === 0
      ? TEXT_SOURCES.literature
      : [...TEXT_SOURCES.science, ...TEXT_SOURCES.socialScience];
  } else {
    // Standard English Conventions and Expression of Ideas use more academic texts
    sourceCandidates = [...TEXT_SOURCES.science, ...TEXT_SOURCES.socialScience, ...TEXT_SOURCES.history];
  }

  const selectedSource = spec.textSource || sourceCandidates[questionIndex % sourceCandidates.length];

  const difficultyGuidelines = spec.difficulty === 'Hard'
    ? `
- Use complex Victorian-era syntax OR dense scientific argumentation
- Include subordinate clauses, inverted structures, and long appositions
- For distractors: use "True but Irrelevant" pattern (statement true in passage but doesn't answer question)
- For distractors: use "Scope Error" pattern (too narrow or too broad)
- Word masking for Words in Context: choose metaphorical verbs or tone-setting adjectives`
    : `
- Use clear but sophisticated prose
- Standard sentence structures with some complexity
- Distractors should be clearly wrong (contresens, hors-sujet évident)
- Accessible vocabulary with some challenging terms`;

  const prompt = `You are an expert SAT test architect. Generate a COMPLETE, UNIQUE passage and question for the Digital SAT Reading & Writing section.

SPECIFICATIONS:
- Domain: ${spec.domain}
- Skill: ${spec.skill}
- Difficulty: ${spec.difficulty}
- Text Style: In the manner of ${selectedSource}

PASSAGE REQUIREMENTS:
- 80-150 words
- Original text (do NOT copy existing works, but mimic the style)
- Self-contained, can be understood without external context
- Rich enough to support the question type
${difficultyGuidelines}

QUESTION REQUIREMENTS FOR ${spec.skill}:
${spec.skill === 'Words in Context' ? `
- Mask a word in the MIDDLE of the passage with a blank ______
- The masked word must be crucial for meaning (metaphorical verb, tone adjective)
- DO NOT add artificial conclusion sentences
- All 4 choices must be grammatically valid but only one fits the context precisely` : ''}
${spec.skill === 'Text Structure and Purpose' ? `
- Ask about the function of a specific sentence or the overall structure
- Options should describe different rhetorical purposes` : ''}
${spec.skill === 'Central Ideas and Details' ? `
- Ask about main ideas or specific supporting details
- Options should include plausible but incorrect interpretations` : ''}
${spec.skill === 'Command of Evidence (Textual)' || spec.skill === 'Command of Evidence (Quantitative)' ? `
- Ask which evidence best supports a claim, or which finding would strengthen/weaken an argument
- Include data if quantitative` : ''}
${spec.skill === 'Inferences' ? `
- Ask what can be reasonably inferred from the passage
- Options should include overstatements and unsupported conclusions` : ''}
${spec.skill === 'Boundaries' ? `
- Create a sentence with a grammatical boundary issue (comma splice, run-on, fragment)
- Options present different punctuation solutions` : ''}
${spec.skill === 'Form, Structure, and Sense' ? `
- Create a sentence with subject-verb agreement, pronoun, or tense issues
- The passage should have complex syntax that might confuse the subject` : ''}
${spec.skill === 'Transitions' ? `
- Leave a blank for a transition word/phrase
- Context should clearly indicate the logical relationship needed` : ''}
${spec.skill === 'Rhetorical Synthesis' ? `
- Present notes/bullet points that student must synthesize
- Question asks for best way to accomplish a specific rhetorical goal` : ''}

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "passage": "The complete passage text (with ______ blank if Words in Context)",
  "passageSource": "${selectedSource} (style)",
  "questionStem": "The question text",
  "choices": {
    "A": "First option",
    "B": "Second option",
    "C": "Third option",
    "D": "Fourth option"
  },
  "correctAnswer": "B",
  "explanation": "Why B is correct and others are wrong (2-3 sentences)",
  "domain": "${spec.domain}",
  "skill": "${spec.skill}"
}`;

  const response = await getAnthropicClient(apiKey).messages.create({
    model: MODEL,
    max_tokens: 2500,
    temperature: 0.8, // Higher temperature for more variety
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    let jsonStr = content.text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    // Extract JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse placement question response:', content.text.slice(0, 500));
    throw new Error(`Failed to parse placement question response: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}
