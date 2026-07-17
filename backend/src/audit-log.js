import { logger } from './logger.js';

const MAX_LOG_SIZE = 10_000;

const logs = [];
let supabaseRepository = null;

export const initAuditLog = async (config) => {
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
  } catch (error) {
    logger.warn('Failed to initialize remote audit repository', {
      error: error?.message || error,
    });
    supabaseRepository = null;
  }
};

export const auditLog = (entry) => {
  const record = {
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

export const getAuditLogs = async (filters = {}) => {
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
};
