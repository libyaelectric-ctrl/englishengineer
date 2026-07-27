import type { Request, Response, NextFunction } from 'express';
import { logger } from '../logger.js';

interface RequestLog {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

/**
 * Request logging middleware.
 * Logs all API requests with timing and context.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  // Log request
  logger.i('Request started', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent']?.substring(0, 100),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log: RequestLog = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.auth?.userId,
      ip: req.ip || '',
      userAgent: req.headers['user-agent']?.substring(0, 100) || '',
      timestamp: new Date().toISOString(),
    };

    // Log level based on status code
    if (res.statusCode >= 500) {
      logger.e('Request failed', log as unknown as Record<string, unknown>);
    } else if (res.statusCode >= 400) {
      logger.w('Request error', log as unknown as Record<string, unknown>);
    } else {
      logger.i('Request completed', log as unknown as Record<string, unknown>);
    }

    // Log slow requests
    if (duration > 1000) {
      logger.w('Slow request detected', {
        ...log,
        threshold: 1000,
      });
    }
  });

  next();
};

/**
 * Request ID middleware.
 * Ensures each request has a unique ID for tracing.
 */
export const ensureRequestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId =
    (req.headers['x-request-id'] as string) ||
    `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
};

/**
 * Response time middleware.
 * Adds X-Response-Time header to all responses.
 */
export const responseTimeHeader = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });

  next();
};
