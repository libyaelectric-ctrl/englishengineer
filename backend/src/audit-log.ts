import { randomUUID } from 'node:crypto';

import { ApiError } from './errors.js';
import { logger } from './logger.js';

const MAX_LOG_SIZE = 10_000;

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action?: string;
  userId?: string;
  details?: Record<string, unknown>;
  severity?: string;
  [key: string]: unknown;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  since?: string;
  limit?: number;
}

interface AuditRepository {
  insert(record: AuditLogEntry): Promise<void>;
  query(filters: AuditLogFilters): Promise<AuditLogEntry[]>;
  healthCheck(): Promise<void>;
}

interface AuditState {
  status: 'uninitialized' | 'initializing' | 'ready' | 'disabled' | 'failed';
  required: boolean;
  lastError?: string;
  lastSuccessfulWrite?: string;
}

interface AuditInitConfig {
  environment?: string;
  workspace?: {
    configured?: boolean;
    supabaseUrl?: string | null;
    supabaseServiceRoleKey?: string | null;
  };
}

/**
 * How long a failed audit log waits before it tries to re-initialize.
 *
 * Without recovery, a single transient remote error wedges the state at
 * `failed` for the lifetime of the process: every audited request is then
 * rejected from the guard below without ever reaching the remote again, so a
 * customer-visible flow such as billing checkout stays broken until a restart
 * even though the audit store is healthy again. The cooldown keeps a real
 * outage to one re-initialization attempt per window instead of one per
 * request.
 */
const AUDIT_RECOVERY_COOLDOWN_MS = 5_000;

const logs: AuditLogEntry[] = [];
let supabaseRepository: AuditRepository | null = null;
let auditState: AuditState = { status: 'uninitialized', required: false };
let auditInitConfig: AuditInitConfig | null = null;
let auditInitFetch: typeof fetch = fetch;
let lastRecoveryAttempt = 0;

export const getAuditLogStatus = (): Readonly<AuditState> => ({ ...auditState });
export const isAuditLogReady = (): boolean =>
  auditState.status === 'ready' || (!auditState.required && auditState.status === 'disabled');

const markAuditFailure = (error: unknown): void => {
  auditState = {
    ...auditState,
    status: 'failed',
    lastError: error instanceof Error ? error.message : String(error),
  };
};

export const initAuditLog = async (
  config: AuditInitConfig,
  fetchImpl: typeof fetch = fetch
): Promise<void> => {
  // Remembered so a later failure can re-initialize without a restart.
  auditInitConfig = config;
  auditInitFetch = fetchImpl;
  const ws = config?.workspace;
  const required = config.environment === 'production';
  auditState = { status: 'initializing', required };
  supabaseRepository = null;

  if (!ws?.configured || !ws?.supabaseUrl || !ws?.supabaseServiceRoleKey) {
    const error = new Error('Remote audit storage is not configured.');
    if (required) {
      markAuditFailure(error);
      throw error;
    }
    auditState = { status: 'disabled', required: false };
    return;
  }

  try {
    const { createSupabaseAuditLogRepository } = await import('./supabase-audit-log-repository.js');
    const repository = createSupabaseAuditLogRepository(ws, fetchImpl);
    if (!repository) throw new Error('Remote audit repository configuration is invalid.');
    await repository.healthCheck();
    supabaseRepository = repository;
    auditState = { status: 'ready', required };
  } catch (error) {
    markAuditFailure(error);
    logger.error('Failed to initialize remote audit repository', {}, error as Error);
    throw error;
  }
};

const createAuditRecord = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry => {
  const record: AuditLogEntry = {
    id: `audit_${randomUUID()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  logs.push(record);
  if (logs.length > MAX_LOG_SIZE) logs.splice(0, logs.length - MAX_LOG_SIZE);
  return record;
};

/**
 * Re-runs initialization after a failure so the state can leave `failed`.
 * Returns whether audit logging is usable again; the caller still fails closed
 * when it is not, which keeps a genuine outage rejecting audited actions.
 */
const recoverAuditLog = async (): Promise<boolean> => {
  if (!auditInitConfig) return false;
  const now = Date.now();
  if (now - lastRecoveryAttempt < AUDIT_RECOVERY_COOLDOWN_MS) return false;
  lastRecoveryAttempt = now;

  try {
    await initAuditLog(auditInitConfig, auditInitFetch);
  } catch {
    return false;
  }

  if (auditState.status !== 'ready') return false;
  logger.warn('Audit logging recovered after a failure', { previousError: auditState.lastError });
  return true;
};

const persistAuditRecord = async (record: AuditLogEntry): Promise<void> => {
  if (!supabaseRepository) {
    if (auditState.required) {
      throw new ApiError(503, 'audit_log_unavailable', 'Required audit logging is unavailable.');
    }
    return;
  }

  try {
    await supabaseRepository.insert(record);
    auditState = {
      ...auditState,
      status: 'ready',
      lastError: undefined,
      lastSuccessfulWrite: new Date().toISOString(),
    };
  } catch (error) {
    markAuditFailure(error);
    logger.error('Remote audit write failed', { auditId: record.id }, error as Error);
    throw new ApiError(503, 'audit_log_unavailable', 'Required audit logging is unavailable.');
  }
};

export const auditLog = async (
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<AuditLogEntry> => {
  if (auditState.required && auditState.status !== 'ready' && !(await recoverAuditLog())) {
    throw new ApiError(503, 'audit_log_unavailable', 'Required audit logging is unavailable.');
  }

  const record = createAuditRecord(entry);
  await persistAuditRecord(record);

  if (entry.severity === 'critical' || entry.severity === 'error') {
    logger.warn(`Audit ${entry.severity.toUpperCase()}`, { record });
  }
  return record;
};

export const getAuditLogs = async (filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> => {
  if (auditState.required && !supabaseRepository && !(await recoverAuditLog())) {
    throw new ApiError(503, 'audit_log_unavailable', 'Required audit logging is unavailable.');
  }
  if (supabaseRepository) return supabaseRepository.query(filters);

  let filtered = [...logs];
  if (filters.userId) filtered = filtered.filter((log) => log.userId === filters.userId);
  if (filters.action) filtered = filtered.filter((log) => log.action === filters.action);
  if (filters.since) {
    const since = new Date(filters.since);
    filtered = filtered.filter((log) => new Date(log.timestamp) >= since);
  }
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 1_000);
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
