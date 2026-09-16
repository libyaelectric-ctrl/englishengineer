import { ErrorCode } from '@/core/errors/error-codes';

/**
 * The backend answers failures with a structured envelope:
 * `{ ok: false, error: { code, message, details? } }`.
 *
 * Clients keep the `code`. Deriving one from the HTTP status instead — or
 * matching the human sentence — is what forces every downstream decision
 * (retry, copy, severity) to read prose.
 */
export interface BackendApiError {
  message: string;
  /** The backend's own machine-readable code, e.g. `audit_log_unavailable`. */
  apiCode?: string;
}

/** Reads the backend's error envelope without losing its code. */
export const parseApiErrorResponse = async (response: Response): Promise<BackendApiError> => {
  try {
    const data = (await response.json()) as Record<string, unknown>;
    const envelope = data.error;
    if (typeof envelope === 'string') return { message: envelope };
    if (envelope && typeof envelope === 'object') {
      const error = envelope as Record<string, unknown>;
      const message = typeof error.message === 'string' ? error.message : undefined;
      const apiCode = typeof error.code === 'string' ? error.code : undefined;
      if (message) return { message, apiCode };
    }
    if (typeof data.message === 'string') return { message: data.message };
  } catch {
    /* not JSON — fall through to the status line */
  }
  return { message: `API ${response.status}: ${response.statusText}` };
};

/** HTTP statuses that are worth another attempt; a 4xx is not one of them. */
export const RETRYABLE_STATUSES: ReadonlySet<number> = new Set([408, 425, 429, 500, 502, 503, 504]);

/**
 * The coarse client-side class, used for severity and retry decisions. The
 * backend's own code travels alongside it in `AppError.apiCode`; this value must
 * never be the only thing a caller can act on.
 */
export const classifyHttpStatus = (status: number): ErrorCode => {
  if (status === 401 || status === 403) return ErrorCode.AUTH;
  if (status === 400 || status === 409 || status === 422) return ErrorCode.VALIDATION;
  return ErrorCode.NETWORK;
};
