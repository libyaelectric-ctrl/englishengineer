import { IdService } from '@/core/ids/id.service';
import {
  AICoachContext,
  AICoachResult,
  AIContractVersion,
  AIOperation,
  AIProvider,
  AIProviderStatus,
  AIRequest,
  AIRequestMetadata,
  AIResponse,
} from './ai.types';
import { getBackendAuthHeaders } from '@/features/auth/backend-auth';

interface BackendProxyPayload {
  contractVersion: AIContractVersion;
  operation: AIOperation;
  modeId: string;
  modeName: string;
  prompt: string;
  context?: AICoachContext;
  metadata: AIRequestMetadata;
}

interface BackendProxyResponse {
  contractVersion?: AIContractVersion;
  requestId?: string;
  operation?: AIOperation;
  structuredResult?: AICoachResult;
  text?: string;
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
  result?: string;
  message?: string;
  provider?: string;
  mode?: 'real' | 'mock';
  mockMode?: boolean;
}

type BackendProxyErrorCode =
  | 'backend_timeout'
  | 'backend_rate_limited'
  | 'backend_unavailable'
  | 'backend_network_error'
  | 'backend_malformed_response'
  | 'backend_http_error'
  | 'backend_unknown_error';

class BackendProxyError extends Error {
  readonly code: BackendProxyErrorCode;
  readonly retryable: boolean;

  constructor(
    code: BackendProxyErrorCode,
    message: string,
    retryable: boolean
  ) {
    super(message);
    this.name = 'BackendProxyError';
    this.code = code;
    this.retryable = retryable;
  }
}

const CONTRACT_VERSION: AIContractVersion = '2026-06-26.v1';
const DEFAULT_PROXY_TIMEOUT_MS = 20_000;
const MAX_RETRIES = 1;
const ROUTE_BY_OPERATION: Record<AIOperation, string> = {
  analyzeText: 'assessment-feedback',
  rewriteText: 'writing-review',
  generatePractice: 'roleplay',
  evaluateEngineeringEnglish: 'writing-review',
  generateStudyPlan: 'coach',
  analyzeProgress: 'coach',
};

