// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type AiAnalyticsData, AiAnalyticsService } from './ai-analytics.service';

vi.mock('@/shared/services/backend-auth.service', () => ({
  getBackendAuthHeaders: vi.fn(async () => ({ Authorization: 'Bearer test' })),
}));

vi.mock('./ai.config', () => ({
  AI_BACKEND_PROXY_CONFIG: {
    isBackendConfigured: true,
    proxyUrl: 'https://backend.example.com/api/v1/ai',
  },
}));

const analyticsPayload: AiAnalyticsData = {
  userId: 'user_1',
  planId: 'free',
  limits: { used: 2, remaining: 1, daily: 3, monthly: null },
  totalRequests: 3,
  averageDurationMs: 1400,
  totalEstimatedTokens: 6400,
  estimatedCostUsd: 0.0042,
  byOperation: [{ operation: 'writing_rewrite', count: 2 }],
  byDay: [{ date: '2026-08-17', count: 3 }],
};

describe('AiAnalyticsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches analytics from the backend base with auth headers', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(analyticsPayload), { status: 200 })
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await AiAnalyticsService.fetch();

    expect(result.totalRequests).toBe(3);
    expect(result.planId).toBe('free');
    expect(result.limits.remaining).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/v1/ai/analytics',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test',
        }),
        signal: expect.any(AbortSignal),
      })
    );
    vi.unstubAllGlobals();
  });

  it('returns empty defaults when the backend responds with an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 }))
    );

    const result = await AiAnalyticsService.fetch();

    expect(result.totalRequests).toBe(0);
    expect(result.planId).toBe('');
    expect(result.byOperation).toEqual([]);
    vi.unstubAllGlobals();
  });

  it('returns empty defaults when fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('Network down');
      })
    );

    const result = await AiAnalyticsService.fetch();

    expect(result.totalRequests).toBe(0);
    vi.unstubAllGlobals();
  });

  it('returns empty defaults when rate limit error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('rate limit exceeded', { status: 429 }))
    );

    const result = await AiAnalyticsService.fetch();

    expect(result.totalRequests).toBe(0);
    expect(result.planId).toBe('');
    expect(result.byOperation).toEqual([]);
    vi.unstubAllGlobals();
  });

  it('fetches admin analytics from the admin endpoint', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            success: true,
            data: {
              totalRequests: 10,
              totalEstimatedTokens: 20000,
              estimatedCostUsd: 0.02,
              topUsers: [
                {
                  userId: 'a',
                  totalRequests: 5,
                  totalEstimatedTokens: 10000,
                  estimatedCostUsd: 0.01,
                },
              ],
            },
          }),
          { status: 200 }
        )
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await AiAnalyticsService.fetchAdmin();

    expect(result?.totalRequests).toBe(10);
    expect(result?.topUsers[0].userId).toBe('a');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/v1/ai/analytics/admin',
      expect.anything()
    );
    vi.unstubAllGlobals();
  });

  it('returns null from fetchAdmin when unauthorized', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('forbidden', { status: 403 }))
    );

    const result = await AiAnalyticsService.fetchAdmin();

    expect(result).toBeNull();
    vi.unstubAllGlobals();
  });
});
