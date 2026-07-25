import { useState, useCallback } from 'react';

interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

interface FieldConfig<T> {
  initialValue: T;
  rules?: ValidationRule<T>[];
  required?: boolean;
}

type FormConfig<T extends Record<string, unknown>> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

interface UseFormValidationReturn<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  handleBlur: <K extends keyof T>(field: K) => void;
  validateField: <K extends keyof T>(field: K) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  getFieldProps: <K extends keyof T>(field: K) => {
    value: T[K];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean;
    'aria-describedby': string;
  };
}

/**
 * Form validation hook with Zod-like validation.
 *
 * @example
 * const { values, errors, getFieldProps, isValid } = useFormValidation({
 *   email: { initialValue: '', rules: [{ validate: (v) => v.includes('@'), message: 'Invalid email' }], required: true },
 *   password: { initialValue: '', rules: [{ validate: (v) => v.length >= 6, message: 'Too short' }], required: true },
 * });
 */
export const useFormValidation = <T extends Record<string, unknown>>(
  config: FormConfig<T>
): UseFormValidationReturn<T> => {
  const [values, setValuesState] = useState<T>(() => {
    const initial = {} as T;
    for (const key in config) {
      initial[key] = config[key].initialValue;
    }
    return initial;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [initialValues] = useState<T>(values);

  const validateField = useCallback(
    <K extends keyof T>(field: K): boolean => {
      const fieldConfig = config[field];
      if (!fieldConfig) return true;

      const value = values[field];

      // Required check
      if (fieldConfig.required) {
        if (value === '' || value === null || value === undefined) {
          setErrors((prev) => ({ ...prev, [field]: 'This field is required' }));
          return false;
        }
      }

      // Custom rules
      if (fieldConfig.rules) {
        for (const rule of fieldConfig.rules) {
          if (!rule.validate(value)) {
            setErrors((prev) => ({ ...prev, [field]: rule.message }));
            return false;
          }
        }
      }

      // Clear error
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      return true;
    },
    [config, values]
  );

  const validateAll = useCallback((): boolean => {
    let valid = true;
    for (const key in config) {
      if (!validateField(key)) {
        valid = false;
      }
    }
    return valid;
  }, [config, validateField]);

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));
      // Auto-validate on value change if touched
      if (touched[field]) {
        setTimeout(() => validateField(field), 0);
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    <K extends keyof T>(field: K) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field);
    },
    [validateField]
  );

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => {
      const fieldId = String(field);
      const errorId = `${fieldId}-error`;

      return {
        value: values[field],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(field, e.target.value as T[K]);
        },
        onBlur: () => handleBlur(field),
        'aria-invalid': Boolean(errors[field]),
        'aria-describedby': errors[field] ? errorId : '',
      };
    },
    [values, errors, setValue, handleBlur]
  );

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setValue,
    setValues: (newValues) => setValuesState((prev) => ({ ...prev, ...newValues })),
    handleBlur,
    validateField,
    validateAll,
    reset,
    getFieldProps,
  };
};
