/**
 * EngVoxStorageManager
 * Centralized, unified storage helper for managing client preferences
 * and application state under a single engvox_state_v4 root key.
 */
import { storage } from '@/shared/storage';

export interface EngVoxClientState {
  soundMuted: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
  workToolsPrefs: Record<string, unknown>;
  lastActiveRoute: string;
}

const STORAGE_KEY = 'engvox_state_v4';

const defaultState: EngVoxClientState = {
  soundMuted: false,
  language: 'en',
  theme: 'dark',
  workToolsPrefs: {},
  lastActiveRoute: '/dashboard',
};

export const EngVoxStorageManager = {
  getState(): EngVoxClientState {
    const saved = storage.globalGet<Partial<EngVoxClientState>>(STORAGE_KEY);
    return { ...defaultState, ...saved };
  },

  updateState(partial: Partial<EngVoxClientState>): EngVoxClientState {
    const current = this.getState();
    const next = { ...current, ...partial };
    storage.globalSet(STORAGE_KEY, next);
    return next;
  },

  get<K extends keyof EngVoxClientState>(key: K): EngVoxClientState[K] {
    return this.getState()[key];
  },

  set<K extends keyof EngVoxClientState>(
    key: K,
    value: EngVoxClientState[K]
  ): void {
    this.updateState({ [key]: value });
  },

  clear(): void {
    storage.globalRemove(STORAGE_KEY);
  },
};
