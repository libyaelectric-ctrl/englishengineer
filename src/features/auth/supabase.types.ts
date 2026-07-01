import { UserProfile } from './auth.types';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface SupabaseProfileRow {
  id: string;
  email: string;
  display_name: string;
  role: string;
  engineering_discipline: string;
  target_level: string;
  location: string;
  avatar_initials: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseProgressSnapshotRow {
  user_id: string;
  snapshot: JsonValue;
  schema_version: number;
  updated_at: string;
}

export interface EngineerOSDatabase {
  public: {
    Tables: {
      profiles: {
        Row: SupabaseProfileRow;
        Insert: SupabaseProfileRow;
        Update: Partial<SupabaseProfileRow>;
        Relationships: [];
      };
      user_progress_snapshots: {
        Row: SupabaseProgressSnapshotRow;
        Insert: SupabaseProgressSnapshotRow;
        Update: Partial<SupabaseProgressSnapshotRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export const mapProfileToSupabaseRow = (
  profile: UserProfile
): SupabaseProfileRow => ({
  id: profile.id,
  email: profile.email,
  display_name: profile.displayName,
  role: profile.role,
  engineering_discipline: profile.engineeringDiscipline,
  target_level: profile.targetLevel,
  location: profile.location,
  avatar_initials: profile.avatarInitials,
  created_at: profile.createdAt,
  updated_at: profile.updatedAt,
});

export const mapSupabaseRowToProfile = (
  row: SupabaseProfileRow
): UserProfile => ({
  id: row.id,
  displayName: row.display_name,
  email: row.email,
  role: row.role,
  engineeringDiscipline: row.engineering_discipline,
  targetLevel: row.target_level,
  location: row.location,
  avatarInitials: row.avatar_initials,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
