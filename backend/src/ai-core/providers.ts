import { ApiError } from '../errors.js';

export const mockText = (operation: string): string =>
  `[Mock AI] ${operation} is running in local fallback mode. Configure a supported backend provider for real AI output.`;

export interface ProviderConfig {
  apiKey: string;
  model: string;
}

const handleProviderResponse = async (
  response: Response,
  extractText: (payload: unknown) => string | undefined
): Promise<string> => {
  if (!response.ok) {
    const isRateLimited = response.status === 429;
    throw new ApiError(
      isRateLimited ? 429 : 502,
      isRateLimited ? 'ai_rate_limited' : 'ai_provider_error',
      isRateLimited
        ? 'The AI provider rate limit was reached.'
        : 'The AI provider is currently unavailable.'
    );
  }
  const payload = await response.json();
  const text = extractText(payload);
  if (typeof text !== 'string' || !text.trim()) {
    throw new ApiError(
      502,
      'malformed_ai_response',
      'The AI provider returned an invalid response.'
    );
  }
  return text.trim();
};

export const callOpenAI = async (
  config: ProviderConfig,
  prompt: string,
  signal: AbortSignal,
  fetchImpl: typeof fetch,
  jsonMode = false
): Promise<string> => {
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
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal,
    }
  );
  return handleProviderResponse(response, (p) => {
    const r = p as { choices?: { message?: { content?: string } }[] };
    return r?.choices?.[0]?.message?.content;
  });
};

export const callAnthropic = async (
  config: ProviderConfig,
  prompt: string,
  signal: AbortSignal,
  fetchImpl: typeof fetch
): Promise<string> => {
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
  return handleProviderResponse(response, (p) => {
    const r = p as { content?: { type?: string; text?: string }[] };
    return r?.content?.find((item) => item?.type === 'text')?.text;
  });
};

export const callGemini = async (
  config: ProviderConfig,
  prompt: string,
  signal: AbortSignal,
  fetchImpl: typeof fetch,
  jsonMode = false
): Promise<string> => {
  const model = config.model || 'gemini-2.0-flash';
  const response = await fetchImpl(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1600,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
      }),
      signal,
    }
  );
  return handleProviderResponse(response, (p) => {
    const r = p as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return r?.candidates?.[0]?.content?.parts?.[0]?.text;
  });
};
