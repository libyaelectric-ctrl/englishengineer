import type { NextFunction, Request, Response } from 'express';

/**
 * Characters and patterns that are commonly used for XSS / injection attacks.
 * We strip null bytes, script tags, and event handler attributes.
 */
const DANGEROUS_PATTERNS = [
  /\0/g, // null bytes
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // <script> blocks
  /on\w+\s*=/gi, // onclick=, onerror=, etc.
  /javascript:/gi, // javascript: URLs
  /data:text\/html/gi, // data: URI XSS
  /<iframe\b/gi, // iframe injection
  /<object\b/gi, // object injection
  /<embed\b/gi, // embed injection
];

/**
 * Recursively sanitize all string values in an object.
 */
const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    let sanitized = value;
    for (const pattern of DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    // Length limits are enforced per-field by Zod schemas in validation.ts
    // (with proper 400 error responses), and the request body as a whole is
    // capped by express.json({ limit: '256kb' }) in app.ts. Truncating here
    // would silently corrupt legitimate large fields (e.g. saved documents)
    // instead of validating or rejecting them properly.
    return sanitized;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = sanitizeValue(val);
    }
    return result;
  }
  return value;
};

/**
 * Middleware that sanitizes request body, query, and params to prevent
 * XSS and injection attacks. Runs before route handlers.
 */
export const inputSanitization = (req: Request, _res: Response, next: NextFunction): void => {
  // Webhook routes (Stripe/Dodo) use express.raw() to preserve the exact
  // bytes needed for signature verification — a Buffer must pass through
  // untouched. (Buffer is `typeof 'object'`, so without this check it would
  // fall into the generic object branch below and get destructured via
  // Object.entries into a plain {0: byte, 1: byte, ...} object.)
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    req.body = sanitizeValue(req.body);
  }
  // Express 5's `req.query` is a getter-only property computed from the URL
  // (no setter), so `req.query = ...` throws. Sanitize its keys in place on
  // the existing object instead of replacing the reference.
  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = sanitizeValue(req.query) as Record<string, unknown>;
    for (const key of Object.keys(req.query as Record<string, unknown>)) {
      delete (req.query as Record<string, unknown>)[key];
    }
    Object.assign(req.query as Record<string, unknown>, sanitizedQuery);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params) as Record<string, string>;
  }
  next();
};
