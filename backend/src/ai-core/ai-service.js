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

export const AI_CONTRACT_VERSION = '2026-06-26.v1';

const readPrompt = (body) => body?.prompt ?? '';

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

    // Only apply structured evaluation if requested by the frontend with a context object
    const isEvaluation =
      ['analyzeProgress', 'evaluateEngineeringEnglish', 'analyzeText'].includes(
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
        return callAnthropic(config, finalPrompt, signal, fetchImpl);
      } else if (config.provider === 'gemini') {
        return callGemini(config, finalPrompt, signal, fetchImpl, isEvaluation);
      }
      return callOpenAI(config, finalPrompt, signal, fetchImpl, isEvaluation);
    }, config.timeoutMs);

    let structuredResult = null;
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
        logger.error('Failed to parse AI evaluation structured response', {}, err);
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
