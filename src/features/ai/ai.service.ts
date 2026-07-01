import { AI_BACKEND_PROXY_CONFIG } from './ai.config';
import { createBackendProxyProvider } from './backend-proxy.provider';
import { createMockAIProvider, MockExample } from './mock-ai.provider';
import {
  AIOperation,
  AIProvider,
  AIProviderStatus,
  AIRequest,
  AIResponse,
} from './ai.types';

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
    const provider = this.getProvider(examples);
    const fullRequest: AIRequest = { ...request, operation };

    try {
      return await provider[operation](fullRequest);
    } catch {
      const fallback = createMockAIProvider(examples);
      const fallbackResponse = await fallback[operation](fullRequest);
      return {
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
      };
    }
  },

  complete(
    examples: MockExample[],
    request: AIRequest | Omit<AIRequest, 'operation'>
  ): Promise<AIResponse> {
    const operation =
      'operation' in request ? request.operation : 'rewriteText';
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
