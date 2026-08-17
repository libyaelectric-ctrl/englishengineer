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
   * Registered by <ClerkBridge> while a Clerk session is active. Called by
   * updateProfile() so display-field edits (e.g. displayName) are persisted to
   * the Clerk account, not just the in-memory store.
   */
  clerkUserSync?: ((updates: Partial<UserProfile>) => Promise<void>) | null;
}
