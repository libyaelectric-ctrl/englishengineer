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
 * How long a *failed* re-initialization waits before it is tried again.
 *
 * Without recovery, a single transient remote error wedges the state at
 * `failed` for the lifetime of the process: every audited request is then
 * rejected from the guard below without ever reaching the remote again, so a
 * customer-visible flow such as billing checkout stays broken until a restart
 * even though the audit store is healthy again. The cooldown keeps a real
 * outage to one re-initialization attempt per window instead of one per
 * request.
 *
 * Only failures arm it and a success clears it, so a later, unrelated failure
 * is never throttled by an older incident, and callers that arrive together
 * share the attempt already in flight instead of being rejected by it.
 */
const AUDIT_RECOVERY_COOLDOWN_MS = 5_000;

const logs: AuditLogEntry[] = [];
let supabaseRepository: AuditRepository | null = null;
let auditState: AuditState = { status: 'uninitialized', required: false };
let auditInitConfig: AuditInitConfig | null = null;
let auditInitFetch: typeof fetch = fetch;
/** The initialization in flight, shared by every caller that joins it. */
let initInFlight: Promise<void> | null = null;
/** When the last re-initialization failed, so an outage is probed once per window. */
let lastFailedRebuildAt = 0;

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

const runInitAuditLog = async (config: AuditInitConfig, fetchImpl: typeof fetch): Promise<void> => {
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

/**
 * Initializes (or re-initializes) the audit log.
 *
 * One owner: a boot initialization and a recovery rebuild that overlap are the
 * same work, so the second caller joins the attempt in flight and receives its
 * result instead of tearing the repository down and building a second client.
 */
export const initAuditLog = (
  config: AuditInitConfig,
  fetchImpl: typeof fetch = fetch
): Promise<void> => {
  // Remembered so a later failure can re-initialize without a restart.
  auditInitConfig = config;
  auditInitFetch = fetchImpl;

  if (!initInFlight) {
    initInFlight = runInitAuditLog(config, fetchImpl).finally(() => {
      initInFlight = null;
    });
  }
  return initInFlight;
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
 * Turns the failed state back into a usable one, without weakening the rule
 * that an audited action fails closed while the store really is unavailable.
 *
 * The two failure origins need different answers. A failure with a live client
 * was a write failure and the client is still good, so the caller's own write —
 * which retries once — is the cheapest probe; rebuilding the client would only
 * discard it and spend a health check. A failure with no client means
 * initialization never completed, so that is re-run, at most once per cooldown.
 */
const recoverAuditLog = async (): Promise<boolean> => {
  if (!auditInitConfig) return false;
  // Captured before a successful re-initialization clears it: the log line
  // below is the only record of what this recovery recovered from.
  const previousError = auditState.lastError;

  if (supabaseRepository) return true;

  if (Date.now() - lastFailedRebuildAt < AUDIT_RECOVERY_COOLDOWN_MS) return false;

  try {
    await initAuditLog(auditInitConfig, auditInitFetch);
  } catch {
    lastFailedRebuildAt = Date.now();
    return false;
  }

  lastFailedRebuildAt = 0;
  // A request that joined an initialization still running has nothing to
  // recover from, so no cause means no recovery happened.
  if (previousError !== undefined) {
    logger.warn('Audit logging recovered after a failure', { previousError });
  }
  return true;
};

/**
 * One retry against the same client: a blip on the wire is far more likely than
 * a broken store, and a rebuild costs a health check on top of the write.
 */
const insertAuditRecord = async (
  repository: AuditRepository,
  record: AuditLogEntry
): Promise<void> => {
  try {
    await repository.insert(record);
  } catch {
    await repository.insert(record);
  }
};

const persistAuditRecord = async (record: AuditLogEntry): Promise<void> => {
  const repository = supabaseRepository;
  if (!repository) {
    if (auditState.required) {
      throw new ApiError(503, 'audit_log_unavailable', 'Required audit logging is unavailable.');
    }
    return;
  }

  try {
    await insertAuditRecord(repository, record);
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
