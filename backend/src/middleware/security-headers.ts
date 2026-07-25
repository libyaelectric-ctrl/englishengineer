import type { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware.
 * Adds additional security headers beyond Helmet.
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // HSTS (if HTTPS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Cache Control for API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
  }

  next();
};

/**
 * Request ID middleware.
 * Adds a unique request ID to each request for tracing.
 */
export const requestId = (
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
 * Adds response time header.
 */
export const responseTime = (
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
