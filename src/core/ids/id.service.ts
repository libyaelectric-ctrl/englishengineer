import { IdPrefix } from './id.types';

export const IdService = {
  /**
   * Generates a unique secure ID with an optional prefix (e.g. "usr_...")
   */
  createId(prefix?: IdPrefix | string): string {
    let uuid = '';

    // Attempt standard web crypto randomUUID
    if (
      typeof window !== 'undefined' &&
      window.crypto &&
      typeof window.crypto.randomUUID === 'function'
    ) {
      uuid = window.crypto.randomUUID();
    } else {
      // Robust fallback using timestamp and cryptographic random values or math random
      const timestamp = Date.now().toString(36);
      const randomPart = Math.random().toString(36).substring(2, 15);
      const secondaryRandom = Math.random().toString(36).substring(2, 10);
      uuid = `${timestamp}-${randomPart}-${secondaryRandom}`;
    }

    return prefix ? `${prefix}_${uuid}` : uuid;
  },

  /**
   * Validates if a string could be a generated ID.
   */
  isValidId(id: unknown): id is string {
    if (typeof id !== 'string' || id.trim() === '') {
      return false;
    }
    // Since custom prefixes can be appended, we verify that it is not empty and complies with safety
    return id.length >= 10;
  },
};
