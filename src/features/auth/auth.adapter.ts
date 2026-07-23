import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from './auth.types';
import { storage } from '@/shared/storage';
import { generateId, getInitials } from './auth.helpers';
import { SupabaseReadyConfig } from './auth.config';
import { getSupabaseClient } from './supabase.client';
import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
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

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'engvox_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

interface LocalUserProfile extends UserProfile {
  passwordHash?: string;
}

const USERS_DB_KEY = 'auth_local_users';

export class LocalAuthAdapter implements AuthAdapter {
  constructor(private readonly enabled = true) {}

  private assertEnabled(): void {
    if (!this.enabled) {
      throw new AppError({
        code: ErrorCode.AUTH,
        message: 'Secure authentication is not configured.',
      });
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    if (!this.enabled) return null;
    return storage.globalGet<UserProfile>(STORAGE_KEY);
  }

  private findExistingUser(
    email: string,
    allUsers: LocalUserProfile[]
  ): LocalUserProfile | undefined {
    const found = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (found) return found;

    const currentUser = storage.globalGet<LocalUserProfile>(STORAGE_KEY);
    if (
      currentUser &&
      currentUser.email.toLowerCase() === email.toLowerCase()
    ) {
      allUsers.push(currentUser);
      storage.globalSet(USERS_DB_KEY, allUsers);
      return currentUser;
    }

    return undefined;
  }

  async login(
    displayName: string,
    email: string,
    password?: string
  ): Promise<UserProfile> {
    this.assertEnabled();

    if (!password || password.length < 6) {
      throw new AppError({
        code: ErrorCode.VALIDATION,
        message: 'Password must be at least 6 characters.',
      });
    }

    const allUsers = storage.globalGet<LocalUserProfile[]>(USERS_DB_KEY) || [];
    const existing = this.findExistingUser(email, allUsers);

    if (!existing) {
      throw new AppError({
        code: ErrorCode.AUTH,
        message: 'User does not exist. Please sign up first.',
      });
    }

    if (existing.passwordHash) {
      const inputHash = await hashPassword(password);
      if (inputHash !== existing.passwordHash) {
        throw new AppError({
          code: ErrorCode.AUTH,
          message: 'Invalid email or password.',
        });
      }
    }

    const updated = {
      ...existing,
      displayName,
      updatedAt: new Date().toISOString(),
    };
    storage.globalSet(STORAGE_KEY, updated);
    return updated;
  }

  async signUp(
    displayName: string,
    email: string,
    password: string
  ): Promise<UserProfile> {
    this.assertEnabled();

    if (!password || password.length < 6) {
      throw new AppError({
        code: ErrorCode.VALIDATION,
        message: 'Password must be at least 6 characters.',
      });
    }

    const allUsers = storage.globalGet<LocalUserProfile[]>(USERS_DB_KEY) || [];
    const existing = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      throw new AppError({
        code: ErrorCode.AUTH,
        message: 'An account with this email address already exists.',
      });
    }

    const newUser: LocalUserProfile = {
      id: generateId(),
      displayName,
      email,
      passwordHash: await hashPassword(password),
      role: 'Junior Electrical Engineer',
      engineeringDiscipline: 'Electrical Engineering',
      targetLevel: 'Project Engineer',
      location: 'Hospital Project',
      avatarInitials: getInitials(displayName),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allUsers.push(newUser);
    storage.globalSet(USERS_DB_KEY, allUsers);
    storage.globalSet(STORAGE_KEY, newUser);
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
    storage.globalSet(STORAGE_KEY, demoUser);
    return demoUser;
  }

  async logout(): Promise<void> {
    storage.globalRemove(STORAGE_KEY);
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    this.assertEnabled();
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new AppError({
        code: ErrorCode.AUTH,
        message: 'No authenticated user found',
      });
    }

    const updated: UserProfile = {
      ...currentUser,
      ...updates,
      avatarInitials: updates.displayName
        ? getInitials(updates.displayName)
        : currentUser.avatarInitials,
      updatedAt: new Date().toISOString(),
    };

    // Update in users database as well
    const allUsers = storage.globalGet<LocalUserProfile[]>(USERS_DB_KEY) || [];
    const updatedUsers = allUsers.map((u) =>
      u.email.toLowerCase() === currentUser.email.toLowerCase()
        ? { ...u, ...updates }
        : u
    );
    storage.globalSet(USERS_DB_KEY, updatedUsers);

    storage.globalSet(STORAGE_KEY, updated);
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

  async login(
    displayName: string,
    email: string,
    password?: string
  ): Promise<UserProfile> {
    return this.fallbackAdapter.login(displayName, email, password);
  }

  async signUp(
    displayName: string,
    email: string,
    password: string
  ): Promise<UserProfile> {
    if (this.fallbackAdapter.signUp) {
      return this.fallbackAdapter.signUp(displayName, email, password);
    }
    return this.fallbackAdapter.login(displayName, email, password);
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
      throw new AppError({
        code: ErrorCode.AUTH,
        message: 'Supabase client is not configured.',
      });
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
      throw new AppError({
        code: ErrorCode.VALIDATION,
        message: 'Password is required when Supabase auth is active.',
      });
    }

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user?.email) {
      throw new AppError({
        code: ErrorCode.AUTH,
        message: error?.message || 'Supabase sign in failed.',
      });
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
      throw new AppError({
        code: ErrorCode.AUTH,
        message: error?.message || 'Supabase sign up failed.',
      });
    }

    const fallbackProfile = this.toUserProfile(
      data.user.id,
      displayName,
      data.user.email
    );
    return this.upsertAndLoadProfile(fallbackProfile);
  }

  async demoLogin(): Promise<UserProfile> {
    throw new AppError({
      code: ErrorCode.AUTH,
      message:
        'Demo login is local-only. Switch VITE_AUTH_PROVIDER to local for demo mode.',
    });
  }

  async logout(): Promise<void> {
    await this.client.auth.signOut();
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new AppError({
        code: ErrorCode.AUTH,
        message: 'No authenticated Supabase user found',
      });
    }

    const displayName = updates.displayName || currentUser.displayName;
    const { error } = await this.client.auth.updateUser({
      data: { displayName },
    });
    if (error) {
      throw new AppError({ code: ErrorCode.AUTH, message: error.message });
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
      throw new AppError({ code: ErrorCode.AUTH, message: error.message });
    }
  }

  private toUserProfile(
    id: string,
    displayName: string | undefined,
    email: string
  ): UserProfile {
    const resolvedName = displayName || email.split('@')[0] || 'EngVox User';
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
