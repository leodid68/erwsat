// Default Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'mistral:7b-instruct';

export const AVAILABLE_MODELS = [
  { id: 'sat-finetuned', name: '🎯 SAT Fine-tuned (Qwen3-8B)', description: 'Optimisé pour SAT - Meilleure précision', isSATModel: true },
  { id: 'mistral:7b-instruct', name: 'Mistral 7B Instruct', description: 'Fast and accurate' },
  { id: 'llama3.1:8b-instruct-q4_0', name: 'Llama 3.1 8B', description: 'High quality' },
  { id: 'phi3:mini', name: 'Phi-3 Mini', description: 'Lightweight, runs on limited hardware' },
  { id: 'gemma2:9b', name: 'Gemma 2 9B', description: 'Google\'s latest model' },
];

interface OllamaGenerateOptions {
  model?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

/**
 * Generate text using Ollama API directly
 */
export async function generateWithOllama(options: OllamaGenerateOptions): Promise<string> {
  const { model = DEFAULT_MODEL, prompt, temperature = 0.7, maxTokens = 2000 } = options;

  // Timeout after 2 minutes
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Ollama timeout: la génération a pris trop de temps (>2min)');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check Ollama connection and list available models
 */
export async function checkOllamaConnection(): Promise<{ connected: boolean; models: string[] }> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) {
      return { connected: false, models: [] };
    }
    const data = await response.json();
    const models = data.models?.map((m: { name: string }) => m.name) || [];
    return { connected: true, models };
  } catch {
    return { connected: false, models: [] };
  }
}

/**
 * Pull a model from Ollama registry
 */
export async function pullModel(modelName: string): Promise<void> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: modelName, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Failed to pull model: ${response.statusText}`);
  }
}
