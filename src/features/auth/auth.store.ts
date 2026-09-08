import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { logger } from '@/shared/logger';
import { setAuthTokenGetter } from '@/shared/services/auth-backend/backend-auth.service';
import { storage, type ClientSessionKind } from '@/shared/storage';
import type { AuthState, UserProfile } from '@/shared/types/auth.types';
const SESSION_KEY = 'auth_session_v2';
type LocalSessionKind = Extract<ClientSessionKind, 'local' | 'demo'>;
interface PersistedLocalSession { kind: LocalSessionKind; user: UserProfile; }
interface AuthActions { sessionKind: ClientSessionKind | null; logout: () => Promise<void>; updateProfile: (updates: Partial<UserProfile>) => Promise<void>; loginAsLocal: (userData: { email: string; displayName?: string; discipline?: string }) => UserProfile; enterDemoUser: () => UserProfile; setProviderUserSync: (fn: ((updates: Partial<UserProfile>) => Promise<void>) | null) => void; setProviderSignOut: (fn: (() => Promise<void>) | null) => void; }
const readInitialSession = (): PersistedLocalSession | null => {
  const saved = storage.globalGet<PersistedLocalSession>(SESSION_KEY);
  if (!saved || !['local', 'demo'].includes(saved.kind) || !saved.user?.id) { if (saved) storage.globalRemove(SESSION_KEY); return null; }
  storage.activateSession({ userId: saved.user.id, kind: saved.kind });
  storage.globalRemove('auth_user');
  return saved;
};
const initialSession = readInitialSession();
const persistLocalSession = (kind: LocalSessionKind, user: UserProfile): void => { storage.globalSet(SESSION_KEY, { kind, user } satisfies PersistedLocalSession); };
const activateProfile = (profile: UserProfile, kind: LocalSessionKind): void => {
  setAuthTokenGetter(null);
  storage.activateSession({ userId: profile.id, kind });
  storage.globalRemove('auth_user');
  persistLocalSession(kind, profile);
  // Deliberately does NOT write discipline/interfaceLanguage/onboardingCompleted
  // here. Doing so used to force onboardingCompleted: true immediately, which
  // made OnboardingGate's hasDiscipline/hasLanguage/onboardingCompleted check
  // pass instantly and skip straight past the discipline+language picker
  // (NeuralOrbPanel) into the app — for demo and local sessions alike. Both
  // paths must go through the same picker as a real sign-in.
};
export const useAuthStore = create<AuthState & AuthActions>()(devtools((set) => ({
  currentUser: initialSession?.user ?? null, isAuthenticated: Boolean(initialSession), isLoading: false, sessionKind: initialSession?.kind ?? null, providerUserSync: null, providerSignOut: null,
  loginAsLocal: (userData) => { const email = userData.email.trim().toLowerCase(); const userId = `eng_${email.replace(/[^a-zA-Z0-9]/g, '_')}`; const displayName = userData.displayName || email.split('@')[0] || 'Engineer'; const profile: UserProfile = { id: userId, displayName, email, role: 'engineer', isSuperUser: false, engineeringDiscipline: userData.discipline || 'electrical', targetLevel: 'B2', location: '', avatarInitials: displayName.slice(0, 2).toUpperCase(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; activateProfile(profile, 'local'); set({ currentUser: profile, isAuthenticated: true, isLoading: false, sessionKind: 'local', providerUserSync: null, providerSignOut: null }); return profile; },
  enterDemoUser: () => { const profile: UserProfile = { id: `demo_engineer_${Date.now()}`, displayName: 'Demo Engineer', email: 'demo@engvox.com', role: 'engineer', isSuperUser: false, engineeringDiscipline: 'electrical', targetLevel: 'B2', location: '', avatarInitials: 'DE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; activateProfile(profile, 'demo'); set({ currentUser: profile, isAuthenticated: true, isLoading: false, sessionKind: 'demo', providerUserSync: null, providerSignOut: null }); return profile; },
  logout: async () => { set({ isLoading: true }); const providerSignOut = useAuthStore.getState().providerSignOut; try { if (providerSignOut) await providerSignOut(); } catch (error) { logger.e('Provider sign-out failed; local session will still be cleared.', error); } finally { setAuthTokenGetter(null); storage.deactivateSession(); storage.globalRemove(SESSION_KEY); storage.globalRemove('auth_user'); set({ currentUser: null, isAuthenticated: false, isLoading: false, sessionKind: null, providerUserSync: null, providerSignOut: null }); } },
  updateProfile: async (updates) => { const current = useAuthStore.getState().currentUser; if (!current) return; const updated = { ...current, ...updates, updatedAt: new Date().toISOString() }; set({ currentUser: updated }); const kind = useAuthStore.getState().sessionKind; if (kind === 'local' || kind === 'demo') persistLocalSession(kind, updated); const sync = useAuthStore.getState().providerUserSync; if (sync && updates.displayName) { try { await sync(updates); } catch (error) { logger.w('Auth provider profile sync failed.', error); } } },
  setProviderUserSync: (providerUserSync) => set({ providerUserSync }), setProviderSignOut: (providerSignOut) => set({ providerSignOut }),
}), { name: 'AuthStore' }));
export default useAuthStore;
