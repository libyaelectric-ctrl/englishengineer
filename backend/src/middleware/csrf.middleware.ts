import type { NextFunction, Request, Response } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';

import { logger } from '../logger.js';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'eos_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Simple cookie parser (avoids cookie-parser dependency).
 */
const parseCookies = (req: Request): Record<string, string> => {
  const header = req.headers.cookie;
  if (!header) return {};
  const cookies: Record<string, string> = {};
  for (const pair of header.split(';')) {
    const [key, ...rest] = pair.split('=');
    if (key) {
      cookies[key.trim()] = rest.join('=').trim();
    }
  }
  return cookies;
};

/**
 * Generates a cryptographically secure CSRF token.
 */
export const generateCsrfToken = (): string => {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
};

/**
 * Compares two CSRF tokens using timing-safe comparison.
 */
const tokensMatch = (a: string, b: string): boolean => {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
};

const isCsrfExempt = (req: Request): boolean =>
  req.path === '/api/health' ||
  req.path === '/api/v1/health' ||
  req.path === '/api/webhooks/stripe' ||
  req.path === '/api/webhooks/dodo';

const isStateChangingMethod = (method: string): boolean =>
  method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH';

/**
 * CSRF middleware using Double Submit Cookie pattern.
 *
 * - On GET requests: sets a CSRF cookie if not present
 * - On POST/PUT/DELETE requests: validates the token from header matches cookie
 * - Exempts: Stripe webhooks (raw body), health checks, GET requests
 * - Skipped ONLY in the automated test environment (NODE_ENV=test)
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'test') {
    next();
    return;
  }

  if (!isStateChangingMethod(req.method) || isCsrfExempt(req)) {
    if (req.method === 'GET') {
      const cookies = parseCookies(req);
      if (!cookies[CSRF_COOKIE_NAME]) {
        res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 3600000,
        });
      }
    }
    next();
    return;
  }

  const cookies = parseCookies(req);
  const cookieToken = cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!cookieToken || !headerToken) {
    logger.warn('CSRF token missing', {
      path: req.path,
      method: req.method,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
    });
    res.status(403).json({
      error: {
        code: 'csrf_token_missing',
        message: 'CSRF token is required for this request.',
      },
    });
    return;
  }

  if (!tokensMatch(cookieToken, headerToken)) {
    logger.warn('CSRF token mismatch', {
      path: req.path,
      method: req.method,
    });
    res.status(403).json({
      error: {
        code: 'csrf_token_invalid',
        message: 'CSRF token is invalid.',
      },
    });
    return;
  }

  next();
};
