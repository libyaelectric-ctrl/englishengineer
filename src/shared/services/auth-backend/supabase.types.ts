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

export interface EngVoxDatabase {
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
