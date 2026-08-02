import { logger } from '@/shared/logger';

import { storage } from '@/shared/storage';

const BYPASS_STORAGE_KEY = 'engvox_progression_bypass_unlocked';
const VALIDATION_KEY = 'engvox_progression_bypass_validated';
const BYPASS_SESSION_TTL_MS = 60 * 60 * 1000;

let bypassValidatedAt: number | null = null;

export const isProgressionBypassed = (): boolean => {
  try {
    if (storage.get<string>(BYPASS_STORAGE_KEY) !== 'true') return false;
    if (bypassValidatedAt === null) {
      const stored = storage.get<string>(VALIDATION_KEY);
      bypassValidatedAt = stored ? parseInt(stored, 10) || 0 : 0;
    }
    if (Date.now() - bypassValidatedAt > BYPASS_SESSION_TTL_MS) {
      logger.w('[PROGRESSION] Client-side bypass expired — server validation required');
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const setProgressionBypassed = (unlocked: boolean = true): void => {
  try {
    if (unlocked) {
      bypassValidatedAt = Date.now();
      storage.set(VALIDATION_KEY, String(bypassValidatedAt));
    } else {
      bypassValidatedAt = null;
      storage.remove(VALIDATION_KEY);
    }
    storage.set(BYPASS_STORAGE_KEY, String(unlocked));
    window.dispatchEvent(new Event('engvox_progression_updated'));
  } catch {
    // ignore
  }
};

export const requiresServerProgressionValidation = (): boolean => true;
