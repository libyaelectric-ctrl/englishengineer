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

const logs: AuditLogEntry[] = [];
let supabaseRepository: AuditRepository | null = null;
let auditState: AuditState = { status: 'uninitialized', required: false };
let auditInitConfig: AuditInitConfig | null = null;
let auditInitFetch: typeof fetch = fetch;
/** The initialization attempt in flight, shared by every caller that joins it. */
let initInFlight: Promise<void> | null = null;

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

const runInitAuditLog = async (
  config: AuditInitConfig,
  fetchImpl: typeof fetch,
  verify: boolean
): Promise<void> => {
  const ws = config?.workspace;
  const required = config.environment === 'production';
  // A recovery attempt keeps the cause of the failure it is answering, so the
  // write that proves the store is back can report what was recovered from.
  auditState = { ...auditState, status: 'initializing', required };
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
    // A verified attempt proves the store answers before the client is trusted.
    // An unverified one installs the client and leaves the proof to the caller's
    // own write, which is the round trip the action has to make anyway.
    if (verify) {
      await repository.healthCheck();
      auditState = { status: 'ready', required };
    }
    supabaseRepository = repository;
  } catch (error) {
    markAuditFailure(error);
    logger.error('Failed to initialize remote audit repository', {}, error as Error);
    throw error;
  }
};

/**
 * The single attempt slot.
 *
 * One attempt runs at a time: a caller that arrives while one is running joins
 * it and receives its result instead of tearing the client down and building a
 * second one. `verify` decides whether the attempt proves the store is
 * answering before the client is trusted — a boot initialization does, a
 * recovery install does not (see `recoverAuditLog`).
 */
const startInitAttempt = (
  config: AuditInitConfig,
  fetchImpl: typeof fetch,
  verify: boolean
): Promise<void> => {
  if (!initInFlight) {
    initInFlight = runInitAuditLog(config, fetchImpl, verify).finally(() => {
      initInFlight = null;
    });
  }
  return initInFlight;
};

/**
 * Initializes (or re-initializes) the audit log.
 *
 * This does two things on purpose, and both of them happen on every call:
 * - it records the configuration, so a later failure can re-initialize without a
 *   restart, including when this call only waits for an attempt already running;
 * - it owns an attempt: either it starts one, or it joins the one in flight.
 *
 * A caller whose configuration differs from the attempt in flight therefore has
 * its configuration recorded for the next attempt, while the result it receives
 * belongs to the attempt it joined.
 */
export const initAuditLog = (
  config: AuditInitConfig,
  fetchImpl: typeof fetch = fetch
): Promise<void> => {
  auditInitConfig = config;
  auditInitFetch = fetchImpl;

  return startInitAttempt(config, fetchImpl, true);
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
 * Both failure origins are settled by the caller's own write, which is the one
 * remote call the action has to make anyway.
 *
 * A failure with a live client was a write failure, and the client is still
 * good, so there is nothing to rebuild. A failure with no client means
 * initialization never completed, so a client is built and installed *without* a
 * health check: checking first would spend an extra round trip and, worse, would
 * refuse a request against a store that has started answering again. A burst of
 * callers shares that one install, and the write attempts that follow belong to
 * each caller, so the remote cost stays bounded by the retry instead of growing
 * with the number of callers.
 */
const recoverAuditLog = async (): Promise<boolean> => {
  if (!auditInitConfig) return false;
  if (supabaseRepository) return true;

  try {
    await startInitAttempt(auditInitConfig, auditInitFetch, false);
  } catch {
    return false;
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
    // The write is what proves the store is answering, so this is where a
    // recovery is recorded — and only when there was a failure to recover from,
    // which keeps it to one record per outage instead of one per request.
    const recoveredFrom = auditState.lastError;
    auditState = {
      ...auditState,
      status: 'ready',
      lastError: undefined,
      lastSuccessfulWrite: new Date().toISOString(),
    };
    if (recoveredFrom !== undefined) {
      logger.warn('Audit logging recovered after a failure', { previousError: recoveredFrom });
    }
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
  if (supabaseRepository) {
    try {
      return await supabaseRepository.query(filters);
    } catch (error) {
      // A store that cannot be read is unavailable, not an internal fault: fail
      // closed with the same code the write path uses instead of leaking a 500.
      markAuditFailure(error);
      throw new ApiError(503, 'audit_log_unavailable', 'Required audit logging is unavailable.');
    }
  }

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
