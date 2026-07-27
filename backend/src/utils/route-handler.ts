import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors.js';
import { logger } from '../logger.js';

type AsyncHandler = (req: Request, res: Response) => Promise<unknown>;

/**
 * Wraps an async route handler with centralized error handling.
 * Eliminates repetitive try-catch blocks across route files.
 *
 * @example
 * router.get('/api/items', asyncHandler(async (req, res) => {
 *   const items = await service.getItems();
 *   res.json(items);
 * }));
 */
export const asyncHandler = (handler: AsyncHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      logger.e('Unhandled route error', {
        path: req.path,
        method: req.method,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred.',
        },
      });
    }
  };
};

/**
 * Validates required fields in request body.
 * Throws 400 if any field is missing or empty.
 *
 * @example
 * requireFields(req.body, ['email', 'password']);
 */
export const requireFields = (
  body: Record<string, unknown>,
  fields: string[]
): void => {
  const missing = fields.filter(
    (field) => !body[field] || (typeof body[field] === 'string' && !(body[field] as string).trim())
  );

  if (missing.length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}`);
  }
};

/**
 * Validates email format.
 * Throws 400 if invalid.
 */
export const validateEmail = (email: string): void => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid email format.');
  }
};

/**
 * Validates password strength.
 * Throws 400 if too short.
 */
export const validatePassword = (password: string, minLength = 6): void => {
  if (password.length < minLength) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Password must be at least ${minLength} characters.`);
  }
};

/**
 * Extracts pagination params from query string.
 * Returns defaults if not provided.
 */
export const getPagination = (query: Record<string, string>) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};
