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
    console.warn('[audit-log] Failed to initialize remote audit repository:', error?.message || error);
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
    console.warn(`[AUDIT-${entry.severity?.toUpperCase()}]`, record);
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
  // Billing
  CHECKOUT_CREATED: 'checkout_created',
  CHECKOUT_COMPLETED: 'checkout_completed',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  WEBHOOK_RECEIVED: 'webhook_received',
  WEBHOOK_FAILED: 'webhook_failed',

  // Admin
  ROLE_CHANGED: 'role_changed',
  PLAN_CHANGED: 'plan_changed',
  USER_SUSPENDED: 'user_suspended',

  // Workspace
  WORKSPACE_CREATED: 'workspace_created',
  WORKSPACE_DELETED: 'workspace_deleted',
  WORKSPACE_MEMORY_UPDATED: 'workspace_memory_updated',
  DOCUMENT_ADDED: 'document_added',
  DOCUMENT_DELETED: 'document_deleted',

  // Auth
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILURE: 'auth_failure',
  INSECURE_DEV_AUTH_USED: 'insecure_dev_auth_used',

  // AI
  AI_REQUEST: 'ai_request',
  AI_RATE_LIMITED: 'ai_rate_limited',
  AI_CREDIT_EXCEEDED: 'ai_credit_exceeded',
};
