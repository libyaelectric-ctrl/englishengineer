import { randomUUID } from 'node:crypto';

import type { AiConfig } from '../../types.js';
import { ApiError } from '../errors.js';
import { logger } from '../logger.js';
import {
  getContentGenerationInstructionAsync,
  getCustomPracticePrompt,
  getJsonStructureInstructionAsync,
  getResolvedPromptVersion,
} from '../prompts/prompt-loader.js';
import { callAnthropic, callGemini, callOpenAI, mockText } from './providers.js';
import type { ProviderConfig } from './providers.js';

export const AI_CONTRACT_VERSION = '2026-06-26.v1';

const JSON_OPERATIONS = [
  'analyzeProgress',
  'evaluateEngineeringEnglish',
  'analyzeText',
  'generateContent',
];

const isStructuredOperation = (operation: string, body: AiRequestBody) =>
  JSON_OPERATIONS.includes(operation) &&
  (operation === 'generateContent' || body?.context !== undefined);

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

const buildPrompt = async (
  prompt: string,
  body: AiRequestBody,
  structured: boolean,
  operation: string
): Promise<string> => {
  let finalPrompt = prompt;
  if (structured) {
    const instruction =
      operation === 'generateContent'
        ? await getContentGenerationInstructionAsync()
        : await getJsonStructureInstructionAsync();
    finalPrompt = `${prompt}\n\n${instruction}`;
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
  if (config.provider === 'anthropic')
    return callAnthropic(config as ProviderConfig, prompt, signal, fetchImpl);
  if (config.provider === 'gemini')
    return callGemini(config as ProviderConfig, prompt, signal, fetchImpl, evaluation);
  return callOpenAI(config as ProviderConfig, prompt, signal, fetchImpl, evaluation);
};

const parseEvaluationResponse = (
  text: string
): { structured: Record<string, unknown> | null; responseText: string } => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      const lines = cleanText.split('\n');
      if (lines[0].startsWith('```')) lines.shift();
      if (lines[lines.length - 1] === '```') lines.pop();
      cleanText = lines.join('\n').trim();
    }
    const parsed = JSON.parse(cleanText);
    return {
      structured: parsed,
      responseText: parsed.professionalVersion || parsed.summary || text,
    };
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
      throw new ApiError(504, 'ai_timeout', 'The AI provider did not respond before the timeout.');
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
  /** Version(s) of the bundled/database prompt instruction that served this call. */
  promptVersion?: string;
  /** Cheap heuristic token estimate for billing/analytics (chars/4). */
  estimatedTokens: number;
}

interface AiRequestBody {
  prompt?: string;
  operation?: string;
  modeId?: string;
  metadata?: { requestId?: string };
  context?: Record<string, unknown>;
}

export const createAIService = (config: AiConfig, fetchImpl: typeof fetch = fetch) => ({
  async complete(operation: string, body: AiRequestBody): Promise<AiResult> {
    const prompt = body?.prompt ?? '';
    const requestId =
      typeof body?.metadata?.requestId === 'string' ? body.metadata.requestId : randomUUID();
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
        estimatedTokens: 0,
      };
    }

    const structured = isStructuredOperation(operation, body);
    const finalPrompt = await buildPrompt(prompt, body, structured, operation);

    const text = await withTimeout(
      (signal) => callProvider(config, finalPrompt, signal, fetchImpl, structured),
      config.timeoutMs
    );

    let structuredResult: Record<string, unknown> | null = null;
    let responseText = text;

    if (structured) {
      const parsed = parseEvaluationResponse(text);
      structuredResult = parsed.structured;
      responseText = parsed.responseText;
    }

    const instructionKey =
      operation === 'generateContent' ? 'content-generation' : 'json-structure';
    const resolvedVersion = structured && getResolvedPromptVersion(instructionKey);

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
      promptVersion:
        resolvedVersion && structured
          ? `${resolvedVersion.key}:${resolvedVersion.version}@${resolvedVersion.source}`
          : undefined,
      estimatedTokens: Math.ceil((finalPrompt.length + text.length) / 4),
    };
  },
});
