import { createClient } from '@supabase/supabase-js';

import type { AuditLogEntry, AuditLogFilters } from './audit-log.js';

interface AuditLogRepository {
  insert(record: AuditLogEntry): Promise<void>;
  query(filters?: AuditLogFilters): Promise<AuditLogEntry[]>;
  healthCheck(): Promise<void>;
}

interface AuditLogConfig {
  supabaseUrl?: string | null;
  supabaseServiceRoleKey?: string | null;
}

export const createSupabaseAuditLogRepository = (
  config: AuditLogConfig
): AuditLogRepository | null => {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) return null;

  const client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const healthCheck = async (): Promise<void> => {
    const { error } = await client.from('audit_logs').select('id').limit(1);
    if (error) throw new Error(`Audit repository health check failed: ${error.message}`);
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
    if (error) throw new Error(`Audit insert failed: ${error.message}`);
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
    if (error) throw new Error(`Audit query failed: ${error.message}`);
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
