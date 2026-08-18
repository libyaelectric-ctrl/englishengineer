import { createClient } from '@supabase/supabase-js';
import { promises as fsp } from 'node:fs';
import path from 'node:path';

import { logger } from './logger.js';

const FREE_DAILY_LIMIT = 3;
const PAID_MONTHLY_LIMIT = 300;

const FREE_PERIOD_MS = 24 * 60 * 60 * 1000;
const PAID_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const PLAN_LIMITS: Record<string, { daily: number | null; monthly: number }> = {
  free: { daily: FREE_DAILY_LIMIT, monthly: 0 },
  junior: { daily: null, monthly: 50 },
  senior: { daily: null, monthly: 150 },
  specialist: { daily: null, monthly: 300 },
  master: { daily: null, monthly: 600 },
  team: { daily: null, monthly: 1500 },
};

interface PlanLimits {
  max: number;
  windowMs: number;
}

const getLimitForPlan = (planId: string): PlanLimits => {
  const limits = PLAN_LIMITS[planId] ?? { daily: null, monthly: PAID_MONTHLY_LIMIT };
  if (limits.daily !== null) {
    return { max: limits.daily, windowMs: FREE_PERIOD_MS };
  }
  return { max: limits.monthly, windowMs: PAID_PERIOD_MS };
};

interface AiLedgerSession {
  modeId?: string;
  provider?: string;
  operation: string;
  durationMs?: number;
  resultSummary?: string;
  tokensUsed?: number;
  metadata?: Record<string, unknown>;
}

export interface AiAnalytics {
  totalRequests: number;
  averageDurationMs: number;
  totalEstimatedTokens: number;
  estimatedCostUsd: number;
  byOperation: Array<{ operation: string; count: number }>;
  byDay: Array<{ date: string; count: number }>;
}

export interface AiAdminAnalytics {
  totalRequests: number;
  totalEstimatedTokens: number;
  estimatedCostUsd: number;
  topUsers: Array<{
    userId: string;
    totalRequests: number;
    totalEstimatedTokens: number;
    estimatedCostUsd: number;
  }>;
}

// Rough output-heavy price used only when real provider billing details are
// unavailable. Deliberately labeled "estimated" in the API contract.
const ESTIMATED_USD_PER_1K_TOKENS = 0.01;

const emptyAnalytics = (): AiAnalytics => ({
  totalRequests: 0,
  averageDurationMs: 0,
  totalEstimatedTokens: 0,
  estimatedCostUsd: 0,
  byOperation: [],
  byDay: [],
});

const emptyAdminAnalytics = (): AiAdminAnalytics => ({
  totalRequests: 0,
  totalEstimatedTokens: 0,
  estimatedCostUsd: 0,
  topUsers: [],
});

const estimateCostUsd = (tokens: number): number =>
  Math.round(tokens * (ESTIMATED_USD_PER_1K_TOKENS / 1000) * 10000) / 10000;

