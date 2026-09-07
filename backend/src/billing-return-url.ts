import type { RuntimeEnvironment } from '../types.js';
import { ApiError } from './errors.js';

export interface BillingReturnUrlPolicy { environment: RuntimeEnvironment; allowedOrigins: readonly string[]; }
const toOrigin = (value: string): string | null => {
  try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : null; } catch { return null; }
};
export const validateBillingReturnUrl = (value: string, fieldName: string, policy: BillingReturnUrlPolicy): string => {
  let url: URL;
  try { url = new URL(value); } catch { throw new ApiError(400, 'invalid_return_url', `${fieldName} must be a valid absolute URL.`); }
  if (url.username || url.password) throw new ApiError(400, 'invalid_return_url', `${fieldName} must not contain credentials.`);
  if (!['http:', 'https:'].includes(url.protocol)) throw new ApiError(400, 'invalid_return_url', `${fieldName} must use HTTP or HTTPS.`);
  if (policy.environment === 'production' && url.protocol !== 'https:') throw new ApiError(400, 'invalid_return_url', `${fieldName} must use HTTPS in production.`);
  const allowedOrigins = new Set(policy.allowedOrigins.map(toOrigin).filter((origin): origin is string => origin !== null));
  if (!allowedOrigins.has(url.origin)) throw new ApiError(400, 'invalid_return_url', `${fieldName} origin is not allowed.`);
  return url.toString();
};
