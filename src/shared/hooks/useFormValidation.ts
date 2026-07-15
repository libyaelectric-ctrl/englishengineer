import { useState, useCallback } from 'react';

interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

interface FieldConfig {
  rules: ValidationRule[];
}

type FormConfig = Record<string, FieldConfig>;

interface FormErrors {
  [key: string]: string | null;
}

export const useFormValidation = (config: FormConfig) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (name: string, value: unknown): string | null => {
      const fieldConfig = config[name];
      if (!fieldConfig) return null;

      for (const rule of fieldConfig.rules) {
        if (!rule.validate(value)) {
          return rule.message;
        }
      }
      return null;
    },
    [config]
  );

  const validate = useCallback(
    (values: Record<string, unknown>): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      for (const [name, value] of Object.entries(values)) {
        const error = validateField(name, value);
        newErrors[name] = error;
        if (error) isValid = false;
      }

      setErrors(newErrors);
      return isValid;
    },
    [validateField]
  );

  const setFieldTouched = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const getFieldError = useCallback(
    (name: string): string | null => {
      return touched[name] ? errors[name] || null : null;
    },
    [touched, errors]
  );

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return { errors, touched, validate, setFieldTouched, getFieldError, reset };
};

// Common validation rules
export const rules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => value !== null && value !== undefined && value !== '',
    message,
  }),
  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === 'string' && value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),
  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === 'string' && value.length <= max,
    message: message || `Must be at most ${max} characters`,
  }),
  email: (message = 'Invalid email address'): ValidationRule => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
    message,
  }),
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => regex.test(String(value)),
    message,
  }),
};
