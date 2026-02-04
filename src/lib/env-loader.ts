/**
 * Manual env loader for Turbopack compatibility
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface EnvVars {
  ANTHROPIC_API_KEY?: string;
  GUARDIAN_API_KEY?: string;
}

let cachedEnv: EnvVars | null = null;

export function getEnv(): EnvVars {
  if (cachedEnv) return cachedEnv;

  cachedEnv = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GUARDIAN_API_KEY: process.env.GUARDIAN_API_KEY,
  };

  // If not loaded from process.env, try reading .env.local directly
  if (!cachedEnv.ANTHROPIC_API_KEY || !cachedEnv.GUARDIAN_API_KEY) {
    const envPath = resolve(process.cwd(), '.env.local');
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIndex = trimmed.indexOf('=');
          if (eqIndex > 0) {
            const key = trimmed.slice(0, eqIndex) as keyof EnvVars;
            const value = trimmed.slice(eqIndex + 1);
            if (key in cachedEnv! && !cachedEnv![key]) {
              cachedEnv![key] = value;
            }
          }
        }
      });
    }
  }

  return cachedEnv;
}

export function getAnthropicApiKey(): string | undefined {
  return getEnv().ANTHROPIC_API_KEY;
}

export function getGuardianApiKey(): string | undefined {
  return getEnv().GUARDIAN_API_KEY;
}

export function isAnthropicConfigured(): boolean {
  return !!getAnthropicApiKey();
}
