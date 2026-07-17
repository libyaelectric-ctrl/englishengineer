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
import type { AiConfig, AiOperation } from '../../types.js';

export const AI_CONTRACT_VERSION = '2026-06-26.v1';

const readPrompt = (body: Record<string, any>): string => body?.prompt ?? '';

const withTimeout = async <T>(
  work: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await work(controller.signal);
  } catch (error: any) {
    if (error?.name === 'AbortError') {
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
  structuredResult?: Record<string, any> | null;
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
  context?: any;
}

export const createAIService = (config: AiConfig, fetchImpl: typeof fetch = fetch) => ({
  async complete(operation: string, body: AiRequestBody): Promise<AiResult> {
    const prompt = readPrompt(body as Record<string, any>);
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

    const isEvaluation =
      (['analyzeProgress', 'evaluateEngineeringEnglish', 'analyzeText'] as string[]).includes(
        operation
      ) && body?.context !== undefined;

    let finalPrompt = prompt;
    if (isEvaluation) {
      finalPrompt = `${prompt}\n\n${getJsonStructureInstruction()}`;
    }

    const isCustomPracticeRequest =
      prompt.toLowerCase().includes('sana özel') ||
      prompt.toLowerCase().includes('kendi hatalarım') ||
      prompt.toLowerCase().includes('hatalarımdan') ||
      prompt.toLowerCase().includes('my mistakes') ||
      prompt.toLowerCase().includes('custom review') ||
      prompt.toLowerCase().includes('specialized words');

    if (isCustomPracticeRequest && body?.context) {
      const memoryContextPrompt = getCustomPracticePrompt(body.context);
      finalPrompt = `${finalPrompt}\n${memoryContextPrompt}\nINSTRUCTION: You must construct custom practice questions, tests, or explanations based on the retrieved user learning memories listed above. Help them review their mistakes and weak terms.`;
    }

    const text = await withTimeout((signal) => {
      if (config.provider === 'anthropic') {
        return callAnthropic(config as any, finalPrompt, signal, fetchImpl);
      } else if (config.provider === 'gemini') {
        return callGemini(config as any, finalPrompt, signal, fetchImpl, isEvaluation);
      }
      return callOpenAI(config as any, finalPrompt, signal, fetchImpl, isEvaluation);
    }, config.timeoutMs);

    let structuredResult: Record<string, any> | null = null;
    let responseText = text;

    if (isEvaluation) {
      try {
        let cleanText = text.trim();
        if (cleanText.startsWith('```')) {
          const lines = cleanText.split('\n');
          if (lines[0].startsWith('```')) {
            lines.shift();
          }
          if (lines[lines.length - 1] === '```') {
            lines.pop();
          }
          cleanText = lines.join('\n').trim();
        }
        const parsed = JSON.parse(cleanText);
        structuredResult = parsed;
        responseText = parsed.professionalVersion || parsed.summary || text;
      } catch (err) {
        logger.error(
          'Failed to parse AI evaluation structured response',
          {},
          err as Error
        );
      }
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
