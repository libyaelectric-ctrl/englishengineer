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

const MAX_STRING_LENGTH = 10_000;

/**
 * Recursively sanitize all string values in an object.
 */
const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    let sanitized = value;
    for (const pattern of DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    // Truncate overly long strings (possible abuse)
    if (sanitized.length > MAX_STRING_LENGTH) {
      sanitized = sanitized.slice(0, MAX_STRING_LENGTH);
    }
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
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query) as Record<string, string>;
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params) as Record<string, string>;
  }
  next();
};
