import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

/**
 * Correlation ID header name used across the application.
 */
export const CORRELATION_ID_HEADER = 'x-request-id';

/**
 * Middleware that ensures every request has a unique correlation ID.
 *
 * - If the client sends an `X-Request-Id` header, it is reused (useful for
 *   distributed tracing across frontend → backend → external services).
 * - Otherwise a new UUID v4 is generated.
 * - The ID is set on `req.id` and echoed back in the response header.
 */
export const correlationId = (req: Request, res: Response, next: NextFunction): void => {
  const existing = req.headers[CORRELATION_ID_HEADER] as string | undefined;
  const id = (existing && existing.trim()) || randomUUID();

  // Store on request object for downstream middleware / route handlers
  req.id = id;

  // Echo back to the client
  res.setHeader(CORRELATION_ID_HEADER, id);

  next();
};
