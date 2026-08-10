import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitSpeakingToBackend } from './speaking-submit.service';

vi.mock('@/shared/services/backend-auth.service', () => ({
  getBackendAuthHeaders: vi.fn().mockResolvedValue({ Authorization: 'Bearer test-token' }),
}));

vi.mock('@/features/ai/ai.config', () => ({
  AI_BACKEND_PROXY_CONFIG: { proxyUrl: 'http://localhost:8787/api/v1/ai' },
}));

describe('submitSpeakingToBackend', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts missionId/transcript/audioUrl to /api/v1/speaking/submit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        id: 'sub-1',
        overallScore: 74,
        feedback: { grammar: 'Solid, minor tense slips.' },
        status: 'graded',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitSpeakingToBackend({
      missionId: 'speaking_a1_site_introduction',
      transcript: 'I am an engineer.',
      audioUrl: '/uploads/speaking/user-1/abc.webm',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8787/api/v1/speaking/submit',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
        body: JSON.stringify({
          missionId: 'speaking_a1_site_introduction',
          transcript: 'I am an engineer.',
          audioUrl: '/uploads/speaking/user-1/abc.webm',
        }),
      })
    );
    expect(result?.overallScore).toBe(74);
    expect(result?.feedback).toEqual({ grammar: 'Solid, minor tense slips.' });
  });

  it('returns null when the backend responds with a non-OK status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitSpeakingToBackend({
      missionId: 'm1',
      transcript: 'text',
    });

    expect(result).toBeNull();
  });

  it('returns null (never throws) when the network call fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      submitSpeakingToBackend({ missionId: 'm1', transcript: 'text' })
    ).resolves.toBeNull();
  });
});
