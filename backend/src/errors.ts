import type { ApiErrorResponse } from '../types.js';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const toErrorResponse = (
  error:
    | ApiError
    | (Error & { status?: number; code?: string; details?: unknown })
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
