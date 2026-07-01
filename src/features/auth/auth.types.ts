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
}

export interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
