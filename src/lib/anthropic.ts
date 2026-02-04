import Anthropic from '@anthropic-ai/sdk';
import { QuestionType, Question, AnswerId } from '@/types/question';
import { getAnthropicApiKey, isAnthropicConfigured as checkConfigured } from './env-loader';

// Create client lazily to allow env loading
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: getAnthropicApiKey(),
      baseURL: 'https://api.anthropic.com', // Force Anthropic URL (ignore ANTHROPIC_BASE_URL env var)
      timeout: 120000, // 2 minute timeout
    });
  }
  return anthropicClient;
}

const MODEL = 'claude-sonnet-4-20250514';

/**
 * Select best passages from text using Claude Sonnet
 * Returns passages that are suitable for SAT-style reading comprehension
 */
export async function selectPassagesWithSonnet(
  fullText: string,
  maxPassages: number = 5
): Promise<Array<{ text: string; reason: string }>> {
  const textToAnalyze = fullText.slice(0, 15000);

  const response = await getAnthropicClient().messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: `You are an expert SAT reading comprehension passage selector. You analyze texts and extract the best passages for standardized test preparation. Always respond with valid JSON only.`,
    messages: [
      {
        role: 'user',
        content: `Select ${maxPassages} passages from this text for SAT reading comprehension practice.

CRITERIA:
- 125-200 words each
- Self-contained, clear narrative flow
- Good for inference and vocabulary questions
- Avoid dialogue-heavy or list sections

<source_text>
${textToAnalyze}
</source_text>

Return a JSON array only, no markdown or explanation:
[{"text": "passage text", "reason": "one sentence explanation"}]`,
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
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Omit<Question, 'id' | 'passageSource' | 'createdAt'>> {
  // Import the same prompts used by fine-tuned model
  const { buildQuestionPrompt } = await import('./prompts/sat-question-prompts');

  const prompt = buildQuestionPrompt(passage, questionType, difficulty);

  const response = await getAnthropicClient().messages.create({
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
