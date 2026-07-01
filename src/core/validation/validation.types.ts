export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
}
