export interface SpeakingAudioUploadResult {
  audioUrl: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface SpeakingAudioUploadOptions {
  /** Base API URL, e.g. '' for same-origin via Vite proxy, or a full backend URL. */
  apiBaseUrl?: string;
  /** Extra headers (auth, etc.) merged in -- callers supply their own auth. */
  authHeaders?: Record<string, string>;
  fetchImpl?: typeof fetch;
}

export class SpeakingAudioUploadError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'SpeakingAudioUploadError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Uploads a recorded audio Blob (from useMicRecorder) to the backend's
 * POST /api/speaking/audio-upload endpoint. Kademe 5.2 counterpart to
 * useMicRecorder's Kademe 5.1 capture step.
 */
export async function uploadSpeakingAudio(
  blob: Blob,
  options: SpeakingAudioUploadOptions = {}
): Promise<SpeakingAudioUploadResult> {
  const { apiBaseUrl = '', authHeaders = {}, fetchImpl = fetch } = options;

  if (!blob || blob.size === 0) {
    throw new SpeakingAudioUploadError(
      400,
      'empty_audio',
      'No audio was recorded to upload.'
    );
  }

  const contentType = blob.type || 'audio/webm';

  const response = await fetchImpl(`${apiBaseUrl}/api/speaking/audio-upload`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': contentType,
    },
    body: blob,
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errorBody = body as { error?: { code?: string; message?: string } };
    throw new SpeakingAudioUploadError(
      response.status,
      errorBody?.error?.code ?? 'upload_failed',
      errorBody?.error?.message ?? 'Audio upload failed.'
    );
  }

  return body as SpeakingAudioUploadResult;
}
