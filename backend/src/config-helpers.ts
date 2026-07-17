import type { AiProvider } from '../types.js';

export const hasText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const toPositiveInteger = (
  value: string | undefined | null,
  fallback: number
): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const trimEnv = (value: string | undefined | null): string | null =>
  hasText(value) ? value.trim() : null;

export const stripWhitespace = (
  value: string | undefined | null
): string | null => (hasText(value) ? value.replace(/\s+/g, '') : null);

export const isTrue = (value: unknown): boolean =>
  String(value).toLowerCase() === 'true';

export const resolveProviderKey = (
  provider: AiProvider,
  env: Record<string, string | undefined>
): string | null => {
  if (provider === 'openai') return env.OPENAI_API_KEY ?? null;
  if (provider === 'anthropic') return env.ANTHROPIC_API_KEY ?? null;
  if (provider === 'gemini') return env.GEMINI_API_KEY ?? null;
  return null;
};
