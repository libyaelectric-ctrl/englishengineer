import { logger } from './logger.js';

const MAX_LOG_SIZE = 10_000;

interface AuditLogEntry {
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

const logs: AuditLogEntry[] = [];
let supabaseRepository: any = null;

export const initAuditLog = async (
  config: Record<string, any>
): Promise<void> => {
  try {
    if (
      config?.workspace?.configured &&
      config?.workspace?.supabaseUrl &&
      config?.workspace?.supabaseServiceRoleKey
    ) {
      const { createSupabaseAuditLogRepository } =
        await import('./supabase-audit-log-repository.js');
      supabaseRepository = createSupabaseAuditLogRepository(config.workspace);
    }
  } catch (error: any) {
    logger.warn('Failed to initialize remote audit repository', {
      error: error?.message || error,
    });
    supabaseRepository = null;
  }
};

export const auditLog = (
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): AuditLogEntry => {
  const record: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  logs.push(record);

  if (logs.length > MAX_LOG_SIZE) {
    logs.splice(0, logs.length - MAX_LOG_SIZE);
  }

  if (supabaseRepository) {
    supabaseRepository.insert(record);
  }

  if (entry.severity === 'critical' || entry.severity === 'error') {
    logger.warn(`Audit ${entry.severity?.toUpperCase()}`, { record });
  }

  return record;
};

export const getAuditLogs = async (
  filters: AuditLogFilters = {}
): Promise<AuditLogEntry[]> => {
  if (supabaseRepository) {
    const remoteLogs = await supabaseRepository.query(filters);
    if (remoteLogs.length > 0) return remoteLogs;
  }

  let filtered = [...logs];

  if (filters.userId) {
    filtered = filtered.filter((l) => l.userId === filters.userId);
  }
  if (filters.action) {
    filtered = filtered.filter((l) => l.action === filters.action);
  }
  if (filters.since) {
    const since = new Date(filters.since);
    filtered = filtered.filter((l) => new Date(l.timestamp) >= since);
  }

  const limit = filters.limit || 100;
  return filtered.slice(-limit);
};

export const AUDIT_ACTIONS = {
  CHECKOUT_CREATED: 'checkout_created',
  WEBHOOK_RECEIVED: 'webhook_received',
  AUTH_LOGIN: 'auth_login',
  AUTH_LOGOUT: 'auth_logout',
  AUTH_SIGNUP: 'auth_signup',
  AI_REQUEST: 'ai_request',
  AI_LIMIT_EXCEEDED: 'ai_limit_exceeded',
  VOCABULARY_REVIEW: 'vocabulary_review',
  VOCABULARY_PROGRESS: 'vocabulary_progress',
  BILLING_SUBSCRIPTION_CHANGED: 'billing_subscription_changed',
  BILLING_PORTAL_OPENED: 'billing_portal_opened',
  WORKSPACE_CREATED: 'workspace_created',
  WORKSPACE_DELETED: 'workspace_deleted',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  ADMIN_ACCESS: 'admin_access',
} as const;
