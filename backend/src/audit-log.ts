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
let supabaseRepository: {
  insert: (record: AuditLogEntry) => void;
  query: (filters: AuditLogFilters) => Promise<AuditLogEntry[]>;
} | null = null;

export const initAuditLog = async (config: {
  workspace?: Record<string, unknown>;
}): Promise<void> => {
  const ws = config?.workspace;
  if (!ws?.configured || !ws?.supabaseUrl || !ws?.supabaseServiceRoleKey) return;
  try {
    const { createSupabaseAuditLogRepository } = await import('./supabase-audit-log-repository.js');
    supabaseRepository = createSupabaseAuditLogRepository(ws);
  } catch (error: unknown) {
    logger.warn('Failed to initialize remote audit repository', {
      error: error instanceof Error ? error.message : String(error),
    });
    supabaseRepository = null;
  }
};

export const auditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry => {
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

export const getAuditLogs = async (filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> => {
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
  // Data mutation tracking
  DATA_CREATED: 'data_created',
  DATA_UPDATED: 'data_updated',
  DATA_DELETED: 'data_deleted',
  DATA_EXPORTED: 'data_exported',
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_CHANGED: 'settings_changed',
  PASSWORD_CHANGED: 'password_changed',
  TEAM_MEMBER_ADDED: 'team_member_added',
  TEAM_MEMBER_REMOVED: 'team_member_removed',
  PLAN_CHANGED: 'plan_changed',
  GRACE_PERIOD_STARTED: 'grace_period_started',
} as const;

/**
 * Enhanced audit log for data mutations with before/after tracking.
 * Records the old and new values for each changed field.
 */
export const auditDataMutation = (params: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  requestId?: string;
  severity?: string;
}): AuditLogEntry => {
  // Compute changed fields
  const changedFields: Record<string, { from: unknown; to: unknown }> = {};
  if (params.before && params.after) {
    const allKeys = new Set([...Object.keys(params.before), ...Object.keys(params.after)]);
    for (const key of allKeys) {
      const oldVal = params.before[key];
      const newVal = params.after[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changedFields[key] = { from: oldVal, to: newVal };
      }
    }
  }

  return auditLog({
    action: params.action,
    userId: params.userId,
    severity: params.severity ?? 'info',
    resource: params.resource,
    resourceId: params.resourceId,
    before: params.before,
    after: params.after,
    changedFields,
    ip: params.ip,
    requestId: params.requestId,
  });
};
