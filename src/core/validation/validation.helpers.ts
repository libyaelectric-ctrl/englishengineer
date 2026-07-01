import { ValidationError, ValidationResult } from './validation.types';

export const validationHelpers = {
  /**
   * Asserts that a value is present (not undefined, null, or empty string).
   */
  required(value: unknown, field: string): ValidationError | null {
    if (value === undefined || value === null) {
      return {
        field,
        message: `${field} is a required field`,
        code: 'validation.required',
      };
    }
    if (typeof value === 'string' && value.trim() === '') {
      return {
        field,
        message: `${field} cannot be empty`,
        code: 'validation.required',
      };
    }
    return null;
  },

  /**
   * Asserts that a string value meets a minimum length requirement.
   */
  minLength(
    value: unknown,
    length: number,
    field: string
  ): ValidationError | null {
    if (typeof value !== 'string') {
      return {
        field,
        message: `${field} must be a valid text string`,
        code: 'validation.type_mismatch',
      };
    }
    if (value.length < length) {
      return {
        field,
        message: `${field} must be at least ${length} characters long`,
        code: 'validation.min_length',
      };
    }
    return null;
  },

  /**
   * Validates if a string value has a correct email pattern.
   */
  isEmail(value: unknown, field = 'email'): ValidationError | null {
    if (typeof value !== 'string') {
      return {
        field,
        message: `${field} must be a valid text string`,
        code: 'validation.type_mismatch',
      };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        field,
        message: `${field} must be a valid email address`,
        code: 'validation.email_invalid',
      };
    }
    return null;
  },
};

/**
 * Combines multiple validation checks and returns a complete ValidationResult.
 */
export function combineValidations(
  errors: (ValidationError | null)[]
): ValidationResult {
  const filteredErrors = errors.filter(
    (err): err is ValidationError => err !== null
  );
  return {
    isValid: filteredErrors.length === 0,
    errors: Object.freeze(filteredErrors),
  };
}
