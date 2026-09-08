import { describe, expect, it, vi } from 'vitest';

import { SpeakingAudioUploadError, uploadSpeakingAudio } from './speaking-audio-upload.service';

const makeBlob = (content = 'fake-audio-bytes') => new Blob([content], { type: 'audio/webm' });

describe('uploadSpeakingAudio', () => {
  it('rejects an empty blob without making a network call', async () => {
    const fetchImpl = vi.fn();
    await expect(uploadSpeakingAudio(new Blob([]), { fetchImpl })).rejects.toThrow(
      SpeakingAudioUploadError
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('posts the blob with the correct method and content-type', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          audioUrl: '/uploads/speaking/user-1/abc.webm',
          sizeBytes: 16,
          uploadedAt: '2026-07-26T00:00:00.000Z',
        },
        meta: { contractVersion: '2026-09-07.v1' },
      }),
    });

    const result = await uploadSpeakingAudio(makeBlob(), {
      apiBaseUrl: 'http://localhost:8787',
      authHeaders: { Authorization: 'Bearer test-token' },
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:8787/api/v1/speaking/audio-upload',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'audio/webm',
        }),
      })
    );
    expect(result.audioUrl).toBe('/uploads/speaking/user-1/abc.webm');
  });

  it('rejects a legacy unversioned success payload', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        audioUrl: '/uploads/speaking/user-1/legacy.webm',
        sizeBytes: 16,
        uploadedAt: '2026-07-26T00:00:00.000Z',
      }),
    });

    await expect(uploadSpeakingAudio(makeBlob(), { fetchImpl })).rejects.toMatchObject({
      status: 502,
      code: 'invalid_response_contract',
    });
  });

  it('throws SpeakingAudioUploadError with the server-provided code on failure', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 413,
      json: async () => ({
        error: { code: 'audio_too_large', message: 'Too big' },
      }),
    });

    await expect(uploadSpeakingAudio(makeBlob(), { fetchImpl })).rejects.toMatchObject({
      status: 413,
      code: 'audio_too_large',
    });
  });

  it('falls back to a generic error when the failure response has no JSON body', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json');
      },
    });

    await expect(uploadSpeakingAudio(makeBlob(), { fetchImpl })).rejects.toMatchObject({
      status: 500,
      code: 'upload_failed',
    });
  });
});
