import { createClient } from '@supabase/supabase-js';

import type { AuditLogEntry, AuditLogFilters, AuditRemoteError } from './audit-log.js';

interface AuditLogRepository {
  insert(record: AuditLogEntry): Promise<void>;
  query(filters?: AuditLogFilters): Promise<AuditLogEntry[]>;
  healthCheck(): Promise<void>;
}

interface AuditLogConfig {
  supabaseUrl?: string | null;
  supabaseServiceRoleKey?: string | null;
}

/** PostgREST's code for a unique violation. */
const UNIQUE_VIOLATION_CODE = '23505';

/** PostgREST names the violated key and the value it already holds in `details`. */
const VIOLATED_KEY = /^Key \(([^)]+)\)=\((.*)\) already exists\.$/;

/**
 * Keeps what PostgREST structured out of the composed message: its code, and —
 * when the violation names the identity of the record this insert carried — the
 * fact that the write is already stored, so the caller can tell a retry of its own
 * landed write from a collision it must not swallow.
 *
 * A composite key names more than one value, so it is left unattributed and the
 * caller keeps failing closed.
 */
const toRemoteError = (
  context: string,
  error: { message?: string; code?: string; details?: string },
  record?: AuditLogEntry
): AuditRemoteError => {
  const remote = new Error(`${context}: ${error.message}`) as AuditRemoteError;
  remote.code = error.code;
  const violated = VIOLATED_KEY.exec(String(error.details ?? ''));
  if (
    record &&
    error.code === UNIQUE_VIOLATION_CODE &&
    violated &&
    !violated[1]!.includes(',') &&
    violated[2] === record.id
  ) {
    remote.duplicatesRequestedRecord = true;
  }
  return remote;
};

export const createSupabaseAuditLogRepository = (
  config: AuditLogConfig,
  fetchImpl: typeof fetch = fetch
): AuditLogRepository | null => {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) return null;

  const client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchImpl },
  });

  const healthCheck = async (): Promise<void> => {
    const { error } = await client.from('audit_logs').select('id').limit(1);
    if (error) throw toRemoteError('Audit repository health check failed', error);
  };

  const insert = async (record: AuditLogEntry): Promise<void> => {
    const { error } = await client.from('audit_logs').insert({
      id: record.id,
      timestamp: record.timestamp,
      action: record.action,
      user_id: record.userId ?? null,
      details: record.details ?? null,
      severity: record.severity ?? 'info',
    });
    if (error) throw toRemoteError('Audit insert failed', error, record);
  };

  const query = async (filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> => {
    let queryBuilder = client
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    if (filters.userId) queryBuilder = queryBuilder.eq('user_id', filters.userId);
    if (filters.action) queryBuilder = queryBuilder.eq('action', filters.action);
    if (filters.since) queryBuilder = queryBuilder.gte('timestamp', filters.since);
    queryBuilder = queryBuilder.limit(Math.min(Math.max(filters.limit ?? 100, 1), 1_000));

    const { data, error } = await queryBuilder;
    if (error) throw toRemoteError('Audit query failed', error);
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      timestamp: String(row.timestamp),
      action: typeof row.action === 'string' ? row.action : undefined,
      userId: typeof row.user_id === 'string' ? row.user_id : undefined,
      details:
        row.details && typeof row.details === 'object'
          ? (row.details as Record<string, unknown>)
          : undefined,
      severity: typeof row.severity === 'string' ? row.severity : undefined,
    }));
  };

  return { insert, query, healthCheck };
};
