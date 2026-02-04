// SAT Fine-tuned Model API Client
const SAT_API_URL = process.env.SAT_API_URL || 'http://localhost:8000';

interface Choice {
  id: string;
  text: string;
}

interface SATAnswerRequest {
  passage: string;
  question: string;
  choices: Choice[];
  skill?: string;
}

interface SATAnswerResponse {
  answer: string;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
  skill_detected: string;
}

interface SATHealthResponse {
  status: string;
  model_loaded: boolean;
}

/**
 * Check SAT API health
 */
export async function checkSATModelHealth(): Promise<SATHealthResponse> {
  try {
    const response = await fetch(`${SAT_API_URL}/health`);
    if (!response.ok) {
      return { status: 'error', model_loaded: false };
    }
    return await response.json();
  } catch {
    return { status: 'error', model_loaded: false };
  }
}

/**
 * Get answer from SAT fine-tuned model
 */
export async function answerWithSATModel(request: SATAnswerRequest): Promise<SATAnswerResponse> {
  const response = await fetch(`${SAT_API_URL}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SAT API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Answer multiple questions
 */
export async function answerBatchWithSATModel(questions: SATAnswerRequest[]): Promise<SATAnswerResponse[]> {
  const response = await fetch(`${SAT_API_URL}/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SAT API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.results;
}

// Available models including our SAT fine-tuned model
export const AVAILABLE_MODELS = [
  {
    id: 'sat-finetuned',
    name: 'SAT Fine-tuned (Qwen3-8B)',
    description: 'Optimisé pour SAT - Meilleure précision',
    isSATModel: true,
  },
  { id: 'mistral:7b-instruct', name: 'Mistral 7B Instruct', description: 'Fast and accurate' },
  { id: 'llama3.1:8b-instruct-q4_0', name: 'Llama 3.1 8B', description: 'High quality' },
];
