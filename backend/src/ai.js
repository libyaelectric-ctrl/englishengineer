import { randomUUID } from 'node:crypto';
import { ApiError } from './errors.js';
import { createAiLedger } from './ai-ledger.js';

export const AI_CONTRACT_VERSION = '2026-06-26.v1';

export const AI_ROUTES = {
  '/api/ai/coach': 'analyzeProgress',
  '/api/ai/writing-review': 'evaluateEngineeringEnglish',
  '/api/ai/assessment-feedback': 'analyzeText',
  '/api/ai/roleplay': 'generatePractice',
};

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

const mockText = (operation) =>
  `[Mock AI] ${operation} is running in local fallback mode. Configure a supported backend provider for real AI output.`;

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

const callOpenAI = async (config, prompt, signal, fetchImpl) => {
  const response = await fetchImpl(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal,
    }
  );
  if (!response.ok) {
    throw new ApiError(
      response.status === 429 ? 429 : 502,
      response.status === 429 ? 'ai_rate_limited' : 'ai_provider_error',
      response.status === 429
        ? 'The AI provider rate limit was reached.'
        : 'The AI provider is currently unavailable.'
    );
  }
  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
    throw new ApiError(
      502,
      'malformed_ai_response',
      'The AI provider returned an invalid response.'
    );
  }
  return text.trim();
};

const callAnthropic = async (config, prompt, signal, fetchImpl) => {
  const response = await fetchImpl('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1600,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  });
  if (!response.ok) {
    throw new ApiError(
      response.status === 429 ? 429 : 502,
      response.status === 429 ? 'ai_rate_limited' : 'ai_provider_error',
      response.status === 429
        ? 'The AI provider rate limit was reached.'
        : 'The AI provider is currently unavailable.'
    );
  }
  const payload = await response.json();
  const text = payload?.content?.find((item) => item?.type === 'text')?.text;
  if (typeof text !== 'string' || !text.trim()) {
    throw new ApiError(
      502,
      'malformed_ai_response',
      'The AI provider returned an invalid response.'
    );
  }
  return text.trim();
};

const callGemini = async (config, prompt, signal, fetchImpl) => {
  const model = config.model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1600 },
    }),
    signal,
  });
  if (!response.ok) {
    throw new ApiError(
      response.status === 429 ? 429 : 502,
      response.status === 429 ? 'ai_rate_limited' : 'ai_provider_error',
      response.status === 429
        ? 'The AI provider rate limit was reached.'
        : 'The AI provider is currently unavailable.'
    );
  }
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || !text.trim()) {
    throw new ApiError(
      502,
      'malformed_ai_response',
      'The AI provider returned an invalid response.'
    );
  }
  return text.trim();
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

export const registerAIRoutes = (
  app,
  aiService,
  requireBackendAuth,
  rateLimiter,
  billingRepository,
  config,
  fetchImpl = fetch
) => {
  const ledger = createAiLedger(config, fetchImpl);

  Object.entries(AI_ROUTES).forEach(([path, defaultOperation]) => {
    app.post(
      path,
      requireBackendAuth,
      rateLimiter,
      async (request, response, next) => {
        try {
          if (
            request.body?.operation !== undefined &&
            request.body.operation !== defaultOperation
          ) {
            throw new ApiError(
              400,
              'invalid_operation',
              'The AI operation must match the requested route.'
            );
          }

          const userId = request.auth?.userId || 'unknown';

          // Get user subscription details
          let subscription = null;
          if (billingRepository) {
            subscription =
              await billingRepository.getSubscriptionStatus(userId);
          }

          const planId = subscription?.planId || 'free';

          // Ledger check
          let count = 0;
          const isBypassUser =
            userId === 'engineeros-dev-user' ||
            userId.startsWith('demo_engineer_');

          if (!isBypassUser) {
            count = await ledger.countRecentRequests(userId, planId);

            // Validation checks
            if (planId === 'free') {
              if (count >= 3) {
                throw new ApiError(
                  429,
                  'free_ai_coach_limit_exceeded',
                  'Free plan accounts are limited to 3 AI Coach requests per day. Please upgrade to Pro.'
                );
              }
            } else {
              if (count >= 300) {
                throw new ApiError(
                  429,
                  'monthly_ai_credit_limit_exceeded',
                  'Monthly AI credit limit reached (300/300). Please contact support or upgrade.'
                );
              }
            }
          }

          // Complete AI request
          const result = await aiService.complete(
            defaultOperation,
            request.body
          );

          // Ledger insert on success
          if (result && !result.error && !isBypassUser) {
            ledger.logSession(userId, {
              modeId: request.body?.modeId || 'unknown',
              provider: result.provider || 'mock',
              operation: defaultOperation,
              durationMs: result.durationMs || 0,
              resultSummary: result.text ? result.text.slice(0, 100) : '',
            });
          }

          response.json(result);
        } catch (error) {
          next(error);
        }
      }
    );
  });
};
