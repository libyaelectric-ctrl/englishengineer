import type { ApiErrorResponse } from '../types.js';
import type { BackendErrorCode } from './contracts/error-codes.js';

export class ApiError extends Error {
  status: number;
  code: BackendErrorCode;
  details?: unknown;

  /**
   * `code` is the contract in `contracts/error-codes.ts`: a code that is not declared
   * there does not compile, so the set of codes the client may have to classify cannot
   * grow behind its back.
   */
  constructor(status: number, code: BackendErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const toErrorResponse = (
  error: ApiError | (Error & { status?: number; code?: string; details?: unknown })
): { status: number; body: ApiErrorResponse } => {
  if (error instanceof ApiError || error.name === 'ApiError') {
    const apiErr = error as ApiError;
    return {
      status: apiErr.status,
      body: {
        ok: false,
        error: {
          code: apiErr.code,
          message: apiErr.message,
          ...(apiErr.details ? { details: apiErr.details } : {}),
        },
      },
    };
  }

  // Errors thrown by body-parser/raw-body (e.g. payload-too-large,
  // malformed body) use the standard `http-errors` shape: a numeric
  // `status`/`statusCode` plus a `type` string, but are not ApiError
  // instances. Surface their real HTTP status instead of defaulting to 500.
  const httpErrorStatus =
    typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : typeof (error as unknown as { statusCode?: unknown }).statusCode === 'number'
        ? (error as unknown as { statusCode: number }).statusCode
        : undefined;

  if (httpErrorStatus && httpErrorStatus >= 400 && httpErrorStatus < 500) {
    const errorType = (error as { type?: string }).type;
    return {
      status: httpErrorStatus,
      body: {
        ok: false,
        error: {
          code: errorType ?? 'request_error',
          message: error.message || 'The request could not be processed.',
        },
      },
    };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  return {
    status: 500,
    body: {
      ok: false,
      error: {
        code: 'internal_error',
        message: 'The backend could not complete the request.',
        ...(isProduction
          ? {}
          : {
              details: {
                name: error?.name,
                msg: error?.message,
              },
            }),
      },
    },
  };
};
