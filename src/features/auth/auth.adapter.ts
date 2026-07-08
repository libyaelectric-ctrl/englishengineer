import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from './auth.types';
import { storage } from '@/shared/storage';
import { generateId, getInitials } from './auth.helpers';
import { SupabaseReadyConfig } from './auth.config';
import { getSupabaseClient } from './supabase.client';
import {
  mapProfileToSupabaseRow,
  mapSupabaseRowToProfile,
  SupabaseProfileRow,
} from './supabase.types';

const STORAGE_KEY = 'auth_user';

export interface AuthAdapter {
  getCurrentUser: () => Promise<UserProfile | null>;
  login: (
    displayName: string,
    email: string,
    password?: string
  ) => Promise<UserProfile>;
  signUp?: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<UserProfile>;
  demoLogin: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  resetPassword?: (email: string) => Promise<void>;
}

const SUPER_USER_EMAIL = 'catexozcan@gmail.com';
const SUPER_USER_PASSWORD = '123456';

export class LocalAuthAdapter implements AuthAdapter {
  constructor(private readonly enabled = true) {}

  private assertEnabled(): void {
    if (!this.enabled) {
      throw new Error('Secure authentication is not configured.');
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    if (!this.enabled) return null;
    return storage.get<UserProfile>(STORAGE_KEY);
  }

  async login(displayName: string, email: string, password?: string): Promise<UserProfile> {
    this.assertEnabled();

    // Super user check
    if (email.toLowerCase() === SUPER_USER_EMAIL && password === SUPER_USER_PASSWORD) {
      const superUser: UserProfile = {
        id: 'super_user_catexozcan',
        displayName: 'Super Admin',
        email: SUPER_USER_EMAIL,
        role: 'Super Administrator',
        engineeringDiscipline: 'All Disciplines',
        targetLevel: 'Unlimited',
        location: 'Global Access',
        avatarInitials: 'SA',
        isSuperUser: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.set(STORAGE_KEY, superUser);
      return superUser;
    }

    const existing = await this.getCurrentUser();
    if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
      const updated = {
        ...existing,
        displayName,
        updatedAt: new Date().toISOString(),
      };
      storage.set(STORAGE_KEY, updated);
      return updated;
    }

    const newUser: UserProfile = {
      id: generateId(),
      displayName,
      email,
      role: 'Junior Electrical Engineer',
      engineeringDiscipline: 'Electrical Engineering',
      targetLevel: 'Project Engineer',
      location: 'Hospital Project',
      avatarInitials: getInitials(displayName),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.set(STORAGE_KEY, newUser);
    return newUser;
  }

  async demoLogin(): Promise<UserProfile> {
    this.assertEnabled();
    const demoUser: UserProfile = {
      id: `demo_engineer_${generateId().slice(-8)}`,
      displayName: 'Demo Engineer',
      email: 'demo.engineer@local.EngVox',
      role: 'Electrical Engineer',
      engineeringDiscipline: 'Electrical Engineering',
      targetLevel: 'Project communication confidence',
      location: 'Local Lite workspace',
      avatarInitials: 'DE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEY, demoUser);
    return demoUser;
  }

  async logout(): Promise<void> {
    storage.remove(STORAGE_KEY);
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    this.assertEnabled();
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const updated: UserProfile = {
      ...currentUser,
      ...updates,
      avatarInitials: updates.displayName
        ? getInitials(updates.displayName)
        : currentUser.avatarInitials,
      updatedAt: new Date().toISOString(),
    };

    storage.set(STORAGE_KEY, updated);
    return updated;
  }
}

export class SupabaseReadyAuthAdapter implements AuthAdapter {
  constructor(
    private readonly fallbackAdapter: AuthAdapter,
    private readonly config: SupabaseReadyConfig
  ) {}

  async getCurrentUser(): Promise<UserProfile | null> {
    return this.fallbackAdapter.getCurrentUser();
  }

  async login(displayName: string, email: string): Promise<UserProfile> {
    return this.fallbackAdapter.login(displayName, email);
  }

  async demoLogin(): Promise<UserProfile> {
    return this.fallbackAdapter.demoLogin();
  }

  async logout(): Promise<void> {
    await this.fallbackAdapter.logout();
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.fallbackAdapter.updateProfile(updates);
  }

  getReadinessLabel(): string {
    if (this.config.url && this.config.anonKeyConfigured) {
      return 'Supabase config detected; local adapter remains active until backend auth is explicitly enabled.';
    }

    return 'Supabase adapter ready; optional config not connected.';
  }
}

export class SupabaseAuthAdapter implements AuthAdapter {
  private readonly client: SupabaseClient;

  constructor(client = getSupabaseClient()) {
    if (!client) {
      throw new Error('Supabase client is not configured.');
    }
    this.client = client;
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error || !data.user?.email) {
      return null;
    }

    const fallbackProfile = this.toUserProfile(
      data.user.id,
      data.user.user_metadata.displayName as string | undefined,
      data.user.email
    );
    return this.loadProfile(data.user.id, fallbackProfile);
  }

  async login(
    displayName: string,
    email: string,
    password?: string
  ): Promise<UserProfile> {
    if (!password) {
      throw new Error('Password is required when Supabase auth is active.');
    }

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user?.email) {
      throw new Error(error?.message || 'Supabase sign in failed.');
    }

    const fallbackProfile = this.toUserProfile(
      data.user.id,
      displayName,
      data.user.email
    );
    return this.upsertAndLoadProfile(fallbackProfile);
  }

  async signUp(
    displayName: string,
    email: string,
    password: string
  ): Promise<UserProfile> {
    const emailRedirectTo =
      typeof window === 'undefined'
        ? undefined
        : `${window.location.origin}/login`;
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { displayName },
      },
    });
    if (error || !data.user?.email) {
      throw new Error(error?.message || 'Supabase sign up failed.');
    }

    const fallbackProfile = this.toUserProfile(
      data.user.id,
      displayName,
      data.user.email
    );
    return this.upsertAndLoadProfile(fallbackProfile);
  }

  async demoLogin(): Promise<UserProfile> {
    throw new Error(
      'Demo login is local-only. Switch VITE_AUTH_PROVIDER to local for demo mode.'
    );
  }

  async logout(): Promise<void> {
    await this.client.auth.signOut();
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated Supabase user found');
    }

    const displayName = updates.displayName || currentUser.displayName;
    const { error } = await this.client.auth.updateUser({
      data: { displayName },
    });
    if (error) {
      throw new Error(error.message);
    }

    const updated: UserProfile = {
      ...currentUser,
      ...updates,
      avatarInitials: updates.displayName
        ? getInitials(updates.displayName)
        : currentUser.avatarInitials,
      updatedAt: new Date().toISOString(),
    };
    return this.upsertAndLoadProfile(updated);
  }

  async resetPassword(email: string): Promise<void> {
    const redirectTo =
      typeof window === 'undefined'
        ? undefined
        : `${window.location.origin}/login`;
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  private toUserProfile(
    id: string,
    displayName: string | undefined,
    email: string
  ): UserProfile {
    const resolvedName =
      displayName || email.split('@')[0] || 'EngVox User';
    return {
      id,
      displayName: resolvedName,
      email,
      role: 'EngVox Member',
      engineeringDiscipline: 'General Engineering',
      targetLevel: 'Senior Engineer',
      location: 'Remote',
      avatarInitials: getInitials(resolvedName),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private async loadProfile(
    id: string,
    fallback: UserProfile
  ): Promise<UserProfile> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return fallback;
    }

    return mapSupabaseRowToProfile(data as SupabaseProfileRow);
  }

  private async upsertAndLoadProfile(
    profile: UserProfile
  ): Promise<UserProfile> {
    const { error } = await this.client
      .from('profiles')
      .upsert(mapProfileToSupabaseRow(profile), { onConflict: 'id' });

    if (error) {
      return profile;
    }

    return this.loadProfile(profile.id, profile);
  }
}
