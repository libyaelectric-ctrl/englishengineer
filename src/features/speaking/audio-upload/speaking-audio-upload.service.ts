import { logger } from '@/shared/logger';
import { unwrapApiSuccess } from '@/shared/types/api-response';

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

const validateBlob = (blob: Blob | null | undefined): void => {
  if (!blob || blob.size === 0) {
    throw new SpeakingAudioUploadError(400, 'empty_audio', 'No audio was recorded to upload.');
  }
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch (e) {
    logger.w('[SPEAKING] Failed to parse upload response', e);
    return null;
  }
};

const handleErrorResponse = (response: Response, body: unknown): never => {
  const errorBody = body as { error?: { code?: string; message?: string } };
  throw new SpeakingAudioUploadError(
    response.status,
    errorBody?.error?.code ?? 'upload_failed',
    errorBody?.error?.message ?? 'Audio upload failed.'
  );
};

export async function uploadSpeakingAudio(
  blob: Blob,
  options: SpeakingAudioUploadOptions = {}
): Promise<SpeakingAudioUploadResult> {
  const { apiBaseUrl = '', authHeaders = {}, fetchImpl = fetch } = options;

  validateBlob(blob);

  const contentType = blob.type || 'audio/webm';

  const response = await fetchImpl(`${apiBaseUrl}/api/v1/speaking/audio-upload`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': contentType,
    },
    body: blob,
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    handleErrorResponse(response, body);
  }

  try {
    return unwrapApiSuccess<SpeakingAudioUploadResult>(body);
  } catch (error) {
    logger.w('[SPEAKING] Unsupported upload response contract', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new SpeakingAudioUploadError(
      502,
      'invalid_response_contract',
      'Audio upload returned an unsupported response contract.'
    );
  }
}
