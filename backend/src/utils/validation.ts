import { ApiError } from '../errors.js';

/**
 * Validates a string is not empty after trimming.
 * Throws 400 if empty.
 */
export const requireString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} is required and cannot be empty.`);
  }
  return value.trim();
};

/**
 * Validates a value is a positive integer.
 * Throws 400 if invalid.
 */
export const requirePositiveInt = (value: unknown, fieldName: string): number => {
  const num = parseInt(String(value), 10);
  if (isNaN(num) || num < 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be a positive integer.`);
  }
  return num;
};

/**
 * Validates a value is a valid UUID.
 * Throws 400 if invalid.
 */
export const requireUUID = (value: unknown, fieldName: string): string => {
  const str = requireString(value, fieldName);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(str)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be a valid UUID.`);
  }
  return str;
};

/**
 * Validates a value is one of the allowed values.
 * Throws 400 if invalid.
 */
export const requireEnum = <T extends string>(
  value: unknown,
  fieldName: string,
  allowed: readonly T[]
): T => {
  const str = requireString(value, fieldName);
  if (!allowed.includes(str as T)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be one of: ${allowed.join(', ')}`);
  }
  return str as T;
};

/**
 * Validates a string length is within bounds.
 * Throws 400 if out of bounds.
 */
export const requireLength = (
  value: string,
  fieldName: string,
  min: number,
  max: number
): string => {
  if (value.length < min || value.length > max) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be between ${min} and ${max} characters.`);
  }
  return value;
};

/**
 * Validates an email format.
 * Throws 400 if invalid.
 */
export const requireEmail = (value: unknown, fieldName = 'email'): string => {
  const str = requireString(value, fieldName);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be a valid email address.`);
  }
  return str;
};

/**
 * Validates a URL format.
 * Throws 400 if invalid.
 */
export const requireURL = (value: unknown, fieldName = 'url'): string => {
  const str = requireString(value, fieldName);
  try {
    new URL(str);
  } catch {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be a valid URL.`);
  }
  return str;
};