const resolveProxyEndpoint = (
  proxyUrl: string,
  operation: AIOperation
): string => {
  const route = ROUTE_BY_OPERATION[operation];
  const withoutTrailingSlash = proxyUrl.replace(/\/$/, '');
  if (
    /\/(coach|writing-review|assessment-feedback|roleplay)$/.test(
      withoutTrailingSlash
    )
  ) {
    return withoutTrailingSlash.replace(
      /\/(coach|writing-review|assessment-feedback|roleplay)$/,
      `/${route}`
    );
  }
  return `${withoutTrailingSlash}/${route}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const isAICoachResult = (value: unknown): value is AICoachResult => {
  if (!isRecord(value)) return false;
  return (
    typeof value.summary === 'string' &&
    Array.isArray(value.strengths) &&
    Array.isArray(value.weaknesses) &&
    Array.isArray(value.corrections) &&
    typeof value.nativeRewrite === 'string' &&
    Array.isArray(value.technicalVocabulary) &&
    typeof value.recommendedNextTask === 'string' &&
    typeof value.estimatedCefrImpact === 'string' &&
    Array.isArray(value.suggestedActions) &&
    typeof value.focusArea === 'string'
  );
};

export const mapHttpError = (status: number): BackendProxyError => {
  if (status === 408)
    return new BackendProxyError(
      'backend_timeout',
      'Backend AI request timed out.',
      true
    );
  if (status === 429)
    return new BackendProxyError(
      'backend_rate_limited',
      'Backend AI rate limit reached. Please try again shortly.',
      true
    );
  if (status >= 500)
    return new BackendProxyError(
      'backend_unavailable',
      'Backend AI service is temporarily unavailable.',
      true
    );
  return new BackendProxyError(
    'backend_http_error',
    `Backend AI request failed with status ${status}.`,
    false
  );
};

const mapUnknownError = (error: unknown): BackendProxyError => {
  if (error instanceof BackendProxyError) return error;
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new BackendProxyError(
      'backend_timeout',
      'Backend AI request timed out after 20 seconds.',
      false
    );
  }
  if (error instanceof TypeError) {
    return new BackendProxyError(
      'backend_network_error',
      'Network error while contacting backend AI proxy.',
      true
    );
  }
  if (error instanceof Error) {
    return new BackendProxyError('backend_unknown_error', error.message, false);
  }
  return new BackendProxyError(
    'backend_unknown_error',
    'Unknown backend AI error.',
    false
  );
};

const resolveBackendResponseText = (data: BackendProxyResponse): string => {
  if (data.text && data.text.trim().length > 0) return data.text;
  if (data.structuredResult) return data.structuredResult.summary;

  const legacyText = data.result || data.message;
  if (legacyText && legacyText.trim().length > 0) return legacyText;

  throw new BackendProxyError(
    'backend_malformed_response',
    'Backend AI response did not include text or structuredResult.',
    false
  );
};

export const parseBackendResponse = (data: unknown): BackendProxyResponse => {
  if (!isRecord(data)) {
    throw new BackendProxyError(
      'backend_malformed_response',
      'Backend AI response was not a JSON object.',
      false
    );
  }

  const structuredResult = data.structuredResult;
  if (structuredResult !== undefined && !isAICoachResult(structuredResult)) {
    throw new BackendProxyError(
      'backend_malformed_response',
      'Backend AI structuredResult did not match the v1 contract.',
      false
    );
  }

  const errorValue = data.error;
  const error =
    isRecord(errorValue) &&
    typeof errorValue.code === 'string' &&
    typeof errorValue.message === 'string'
      ? {
          code: errorValue.code,
          message: errorValue.message,
          retryable:
            typeof errorValue.retryable === 'boolean'
              ? errorValue.retryable
              : undefined,
        }
      : undefined;

  return {
    contractVersion:
      data.contractVersion === CONTRACT_VERSION ? CONTRACT_VERSION : undefined,
    requestId: typeof data.requestId === 'string' ? data.requestId : undefined,
    operation:
      typeof data.operation === 'string'
        ? (data.operation as AIOperation)
        : undefined,
    structuredResult,
    text: typeof data.text === 'string' ? data.text : undefined,
    result: typeof data.result === 'string' ? data.result : undefined,
    message: typeof data.message === 'string' ? data.message : undefined,
    provider: typeof data.provider === 'string' ? data.provider : undefined,
    mode: data.mode === 'real' || data.mode === 'mock' ? data.mode : undefined,
    mockMode: typeof data.mockMode === 'boolean' ? data.mockMode : undefined,
    error,
  };
};

export const createBackendProxyProvider = (
  proxyUrl: string | null
): AIProvider => {
  const status: AIProviderStatus = {
    mode: 'backend',
    state: proxyUrl ? 'backend-configured' : 'backend-error',
    label: proxyUrl
      ? 'Protected AI connection ready'
      : 'AI service unavailable',
    detail: proxyUrl
      ? 'Secure AI feedback is connected through the protected service.'
      : 'Secure AI feedback is not connected.',
    isConnected: Boolean(proxyUrl),
  };

  const callProxy = async (
    operation: AIOperation,
    request: AIRequest
  ): Promise<AIResponse> => {
    const startedAt = performance.now();
    const requestId = IdService.createId('ai_req');

    if (!proxyUrl) {
      return {
        text: 'Secure AI feedback is not connected.',
        providerStatus: status,
        metadata: {
          contractVersion: CONTRACT_VERSION,
          requestId,
          operation,
          durationMs: 0,
          success: false,
          retryCount: 0,
          errorCode: 'backend_unavailable',
        },
      };
    }

    const metadata: AIRequestMetadata = {
      contractVersion: CONTRACT_VERSION,
      requestId,
      sentAt: new Date().toISOString(),
      client: 'engineeros-web',
    };

    const payload: BackendProxyPayload = {
      contractVersion: CONTRACT_VERSION,
      operation,
      modeId: request.modeId,
      modeName: request.modeName,
      prompt: request.prompt,
      context: request.context,
      metadata,
    };

    let retryCount = 0;
    let lastError: BackendProxyError | null = null;

    while (retryCount <= MAX_RETRIES) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        DEFAULT_PROXY_TIMEOUT_MS
      );

      try {
        const authHeaders = await getBackendAuthHeaders();
        const response = await fetch(
          resolveProxyEndpoint(proxyUrl, operation),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-EngineerOS-AI-Contract': CONTRACT_VERSION,
              'X-EngineerOS-Request-Id': requestId,
              ...authHeaders,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          }
        );
        window.clearTimeout(timeoutId);

        if (!response.ok) {
          throw mapHttpError(response.status);
        }

        const data = parseBackendResponse(await response.json());
        if (data.error) {
          throw new BackendProxyError(
            data.error.code === 'rate_limited'
              ? 'backend_rate_limited'
              : 'backend_http_error',
            data.error.message,
            data.error.retryable === true
          );
        }

        const durationMs = Math.round(performance.now() - startedAt);
        const isBackendMock = data.mockMode === true || data.mode === 'mock';
        const responseStatus: AIProviderStatus = isBackendMock
          ? {
              mode: 'backend',
              state: 'mock-fallback',
              label: 'Mock AI demo through protected connection',
              detail:
                'The protected service is connected, but Mock AI demo mode is active.',
              isConnected: true,
            }
          : status;
        return {
          text: resolveBackendResponseText(data),
          providerStatus: responseStatus,
          structuredResult: data.structuredResult,
          metadata: {
            contractVersion: CONTRACT_VERSION,
            requestId: data.requestId || requestId,
            operation,
            durationMs,
            success: true,
            retryCount,
          },
        };
      } catch (error) {
        window.clearTimeout(timeoutId);
        lastError = mapUnknownError(error);
        if (!lastError.retryable || retryCount >= MAX_RETRIES) break;
        retryCount += 1;
      }
    }

    throw new BackendProxyError(
      lastError?.code || 'backend_unknown_error',
      lastError?.message || 'Backend AI proxy request failed.',
      false
    );
  };

  return {
    getStatus: () => status,
    analyzeText: (request: AIRequest): Promise<AIResponse> =>
      callProxy('analyzeText', request),
    rewriteText: (request: AIRequest): Promise<AIResponse> =>
      callProxy('rewriteText', request),
    generatePractice: (request: AIRequest): Promise<AIResponse> =>
      callProxy('generatePractice', request),
    evaluateEngineeringEnglish: (request: AIRequest): Promise<AIResponse> =>
      callProxy('evaluateEngineeringEnglish', request),
    generateStudyPlan: (request: AIRequest): Promise<AIResponse> =>
      callProxy('generateStudyPlan', request),
    analyzeProgress: (request: AIRequest): Promise<AIResponse> =>
      callProxy('analyzeProgress', request),
  };
};
