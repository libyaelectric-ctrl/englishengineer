import { ApiError } from '../errors.js';
import { logger } from '../logger.js';
import type { Request, Response, NextFunction } from 'express';
import type { BackendConfig } from '../../types.js';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export const toErrorResponse = (error: unknown): ErrorResponse => {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'internal_error',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred.'
            : error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'internal_error',
      message: 'An unexpected error occurred.',
    },
  };
};

export const createErrorHandler =
  (config: BackendConfig) =>
  (
    error: unknown,
    request: Request,
    response: Response,
    _next: NextFunction
  ): void => {
    logger.error(
      'Unhandled API error',
      { path: request.path },
      error instanceof Error ? error : undefined
    );

    const mapped = toErrorResponse(error);
    const statusCode = error instanceof ApiError ? error.status : 500;

    response.status(statusCode).json(mapped);
  };
