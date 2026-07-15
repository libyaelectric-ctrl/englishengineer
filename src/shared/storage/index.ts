/**
 * Secure, generic, and type-safe wrapper around localStorage
 * with fallback mechanisms for safe environments.
 */
import { logger } from '@/shared/logger';

export const STORAGE_CHANGE_EVENT = 'EngVox:storage-change';
export type StorageNamespaceSnapshot = Record<string, unknown>;

// User-scoped namespace: all learning data is isolated per user
let currentUserId: string | null = null;

const getUserPrefix = (): string => {
  if (currentUserId) return `user_${currentUserId}_`;
  return '';
};

const notifyStorageChange = (key: string): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<{ key: string }>(STORAGE_CHANGE_EVENT, {
      detail: { key },
    })
  );
};

export const storage = {
  /**
   * Set the current user ID for scoped storage.
   * Call this on login; pass null on logout.
   */
  setUserId: (userId: string | null): void => {
    currentUserId = userId;
    logger.i(`[STORAGE] User namespace set to: ${userId ?? 'global'}`);
  },

  getUserId: (): string | null => currentUserId,

  /**
   * Global storage bypass — ignores user scoping.
   * Use for auth, billing, and cross-user data.
   */
  globalSet: <T>(k: string, v: T): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      localStorage.setItem(`eos_${k}`, JSON.stringify(v));
      return true;
    } catch (e) {
      logger.w(`[STORAGE] Failed to write global key "${k}":`, e);
      return false;
    }
  },

  globalGet: <T>(k: string): T | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const item = localStorage.getItem(`eos_${k}`);
      return item ? (JSON.parse(item) as T) : null;
    } catch (e) {
      logger.w(`[STORAGE] Failed to read global key "${k}":`, e);
      return null;
    }
  },

  globalRemove: (k: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      localStorage.removeItem(`eos_${k}`);
      return true;
    } catch (e) {
      logger.w(`[STORAGE] Failed to remove global key "${k}":`, e);
      return false;
    }
  },

  /**
   * Safe check to verify if localStorage is fully accessible and available.
   */
  isAvailable: (): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__eos_storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sets an item in storage under a user-scoped, namespace-prefixed key.
   */
  set: <T>(k: string, v: T): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const fullKey = `eos_${getUserPrefix()}${k}`;
      localStorage.setItem(fullKey, JSON.stringify(v));
      notifyStorageChange(k);
      return true;
    } catch (e) {
      logger.w(`[STORAGE] Failed to write key "${k}" to localStorage:`, e);
      return false;
    }
  },

  /**
   * Retrieves and parses an item from storage under a user-scoped, namespace-prefixed key.
   */
  get: <T>(k: string): T | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      const fullKey = `eos_${getUserPrefix()}${k}`;
      const item = localStorage.getItem(fullKey);
      if (!item) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (e) {
      logger.w(
        `[STORAGE] Failed to read/parse key "${k}" from localStorage:`,
        e
      );
      return null;
    }
  },

  /**
   * Removes an item from storage.
   */
  remove: (k: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const fullKey = `eos_${getUserPrefix()}${k}`;
      localStorage.removeItem(fullKey);
      notifyStorageChange(k);
      return true;
    } catch (e) {
      logger.w(
        `[STORAGE] Failed to remove key "${k}" from localStorage:`,
        e
      );
      return false;
    }
  },

  exportAll: (): StorageNamespaceSnapshot => {
    const snapshot: StorageNamespaceSnapshot = {};
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return snapshot;
      }
      const prefix = `eos_${getUserPrefix()}`;
      const keys: string[] = [];
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith(prefix)) keys.push(key);
      }
      keys.sort().forEach((key) => {
        const value = localStorage.getItem(key);
        if (value === null) return;
        const exportKey = key.slice(prefix.length);
        try {
          snapshot[exportKey] = JSON.parse(value) as unknown;
        } catch {
          snapshot[exportKey] = value;
        }
      });
    } catch (e) {
      logger.w('[STORAGE] Failed to export localized namespace:', e);
    }
    return snapshot;
  },

  /**
   * Completely clears the current user's namespace-prefixed items.
   */
  clear: (): void => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      const prefix = `eos_${getUserPrefix()}`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      notifyStorageChange('*');
    } catch (e) {
      logger.w('[STORAGE] Failed to clear localized namespace keys:', e);
    }
  },
};
