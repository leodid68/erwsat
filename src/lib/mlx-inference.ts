import { spawn } from 'child_process';
import path from 'path';

interface MLXGenerateOptions {
  passage: string;
  questionType: string;
  difficulty?: string;
}

interface MLXQuestion {
  type: string;
  passage: string;
  questionText: string;
  choices: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

interface MLXResponse {
  success: boolean;
  question?: MLXQuestion;
  error?: string;
  status?: string; // For health check response
}

/**
 * Get the path to the MLX Python environment
 */
function getPythonPath(): string {
  const projectRoot = process.cwd();
  // Use the venv Python from mlx-finetune directory (where mlx_lm is installed)
  return path.join(projectRoot, 'fine-tuning', 'mlx-finetune', 'venv', 'bin', 'python3');
}

/**
 * Get the path to the generate_api.py script
 */
function getScriptPath(): string {
  const projectRoot = process.cwd();
  return path.join(projectRoot, 'fine-tuning', 'mlx-finetune', 'generate_api.py');
}

/**
 * Execute MLX inference via Python subprocess
 */
async function runMLXInference(input: object): Promise<MLXResponse> {
  return new Promise((resolve, reject) => {
    const pythonPath = getPythonPath();
    const scriptPath = getScriptPath();
    const cwd = path.join(process.cwd(), 'fine-tuning', 'mlx-finetune');

    console.log('[MLX] Python path:', pythonPath);
    console.log('[MLX] Script path:', scriptPath);
    console.log('[MLX] CWD:', cwd);
    console.log('[MLX] Input:', JSON.stringify(input).substring(0, 100));

    const proc = spawn(pythonPath, [scriptPath], {
      cwd,
      env: {
        ...process.env,
        // Ensure Python can find MLX modules
        PYTHONPATH: cwd,
      },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      console.log('[MLX] Process exited with code:', code);
      console.log('[MLX] stdout:', stdout.substring(0, 500));
      if (stderr) console.log('[MLX] stderr:', stderr.substring(0, 500));

      if (code !== 0) {
        reject(new Error(`MLX inference failed with code ${code}: ${stderr || stdout}`));
        return;
      }

      try {
        const response = JSON.parse(stdout);
        resolve(response);
      } catch (e) {
        reject(new Error(`Failed to parse MLX response: ${stdout.substring(0, 200)}`));
      }
    });

    proc.on('error', (err) => {
      console.error('[MLX] Spawn error:', err);
      reject(new Error(`Failed to spawn MLX process: ${err.message}`));
    });

    // Send input
    proc.stdin.write(JSON.stringify(input));
    proc.stdin.end();
  });
}

/**
 * Generate a SAT question using the MLX fine-tuned model
 */
export async function generateWithMLX(options: MLXGenerateOptions): Promise<MLXQuestion> {
  const response = await runMLXInference({
    action: 'generate',
    passage: options.passage,
    questionType: options.questionType,
    difficulty: options.difficulty || 'medium',
  });

  if (!response.success || !response.question) {
    throw new Error(response.error || 'Unknown MLX error');
  }

  return response.question;
}

/**
 * Check if MLX model is available
 */
export async function checkMLXAvailable(): Promise<boolean> {
  try {
    const response = await runMLXInference({ action: 'health' });
    return response.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Check if we should use MLX (model is sat-finetuned)
 */
export function shouldUseMLX(model?: string): boolean {
  return model === 'sat-finetuned';
}
