import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
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

/**
 * CSRF middleware using Double Submit Cookie pattern.
 *
 * - On GET requests: sets a CSRF cookie if not present
 * - On POST/PUT/DELETE requests: validates the token from header matches cookie
 * - Exempts: Stripe webhooks (raw body), health checks, GET requests
 * - Skipped in test environment (NODE_ENV=test)
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip CSRF in test environment
  if (process.env.NODE_ENV === 'test') {
    next();
    return;
  }

  const isStateChanging =
    req.method === 'POST' ||
    req.method === 'PUT' ||
    req.method === 'DELETE' ||
    req.method === 'PATCH';

  // Exempt GET requests and health checks
  if (!isStateChanging || req.path === '/api/health' || req.path === '/api/v1/health') {
    // Set CSRF cookie on GET requests if not present
    const cookies = parseCookies(req);
    if (req.method === 'GET' && !cookies[CSRF_COOKIE_NAME]) {
      const token = generateCsrfToken();
      res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Frontend needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 3600000, // 1 hour
      });
    }
    next();
    return;
  }

  // Exempt Stripe webhooks (they use signature verification, not CSRF)
  if (req.path === '/api/webhooks/stripe') {
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
