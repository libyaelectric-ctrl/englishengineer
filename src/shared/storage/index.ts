import { logger } from '@/shared/logger';

export const STORAGE_CHANGE_EVENT = 'EngVox:storage-change';
export const SESSION_NAMESPACE_EVENT = 'EngVox:session-namespace';
export type ClientSessionKind = 'firebase' | 'local' | 'demo';
export interface ClientSession { userId: string; kind: ClientSessionKind; }
export type StorageNamespaceSnapshot = Record<string, unknown>;

let currentSession: ClientSession | null = null;
const SENSITIVE_LEGACY_KEYS = ['learning_state', 'EngVox_workspaces', 'ai_coach_pro_state', 'billing_subscription', 'learning_intelligence'];
const sessionPrefix = (session: ClientSession): string => `session_${session.kind}_${encodeURIComponent(session.userId)}_`;
const notify = (name: string, detail: unknown): void => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(name, { detail })); };
const fullKey = (key: string): string | null => currentSession ? `eos_${sessionPrefix(currentSession)}${key}` : null;

const migrateLegacyData = (session: ClientSession): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const marker = `eos_${sessionPrefix(session)}__migration_v1`;
  if (localStorage.getItem(marker)) return;
  const newPrefix = `eos_${sessionPrefix(session)}`;
  const oldPrefix = `eos_user_${session.userId}_`;
  const moves: Array<[string, string]> = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(oldPrefix)) moves.push([key, `${newPrefix}${key.slice(oldPrefix.length)}`]);
  }
  const legacyAuth = storage.globalGet<{ id?: string }>('auth_user');
  if (legacyAuth?.id === session.userId) for (const key of SENSITIVE_LEGACY_KEYS) moves.push([`eos_${key}`, `${newPrefix}${key}`]);
  for (const [source, target] of moves) {
    const value = localStorage.getItem(source);
    if (value !== null && localStorage.getItem(target) === null) localStorage.setItem(target, value);
    if (value !== null) localStorage.removeItem(source);
  }
  localStorage.setItem(marker, JSON.stringify({ migratedAt: new Date().toISOString() }));
};

export const storage = {
  activateSession(session: ClientSession): void {
    if (!session.userId.trim()) throw new Error('A non-empty user ID is required.');
    if (currentSession?.userId === session.userId && currentSession.kind === session.kind) return;
    const previous = currentSession;
    currentSession = null;
    notify(SESSION_NAMESPACE_EVENT, { phase: 'cleared', previous, current: null });
    currentSession = { userId: session.userId, kind: session.kind };
    migrateLegacyData(currentSession);
    notify(SESSION_NAMESPACE_EVENT, { phase: 'activated', previous, current: currentSession });
    logger.i(`[STORAGE] Session namespace activated: ${session.kind}`);
  },
  deactivateSession(): void {
    const previous = currentSession;
    currentSession = null;
    notify(SESSION_NAMESPACE_EVENT, { phase: 'cleared', previous, current: null });
  },
  setUserId(userId: string | null): void { if (userId) storage.activateSession({ userId, kind: 'firebase' }); else storage.deactivateSession(); },
  getUserId(): string | null { return currentSession?.userId ?? null; },
  getSession(): ClientSession | null { return currentSession ? { ...currentSession } : null; },
  globalSet<T>(key: string, value: T): boolean { try { if (typeof window === 'undefined' || !window.localStorage) return false; localStorage.setItem(`eos_${key}`, JSON.stringify(value)); return true; } catch (error) { logger.w(`[STORAGE] Failed global write "${key}"`, error); return false; } },
  globalGet<T>(key: string): T | null { try { if (typeof window === 'undefined' || !window.localStorage) return null; const value = localStorage.getItem(`eos_${key}`); return value ? JSON.parse(value) as T : null; } catch (error) { logger.w(`[STORAGE] Failed global read "${key}"`, error); return null; } },
  globalRemove(key: string): boolean { try { if (typeof window === 'undefined' || !window.localStorage) return false; localStorage.removeItem(`eos_${key}`); return true; } catch (error) { logger.w(`[STORAGE] Failed global remove "${key}"`, error); return false; } },
  isAvailable(): boolean { try { if (typeof window === 'undefined' || !window.localStorage) return false; const key = '__eos_storage_test__'; localStorage.setItem(key, '1'); localStorage.removeItem(key); return true; } catch { return false; } },
  set<T>(key: string, value: T): boolean { const target = fullKey(key); if (!target || typeof window === 'undefined' || !window.localStorage) return false; try { localStorage.setItem(target, JSON.stringify(value)); notify(STORAGE_CHANGE_EVENT, { key }); return true; } catch (error) { logger.w(`[STORAGE] Failed scoped write "${key}"`, error); return false; } },
  get<T>(key: string): T | null { const target = fullKey(key); if (!target || typeof window === 'undefined' || !window.localStorage) return null; try { const value = localStorage.getItem(target); return value ? JSON.parse(value) as T : null; } catch (error) { logger.w(`[STORAGE] Failed scoped read "${key}"`, error); return null; } },
  remove(key: string): boolean { const target = fullKey(key); if (!target || typeof window === 'undefined' || !window.localStorage) return false; try { localStorage.removeItem(target); notify(STORAGE_CHANGE_EVENT, { key }); return true; } catch { return false; } },
  exportAll(): StorageNamespaceSnapshot { const snapshot: StorageNamespaceSnapshot = {}; if (!currentSession || typeof window === 'undefined' || !window.localStorage) return snapshot; const prefix = `eos_${sessionPrefix(currentSession)}`; for (let index = 0; index < localStorage.length; index += 1) { const key = localStorage.key(index); if (!key?.startsWith(prefix)) continue; const value = localStorage.getItem(key); if (value === null) continue; try { snapshot[key.slice(prefix.length)] = JSON.parse(value) as unknown; } catch { snapshot[key.slice(prefix.length)] = value; } } return snapshot; },
  clear(): void { if (!currentSession || typeof window === 'undefined' || !window.localStorage) return; const prefix = `eos_${sessionPrefix(currentSession)}`; const keys: string[] = []; for (let index = 0; index < localStorage.length; index += 1) { const key = localStorage.key(index); if (key?.startsWith(prefix)) keys.push(key); } keys.forEach((key) => localStorage.removeItem(key)); notify(STORAGE_CHANGE_EVENT, { key: '*' }); },
};