const buildAnalytics = (
  sessions: Array<{ operation: string; durationMs: number; tokensUsed: number; timestamp: number }>
): AiAnalytics => {
  if (sessions.length === 0) return emptyAnalytics();

  const totalDuration = sessions.reduce((sum, s) => sum + s.durationMs, 0);
  const totalTokens = sessions.reduce((sum, s) => sum + s.tokensUsed, 0);

  const byOperationMap = new Map<string, number>();
  const byDayMap = new Map<string, number>();
  for (const session of sessions) {
    byOperationMap.set(session.operation, (byOperationMap.get(session.operation) ?? 0) + 1);
    const day = new Date(session.timestamp).toISOString().split('T')[0];
    byDayMap.set(day, (byDayMap.get(day) ?? 0) + 1);
  }

  return {
    totalRequests: sessions.length,
    averageDurationMs: Math.round(totalDuration / sessions.length),
    totalEstimatedTokens: totalTokens,
    estimatedCostUsd: estimateCostUsd(totalTokens),
    byOperation: [...byOperationMap.entries()]
      .map(([operation, count]) => ({ operation, count }))
      .sort((a, b) => b.count - a.count),
    byDay: [...byDayMap.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
};

interface AdminAnalyticsEntry {
  userId: string;
  tokensUsed: number;
}

const buildAdminAnalytics = (entries: AdminAnalyticsEntry[]): AiAdminAnalytics => {
  if (entries.length === 0) return emptyAdminAnalytics();

  const perUser = new Map<string, { count: number; tokens: number }>();
  let totalTokens = 0;
  for (const entry of entries) {
    const current = perUser.get(entry.userId) ?? { count: 0, tokens: 0 };
    current.count += 1;
    current.tokens += entry.tokensUsed;
    perUser.set(entry.userId, current);
    totalTokens += entry.tokensUsed;
  }

  return {
    totalRequests: entries.length,
    totalEstimatedTokens: totalTokens,
    estimatedCostUsd: estimateCostUsd(totalTokens),
    topUsers: [...perUser.entries()]
      .map(([userId, usage]) => ({
        userId,
        totalRequests: usage.count,
        totalEstimatedTokens: usage.tokens,
        estimatedCostUsd: estimateCostUsd(usage.tokens),
      }))
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 20),
  };
};

export interface AiLedger {
  countRecentRequests(userId: string, planId: string): Promise<number>;
  logSession(userId: string, session: AiLedgerSession): Promise<void>;
  getUserAnalytics(userId: string): Promise<AiAnalytics>;
  getAdminAnalytics(): Promise<AiAdminAnalytics>;
}

export const createSupabaseAiLedger = (config: {
  workspace?: {
    configured?: boolean;
    supabaseUrl?: string;
    supabaseServiceRoleKey?: string;
  };
}): AiLedger => {
  if (!config.workspace?.configured) {
    throw new Error('AI ledger requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const supabase = createClient(
    config.workspace!.supabaseUrl!,
    config.workspace!.supabaseServiceRoleKey!,
    { auth: { persistSession: false } }
  );

  return {
    async countRecentRequests(userId, planId) {
      const { windowMs } = getLimitForPlan(planId);
      const startDateIso = new Date(Date.now() - windowMs).toISOString();
      try {
        const { count, error } = await supabase
          .from('ai_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startDateIso);

        if (error) {
          logger.error('Ledger count error', { error: error.message });
          return 0;
        }
        return count ?? 0;
      } catch (err: unknown) {
        logger.error('Ledger count error', {
          error: err instanceof Error ? err.message : String(err),
        });
        return 0;
      }
    },

    async logSession(userId, session) {
      try {
        const { error } = await supabase.from('ai_sessions').insert({
          user_id: userId,
          mode_id: session.modeId || 'unknown',
          provider: session.provider || 'mock',
          operation: session.operation,
          success: true,
          duration_ms: session.durationMs || 0,
          result_summary: session.resultSummary || '',
          tokens_used: session.tokensUsed || 0,
          metadata: session.metadata || {},
        });

        if (error) {
          logger.error('Ledger log error', { error: error.message });
        }
      } catch (err: unknown) {
        logger.error('Ledger log error', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },

    async getUserAnalytics(userId) {
      try {
        const { data, error } = await supabase
          .from('ai_sessions')
          .select('operation, duration_ms, tokens_used, created_at')
          .eq('user_id', userId);

        if (error) {
          logger.error('Ledger analytics error', { error: error.message });
          return emptyAnalytics();
        }

        const rows = (data as Array<Record<string, unknown>>) ?? [];
        return buildAnalytics(
          rows.map((row) => ({
            operation: typeof row.operation === 'string' ? row.operation : 'unknown',
            durationMs:
              typeof row.duration_ms === 'number' ? row.duration_ms : Number(row.duration_ms) || 0,
            tokensUsed:
              typeof row.tokens_used === 'number' ? row.tokens_used : Number(row.tokens_used) || 0,
            timestamp: typeof row.created_at === 'string' ? Date.parse(row.created_at) : Date.now(),
          }))
        );
      } catch (err: unknown) {
        logger.error('Ledger analytics error', {
          error: err instanceof Error ? err.message : String(err),
        });
        return emptyAnalytics();
      }
    },

    async getAdminAnalytics() {
      try {
        const { data, error } = await supabase.from('ai_sessions').select('user_id, tokens_used');

        if (error) {
          logger.error('Ledger admin analytics error', { error: error.message });
          return emptyAdminAnalytics();
        }

        const rows = (data as Array<Record<string, unknown>>) ?? [];
        return buildAdminAnalytics(
          rows.map((row) => ({
            userId: typeof row.user_id === 'string' ? row.user_id : 'unknown',
            tokensUsed:
              typeof row.tokens_used === 'number' ? row.tokens_used : Number(row.tokens_used) || 0,
          }))
        );
      } catch (err: unknown) {
        logger.error('Ledger admin analytics error', {
          error: err instanceof Error ? err.message : String(err),
        });
        return emptyAdminAnalytics();
      }
    },
  };
};

interface LedgerEntry extends AiLedgerSession {
  userId: string;
  timestamp: number;
}

export const createMemoryAiLedger = (): AiLedger => {
  const ledger: LedgerEntry[] = [];

  const prune = (now: number): void => {
    const cutoff = now - PAID_PERIOD_MS;
    const index = ledger.findIndex((item) => item.timestamp >= cutoff);
    if (index >= 0) ledger.splice(0, index);
  };

  return {
    async countRecentRequests(userId, planId) {
      const now = Date.now();
      prune(now);
      const { windowMs } = getLimitForPlan(planId);
      const startTime = now - windowMs;
      return ledger.filter((item) => item.userId === userId && item.timestamp >= startTime).length;
    },

    async logSession(userId, session) {
      ledger.push({ userId, timestamp: Date.now(), ...session });
    },

    async getUserAnalytics(userId) {
      const now = Date.now();
      prune(now);
      return buildAnalytics(
        ledger
          .filter((item) => item.userId === userId)
          .map((item) => ({
            operation: item.operation,
            durationMs: item.durationMs || 0,
            tokensUsed: item.tokensUsed || 0,
            timestamp: item.timestamp,
          }))
      );
    },

    async getAdminAnalytics() {
      const now = Date.now();
      prune(now);
      return buildAdminAnalytics(
        ledger.map((item) => ({ userId: item.userId, tokensUsed: item.tokensUsed || 0 }))
      );
    },
  };
};

const readPersistedEntries = async (filePath: string): Promise<LedgerEntry[]> => {
  try {
    const raw = await fsp.readFile(filePath, 'utf8');
    const entries: LedgerEntry[] = [];
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line) as LedgerEntry;
        if (
          parsed &&
          typeof parsed.userId === 'string' &&
          typeof parsed.timestamp === 'number' &&
          typeof parsed.operation === 'string'
        ) {
          entries.push(parsed);
        }
      } catch {
        // A single malformed line must not corrupt the whole ledger.
      }
    }
    return entries;
  } catch {
    return [];
  }
};

const writePersistedEntries = async (filePath: string, entries: LedgerEntry[]): Promise<void> => {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  const lines = entries.map((entry) => JSON.stringify(entry));
  await fsp.writeFile(filePath, lines.length > 0 ? `${lines.join('\n')}\n` : '', 'utf8');
};

const pruneEntries = (entries: LedgerEntry[], now: number): LedgerEntry[] => {
  const cutoff = now - PAID_PERIOD_MS;
  return entries.filter((item) => item.timestamp >= cutoff);
};

export const createFileAiLedger = (filePath: string): AiLedger => {
  return {
    async countRecentRequests(userId, planId) {
      const now = Date.now();
      const entries = pruneEntries(await readPersistedEntries(filePath), now);
      const { windowMs } = getLimitForPlan(planId);
      const startTime = now - windowMs;
      return entries.filter((item) => item.userId === userId && item.timestamp >= startTime).length;
    },

    async logSession(userId, session) {
      try {
        const now = Date.now();
        const entries = pruneEntries(await readPersistedEntries(filePath), now);
        entries.push({ userId, timestamp: now, ...session });
        await writePersistedEntries(filePath, entries);
      } catch (err: unknown) {
        logger.error('File ledger log error', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },

    async getUserAnalytics(userId) {
      const now = Date.now();
      const entries = pruneEntries(await readPersistedEntries(filePath), now);
      return buildAnalytics(
        entries
          .filter((item) => item.userId === userId)
          .map((item) => ({
            operation: item.operation,
            durationMs: item.durationMs || 0,
            tokensUsed: item.tokensUsed || 0,
            timestamp: item.timestamp,
          }))
      );
    },

    async getAdminAnalytics() {
      const now = Date.now();
      const entries = pruneEntries(await readPersistedEntries(filePath), now);
      return buildAdminAnalytics(
        entries.map((item) => ({ userId: item.userId, tokensUsed: item.tokensUsed || 0 }))
      );
    },
  };
};

export const createAiLedger = (config: {
  workspace?: Record<string, unknown>;
  ledger?: { filePath?: string };
}): AiLedger => {
  if (config.workspace?.configured) {
    return createSupabaseAiLedger(config);
  }
  const filePath = config.ledger?.filePath;
  if (filePath) {
    return createFileAiLedger(filePath);
  }
  return createMemoryAiLedger();
};

interface PlanLimitInfo {
  daily: number | null;
  monthly: number | null;
}

const _getAiPlanLimits = (): Record<string, PlanLimitInfo> => ({
  free: { daily: FREE_DAILY_LIMIT, monthly: null },
  junior: { daily: null, monthly: 50 },
  senior: { daily: null, monthly: 150 },
  specialist: { daily: null, monthly: 300 },
  master: { daily: null, monthly: 600 },
  team: { daily: null, monthly: 1500 },
});
