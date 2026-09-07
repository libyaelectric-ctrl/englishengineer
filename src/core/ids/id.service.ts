import { IdPrefix } from './id.types';

const hexEncode = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const secureCrypto = (): Crypto => {
  const crypto = globalThis.crypto;
  if (!crypto || typeof crypto.getRandomValues !== 'function') {
    throw new Error('Secure random number generation is unavailable in this runtime.');
  }
  return crypto;
};

const secureRandomHex = (length: number): string => {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  secureCrypto().getRandomValues(bytes);
  return hexEncode(bytes).substring(0, length);
};

export const IdService = {
  createId(prefix?: IdPrefix | string): string {
    const crypto = secureCrypto();
    const uuid =
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${secureRandomHex(12)}-${secureRandomHex(8)}`;

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
