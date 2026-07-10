import { ApiError } from '../errors.js';

export const mockText = (operation) =>
  `[Mock AI] ${operation} is running in local fallback mode. Configure a supported backend provider for real AI output.`;

export const callOpenAI = async (config, prompt, signal, fetchImpl, jsonMode = false) => {
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

export const callAnthropic = async (config, prompt, signal, fetchImpl) => {
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

export const callGemini = async (config, prompt, signal, fetchImpl, jsonMode = false) => {
  const model = config.model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1600,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
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
