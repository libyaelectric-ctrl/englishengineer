export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: string;
  engineeringDiscipline: string;
  targetLevel: string;
  location: string;
  avatarInitials: string;
  createdAt: string;
  updatedAt: string;
  isSuperUser?: boolean;
}

export interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /**
   * Registered by <FirebaseBridge> while a Firebase session is active. Called
   * by updateProfile() so display-field edits (e.g. displayName) are persisted
   * to the Firebase account, not just the in-memory store.
   */
  providerUserSync?: ((updates: Partial<UserProfile>) => Promise<void>) | null;
  /**
   * Registered by <FirebaseBridge> while a Firebase session is active. Called
   * by logout() so the Sign Out action also ends the Firebase session,
   * otherwise the user is bounced back to a guard that waits on a session
   * that never clears.
   */
  providerSignOut?: (() => Promise<void>) | null;
}
