import { createClient } from '@supabase/supabase-js';
import { logger } from './logger.js';

const MAX_BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 5_000;

interface AuditLogRecord {
  id: string;
  timestamp: string;
  action?: string;
  userId?: string;
  details?: Record<string, unknown>;
  severity?: string;
  [key: string]: unknown;
}

interface AuditLogFilters {
  userId?: string;
  action?: string;
  since?: string;
  limit?: number;
}

interface AuditLogRepository {
  insert(record: AuditLogRecord): void;
  query(filters?: AuditLogFilters): Promise<AuditLogRecord[]>;
  flush(): Promise<void>;
}

interface AuditLogConfig {
  supabaseUrl?: string | null;
  supabaseServiceRoleKey?: string | null;
}

export const createSupabaseAuditLogRepository = (
  config: AuditLogConfig
): AuditLogRepository | null => {
  if (!config?.supabaseUrl || !config?.supabaseServiceRoleKey) {
    return null;
  }

  const client = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey
  );
  const pendingBatch: AuditLogRecord[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  const flush = async (): Promise<void> => {
    if (pendingBatch.length === 0) return;
    const batch = pendingBatch.splice(0, MAX_BATCH_SIZE);
    try {
      const { error } = await client.from('audit_logs').insert(
        batch.map((r) => ({
          id: r.id,
          timestamp: r.timestamp,
          action: r.action,
          user_id: r.userId || null,
          details: r.details ? JSON.stringify(r.details) : null,
          severity: r.severity || 'info',
        }))
      );
      if (error) {
        logger.error('Failed to flush audit log to Supabase', {
          message: error.message,
        });
        pendingBatch.unshift(...batch);
      }
    } catch (err: unknown) {
      logger.error('Audit log flush error', {
        message: err instanceof Error ? err.message : String(err),
      });
      pendingBatch.unshift(...batch);
    }
  };

  const scheduleFlush = (): void => {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flush();
    }, FLUSH_INTERVAL_MS);
  };

  const insert = (record: AuditLogRecord): void => {
    pendingBatch.push(record);
    if (pendingBatch.length >= MAX_BATCH_SIZE) {
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = null;
      flush();
    } else {
      scheduleFlush();
    }
  };

  const query = async (
    filters: AuditLogFilters = {}
  ): Promise<AuditLogRecord[]> => {
    try {
      let queryBuilder = client
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.userId) {
        queryBuilder = queryBuilder.eq('user_id', filters.userId);
      }
      if (filters.action) {
        queryBuilder = queryBuilder.eq('action', filters.action);
      }
      if (filters.since) {
        queryBuilder = queryBuilder.gte('timestamp', filters.since);
      }

      const limit = filters.limit || 100;
      queryBuilder = queryBuilder.limit(limit);

      const { data, error } = await queryBuilder;
      if (error) {
        logger.error('Audit log query error', { message: error.message });
        return [];
      }

      return (data || []).map((row: Record<string, unknown>) => ({
        id: row.id,
        timestamp: row.timestamp,
        action: row.action,
        userId: row.user_id,
        details: row.details ? JSON.parse(row.details as string) : null,
        severity: row.severity,
      }));
    } catch (err: unknown) {
      logger.error('Audit log query error', {
        message: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  };

  return { insert, query, flush };
};
