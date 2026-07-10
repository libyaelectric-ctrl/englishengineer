import { createClient } from '@supabase/supabase-js';

const MAX_BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 5_000;

export const createSupabaseAuditLogRepository = (config) => {
  if (!config?.supabaseUrl || !config?.supabaseServiceRoleKey) {
    return null;
  }

  const client = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey
  );
  const pendingBatch = [];
  let flushTimer = null;

  const flush = async () => {
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
        console.error(
          '[audit-log] Failed to flush to Supabase:',
          error.message
        );
        pendingBatch.unshift(...batch);
      }
    } catch (err) {
      console.error('[audit-log] Flush error:', err.message);
      pendingBatch.unshift(...batch);
    }
  };

  const scheduleFlush = () => {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flush();
    }, FLUSH_INTERVAL_MS);
  };

  const insert = (record) => {
    pendingBatch.push(record);
    if (pendingBatch.length >= MAX_BATCH_SIZE) {
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = null;
      flush();
    } else {
      scheduleFlush();
    }
  };

  const query = async (filters = {}) => {
    try {
      let query = client
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.since) {
        query = query.gte('timestamp', filters.since);
      }

      const limit = filters.limit || 100;
      query = query.limit(limit);

      const { data, error } = await query;
      if (error) {
        console.error('[audit-log] Query error:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        timestamp: row.timestamp,
        action: row.action,
        userId: row.user_id,
        details: row.details ? JSON.parse(row.details) : null,
        severity: row.severity,
      }));
    } catch (err) {
      console.error('[audit-log] Query error:', err.message);
      return [];
    }
  };

  return { insert, query, flush };
};
