import { createClient } from '@supabase/supabase-js';

const FREE_DAILY_LIMIT = 3;
const PAID_MONTHLY_LIMIT = 300;

const FREE_PERIOD_MS = 24 * 60 * 60 * 1000;
const PAID_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const getLimitForPlan = (planId) => ({
  max: planId === 'free' ? FREE_DAILY_LIMIT : PAID_MONTHLY_LIMIT,
  windowMs: planId === 'free' ? FREE_PERIOD_MS : PAID_PERIOD_MS,
});

export const createSupabaseAiLedger = (config) => {
  if (!config.workspace?.configured) {
    throw new Error('AI ledger requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const supabase = createClient(
    config.workspace.supabaseUrl,
    config.workspace.supabaseServiceRoleKey,
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
          console.error('[ai-ledger-count-error]', error.message);
          return 0;
        }
        return count ?? 0;
      } catch (err) {
        console.error('[ai-ledger-count-error]', err.message);
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
          console.error('[ai-ledger-log-error]', error.message);
        }
      } catch (err) {
        console.error('[ai-ledger-log-error]', err.message);
      }
    },
  };
};

export const createMemoryAiLedger = () => {
  const ledger = [];

  const prune = (now) => {
    const cutoff = now - PAID_PERIOD_MS;
    const index = ledger.findIndex((item) => item.timestamp >= cutoff);
    if (index > 0) ledger.splice(0, index);
  };

  return {
    async countRecentRequests(userId, planId) {
      const now = Date.now();
      prune(now);
      const { windowMs } = getLimitForPlan(planId);
      const startTime = now - windowMs;
      return ledger.filter(
        (item) => item.userId === userId && item.timestamp >= startTime
      ).length;
    },

    async logSession(userId, session) {
      ledger.push({ userId, timestamp: Date.now(), ...session });
    },
  };
};

export const createAiLedger = (config) => {
  if (config.workspace?.configured) {
    return createSupabaseAiLedger(config);
  }
  return createMemoryAiLedger();
};

export const getAiPlanLimits = () => ({
  free: { daily: FREE_DAILY_LIMIT, monthly: null },
  pro: { daily: null, monthly: PAID_MONTHLY_LIMIT },
  project: { daily: null, monthly: PAID_MONTHLY_LIMIT },
  max: { daily: null, monthly: PAID_MONTHLY_LIMIT },
  exec: { daily: null, monthly: PAID_MONTHLY_LIMIT },
  private: { daily: null, monthly: PAID_MONTHLY_LIMIT },
  team: { daily: null, monthly: PAID_MONTHLY_LIMIT },
});
