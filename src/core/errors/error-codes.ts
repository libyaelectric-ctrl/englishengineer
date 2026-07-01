export enum ErrorCode {
  UNKNOWN = 'error.unknown',
  VALIDATION = 'error.validation',
  STORAGE = 'error.storage',
  NETWORK = 'error.network',
  AUTH = 'error.auth',
  AI = 'error.ai',
  LEARNING = 'error.learning',
  ANALYTICS = 'error.analytics',
  SYNC = 'error.sync',
}

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';
