import { randomUUID } from 'node:crypto';
import { ApiError } from '../errors.js';
import { logger } from '../logger.js';
import {
  mockText,
  callOpenAI,
  callAnthropic,
  callGemini,
} from './providers.js';
import {
  getJsonStructureInstruction,
  getCustomPracticePrompt,
} from '../prompts/prompt-loader.js';
import type { AiConfig } from '../../types.js';

export const AI_CONTRACT_VERSION = '2026-06-26.v1';

const isEvaluationOperation = (operation: string, body: AiRequestBody) =>
  (['analyzeProgress', 'evaluateEngineeringEnglish', 'analyzeText'] as string[]).includes(operation) &&
  body?.context !== undefined;

const isCustomPracticeRequest = (prompt: string) => {
  const lower = prompt.toLowerCase();
  return (
    lower.includes('sana özel') ||
    lower.includes('kendi hatalarım') ||
    lower.includes('hatalarımdan') ||
    lower.includes('my mistakes') ||
    lower.includes('custom review') ||
    lower.includes('specialized words')
  );
};

const buildPrompt = (prompt: string, body: AiRequestBody, evaluation: boolean): string => {
  let finalPrompt = prompt;
  if (evaluation) {
    finalPrompt = `${prompt}\n\n${getJsonStructureInstruction()}`;
  }
  if (isCustomPracticeRequest(prompt) && body?.context) {
    const memoryContextPrompt = getCustomPracticePrompt(body.context);
    finalPrompt = `${finalPrompt}\n${memoryContextPrompt}\nINSTRUCTION: You must construct custom practice questions, tests, or explanations based on the retrieved user learning memories listed above. Help them review their mistakes and weak terms.`;
  }
  return finalPrompt;
};

const callProvider = async (
  config: AiConfig,
  prompt: string,
  signal: AbortSignal,
  fetchImpl: typeof fetch,
  evaluation: boolean
): Promise<string> => {
  if (config.provider === 'anthropic') return callAnthropic(config as ProviderConfig, prompt, signal, fetchImpl);
  if (config.provider === 'gemini') return callGemini(config as ProviderConfig, prompt, signal, fetchImpl, evaluation);
  return callOpenAI(config as ProviderConfig, prompt, signal, fetchImpl, evaluation);
};

const parseEvaluationResponse = (text: string): { structured: Record<string, unknown> | null; responseText: string } => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      const lines = cleanText.split('\n');
      if (lines[0].startsWith('```')) lines.shift();
      if (lines[lines.length - 1] === '```') lines.pop();
      cleanText = lines.join('\n').trim();
    }
    const parsed = JSON.parse(cleanText);
    return { structured: parsed, responseText: parsed.professionalVersion || parsed.summary || text };
  } catch (err) {
    logger.error('Failed to parse AI evaluation structured response', {}, err as Error);
    return { structured: null, responseText: text };
  }
};

const withTimeout = async <T>(
  work: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await work(controller.signal);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        504,
        'ai_timeout',
        'The AI provider did not respond before the timeout.'
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

interface AiResult {
  contractVersion: string;
  requestId: string;
  operation: string;
  text: string;
  structuredResult?: Record<string, unknown> | null;
  provider: string;
  mode: 'mock' | 'real';
  mockMode: boolean;
  durationMs: number;
}

interface AiRequestBody {
  prompt?: string;
  operation?: string;
  modeId?: string;
  metadata?: { requestId?: string };
  context?: Record<string, unknown>;
}

export const createAIService = (
  config: AiConfig,
  fetchImpl: typeof fetch = fetch
) => ({
  async complete(operation: string, body: AiRequestBody): Promise<AiResult> {
    const prompt = body?.prompt ?? '';
    const requestId =
      typeof body?.metadata?.requestId === 'string'
        ? body.metadata.requestId
        : randomUUID();
    const startedAt = Date.now();

    if (!config.configured) {
      return {
        contractVersion: AI_CONTRACT_VERSION,
        requestId,
        operation,
        text: mockText(operation),
        provider: 'mock',
        mode: 'mock',
        mockMode: true,
        durationMs: Date.now() - startedAt,
      };
    }

    const evaluation = isEvaluationOperation(operation, body);
    const finalPrompt = buildPrompt(prompt, body, evaluation);

    const text = await withTimeout(
      (signal) => callProvider(config, finalPrompt, signal, fetchImpl, evaluation),
      config.timeoutMs
    );

    let structuredResult: Record<string, unknown> | null = null;
    let responseText = text;

    if (evaluation) {
      const parsed = parseEvaluationResponse(text);
      structuredResult = parsed.structured;
      responseText = parsed.responseText;
    }

    return {
      contractVersion: AI_CONTRACT_VERSION,
      requestId,
      operation,
      text: responseText,
      structuredResult,
      provider: config.provider,
      mode: 'real',
      mockMode: false,
      durationMs: Date.now() - startedAt,
    };
  },
});
