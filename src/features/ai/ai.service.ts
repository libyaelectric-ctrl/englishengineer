import { logger } from '@/shared/logger';
import {
  AIOperation,
  AIProvider,
  AIProviderStatus,
  AIRequest,
  AIResponse,
} from '@/shared/types/ai.types';

import { AI_BACKEND_PROXY_CONFIG } from './ai.config';
import { createBackendProxyProvider } from './backend-proxy.provider';
import { MockExample, createMockAIProvider } from './mock-ai.provider';

const RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_PROMPT_LENGTH = 4000;
const MAX_OUTPUT_LENGTH = 12000;

const requestTimestamps: number[] = [];

const isRateLimited = (): boolean => {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  return requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS;
};

const trimToLength = (value: string, maxLength: number): string =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength)}…`;

const validateOutput = (response: AIResponse): AIResponse => {
  const text = response.text?.trim();
  if (!text) {
    return {
      ...response,
      text: 'The AI service returned an empty response. Please try again.',
      metadata: {
        ...(response.metadata ?? ({} as AIResponse['metadata'])),
        errorCode: 'empty_output',
      } as AIResponse['metadata'],
    };
  }
  if (text.length > MAX_OUTPUT_LENGTH) {
    return { ...response, text: trimToLength(text, MAX_OUTPUT_LENGTH) };
  }
  return response;
};

const getActiveProvider = (examples: MockExample[]): AIProvider => {
  if (
    AI_BACKEND_PROXY_CONFIG.providerMode === 'backend' &&
    AI_BACKEND_PROXY_CONFIG.isBackendConfigured
  ) {
    return createBackendProxyProvider(AI_BACKEND_PROXY_CONFIG.proxyUrl);
  }

  return createMockAIProvider(examples);
};

export const AIService = {
  getProvider(examples: MockExample[]): AIProvider {
    return getActiveProvider(examples);
  },

  getStatus(examples: MockExample[]): AIProviderStatus {
    return this.getProvider(examples).getStatus();
  },

  async run(
    examples: MockExample[],
    operation: AIOperation,
    request: Omit<AIRequest, 'operation'>
  ): Promise<AIResponse> {
    if (isRateLimited()) {
      logger.w('[AIService] Rate limit exceeded, rejecting request');
      return {
        text: 'Too many AI requests in a short time. Please wait a moment and try again.',
        providerStatus: {
          mode: 'mock',
          state: 'mock-fallback',
          label: 'Rate limited',
          detail: 'Too many AI requests. Please try again shortly.',
          isConnected: false,
        },
        metadata: {
          contractVersion: '2026-06-26.v1',
          requestId: 'rate-limited',
          operation,
          durationMs: 0,
          success: false,
          retryCount: 0,
          errorCode: 'rate_limited',
        },
      };
    }

    const safeRequest: Omit<AIRequest, 'operation'> = {
      ...request,
      prompt: trimToLength(request.prompt, MAX_PROMPT_LENGTH),
    };
    requestTimestamps.push(Date.now());

    const provider = this.getProvider(examples);
    const fullRequest: AIRequest = { ...safeRequest, operation };

    try {
      const response = await provider[operation](fullRequest);
      return validateOutput(response);
    } catch (e) {
      logger.w('[AIService] Provider failed, falling back to mock:', e);
      const fallback = createMockAIProvider(examples);
      const fallbackResponse = await fallback[operation](fullRequest);
      return validateOutput({
        ...fallbackResponse,
        metadata: {
          ...fallbackResponse.metadata,
          contractVersion: '2026-06-26.v1',
          requestId: fallbackResponse.metadata?.requestId || 'fallback',
          operation,
          durationMs: fallbackResponse.metadata?.durationMs || 0,
          success: false,
          retryCount: fallbackResponse.metadata?.retryCount || 0,
          errorCode: 'backend_proxy_error',
        },
        providerStatus: {
          mode: 'backend',
          state: 'backend-error',
          label: 'AI service unavailable',
          detail:
            'The secure AI connection is unavailable. A clearly labelled Mock AI demo response is shown.',
          isConnected: false,
        },
      });
    }
  },

  complete(
    examples: MockExample[],
    request: AIRequest | Omit<AIRequest, 'operation'>
  ): Promise<AIResponse> {
    const operation = 'operation' in request ? request.operation : 'rewriteText';
    const normalizedRequest =
      'operation' in request
        ? {
            modeId: request.modeId,
            modeName: request.modeName,
            prompt: request.prompt,
            context: request.context,
          }
        : request;
    return this.run(examples, operation, normalizedRequest);
  },
};
