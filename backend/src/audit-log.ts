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

const logs: AuditLogEntry[] = [];
let supabaseRepository: AuditRepository | null = null;
let auditState: AuditState = { status: 'uninitialized', required: false };

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

export const initAuditLog = async (config: {
  environment?: string;
  workspace?: {
    configured?: boolean;
    supabaseUrl?: string | null;
    supabaseServiceRoleKey?: string | null;
  };
}): Promise<void> => {
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
    const repository = createSupabaseAuditLogRepository(ws);
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

export const auditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry => {
  if (auditState.required && auditState.status !== 'ready') {
    throw new ApiError(503, 'audit_log_unavailable', 'Required audit logging is unavailable.');
  }

  const record: AuditLogEntry = {
    id: `audit_${randomUUID()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  logs.push(record);
  if (logs.length > MAX_LOG_SIZE) logs.splice(0, logs.length - MAX_LOG_SIZE);

  if (supabaseRepository) {
    void supabaseRepository
      .insert(record)
      .then(() => {
        auditState = {
          ...auditState,
          status: 'ready',
          lastError: undefined,
          lastSuccessfulWrite: new Date().toISOString(),
        };
      })
      .catch((error: unknown) => {
        markAuditFailure(error);
        logger.error('Remote audit write failed', { auditId: record.id }, error as Error);
      });
  }

  if (entry.severity === 'critical' || entry.severity === 'error') {
    logger.warn(`Audit ${entry.severity.toUpperCase()}`, { record });
  }
  return record;
};

export const getAuditLogs = async (filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> => {
  if (auditState.required && !supabaseRepository) {
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
