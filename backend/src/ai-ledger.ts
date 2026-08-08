import { createClient } from '@supabase/supabase-js';

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
}

export interface AiLedger {
  countRecentRequests(userId: string, planId: string): Promise<number>;
  logSession(userId: string, session: AiLedgerSession): Promise<void>;
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
          metadata: {},
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
  };
};

export const createAiLedger = (config: { workspace?: Record<string, unknown> }): AiLedger => {
  if (config.workspace?.configured) {
    return createSupabaseAiLedger(config);
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
