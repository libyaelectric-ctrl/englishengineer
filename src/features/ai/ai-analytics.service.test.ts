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
    expect(result.estimatedCostUsd).toBe(0.0042);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/v1/ai/analytics',
      expect.objectContaining({ headers: { Authorization: 'Bearer test' } })
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
});
