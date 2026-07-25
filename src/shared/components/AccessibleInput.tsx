import React from 'react';

interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text (required for accessibility) */
  label: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helper?: string;
  /** Whether the field is required */
  isRequired?: boolean;
}

/**
 * Accessible input with proper labels and error handling.
 * Automatically links label, input, error, and helper text via IDs.
 */
export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  helper,
  isRequired = false,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const hasError = Boolean(error);

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {isRequired && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        id={inputId}
        aria-required={isRequired}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? errorId : helper ? helperId : undefined
        }
        className={`
          block w-full rounded-md border px-3 py-2
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${hasError
            ? 'border-red-500 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 text-gray-900 placeholder-gray-400'
          }
          disabled:bg-gray-50 disabled:text-gray-500
          ${className}
        `}
        {...props}
      />

      {hasError && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {!hasError && helper && (
        <p id={helperId} className="text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  );
};
