import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitWritingToBackend } from './writing-submit.service';

vi.mock('@/shared/services/backend-auth.service', () => ({
  getBackendAuthHeaders: vi.fn().mockResolvedValue({ Authorization: 'Bearer test-token' }),
}));

vi.mock('@/shared/services/ai-proxy.config', () => ({
  AI_BACKEND_PROXY_CONFIG: { proxyUrl: 'http://localhost:8787/api/v1/ai' },
}));

describe('submitWritingToBackend', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('posts the draft to /api/v1/writing/submit and returns the parsed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        id: 'sub-1',
        score: 82,
        feedback: { grammar: 'Watch your verb tenses.' },
        status: 'graded',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitWritingToBackend({ content: 'A short engineering draft.' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8787/api/v1/writing/submit',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
        body: JSON.stringify({ content: 'A short engineering draft.' }),
      })
    );
    expect(result?.score).toBe(82);
    expect(result?.feedback).toEqual({ grammar: 'Watch your verb tenses.' });
  });

  it('does not send a promptId field, since local and backend prompt catalogs are unrelated', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    await submitWritingToBackend({ content: 'draft text' });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({ content: 'draft text' });
    expect(body.promptId).toBeUndefined();
  });

  it('returns null when the backend responds with a non-OK status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitWritingToBackend({ content: 'draft' });

    expect(result).toBeNull();
  });

  it('returns null (never throws) when the network call fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitWritingToBackend({ content: 'draft' })).resolves.toBeNull();
  });
});
