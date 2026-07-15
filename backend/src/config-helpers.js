export const hasText = (value) =>
  typeof value === 'string' && value.trim().length > 0;

export const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const trimEnv = (value) => (hasText(value) ? value.trim() : null);

export const stripWhitespace = (value) =>
  hasText(value) ? value.replace(/\s+/g, '') : null;

export const isTrue = (value) => String(value).toLowerCase() === 'true';

export const resolveProviderKey = (provider, env) => {
  if (provider === 'openai') return env.OPENAI_API_KEY;
  if (provider === 'anthropic') return env.ANTHROPIC_API_KEY;
  if (provider === 'gemini') return env.GEMINI_API_KEY;
  return null;
};
