import { randomUUID } from 'node:crypto';
import { ApiError } from '../errors.js';
import {
  mockText,
  callOpenAI,
  callAnthropic,
  callGemini,
} from './providers.js';

export const AI_CONTRACT_VERSION = '2026-06-26.v1';

const readPrompt = (body) => {
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    throw new ApiError(
      400,
      'invalid_prompt',
      'A non-empty prompt is required.'
    );
  }
  if (prompt.length > 20_000) {
    throw new ApiError(
      413,
      'prompt_too_large',
      'Prompt must be 20,000 characters or fewer.'
    );
  }
  return prompt;
};

const withTimeout = async (work, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await work(controller.signal);
  } catch (error) {
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

export const createAIService = (config, fetchImpl = fetch) => ({
  async complete(operation, body) {
    const prompt = readPrompt(body);
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

    const text = await withTimeout((signal) => {
      if (config.provider === 'anthropic') {
        return callAnthropic(config, prompt, signal, fetchImpl);
      } else if (config.provider === 'gemini') {
        return callGemini(config, prompt, signal, fetchImpl);
      }
      return callOpenAI(config, prompt, signal, fetchImpl);
    }, config.timeoutMs);

    return {
      contractVersion: AI_CONTRACT_VERSION,
      requestId,
      operation,
      text,
      provider: config.provider,
      mode: 'real',
      mockMode: false,
      durationMs: Date.now() - startedAt,
    };
  },
});
