import type { AuthenticatedUser } from '../types.js';

declare global {
  namespace Express {
    interface Request {
      validatedBody?: Record<string, unknown>;
      validatedQuery?: Record<string, unknown>;
      auth?: AuthenticatedUser;
      i18n?: {
        lang: string;
        t: (key: string) => string;
      };
    }
  }
}

export {};
