import { IdPrefix } from './id.types';

const hexEncode = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

const secureRandomHex = (length: number): string => {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Last resort: Node.js crypto (SSR / test environments)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeCrypto = require('node:crypto');
      const buf = nodeCrypto.randomBytes(bytes.length);
      bytes.set(buf);
    } catch {
      // Should never happen in any JS runtime
      for (let i = 0; i < bytes.length; i++) bytes[i] = (Math.random() * 256) | 0;
    }
  }
  return hexEncode(bytes).substring(0, length);
};

export const IdService = {
  createId(prefix?: IdPrefix | string): string {
    let uuid = '';

    if (
      typeof globalThis.crypto?.randomUUID === 'function'
    ) {
      uuid = globalThis.crypto.randomUUID();
    } else {
      const ts = Date.now().toString(36);
      uuid = `${ts}-${secureRandomHex(12)}-${secureRandomHex(8)}`;
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
