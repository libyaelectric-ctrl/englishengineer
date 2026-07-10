const createHeaders = (serviceRoleKey) => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
});

const FREE_DAILY_LIMIT = 3;
const PAID_MONTHLY_LIMIT = 300;

const FREE_PERIOD_MS = 24 * 60 * 60 * 1000;
const PAID_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const getLimitForPlan = (planId) => ({
  max: planId === 'free' ? FREE_DAILY_LIMIT : PAID_MONTHLY_LIMIT,
  windowMs: planId === 'free' ? FREE_PERIOD_MS : PAID_PERIOD_MS,
});

export const createSupabaseAiLedger = (config, fetchImpl = fetch) => {
  if (!config.workspace?.configured) {
    throw new Error(
      'AI ledger requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  const restUrl = `${config.workspace.supabaseUrl.replace(/\/$/, '')}/rest/v1`;
  const headers = createHeaders(config.workspace.supabaseServiceRoleKey);

  return {
    async countRecentRequests(userId, planId) {
      const { windowMs } = getLimitForPlan(planId);
      const startDateIso = new Date(Date.now() - windowMs).toISOString();
      const url = `${restUrl}/ai_sessions?user_id=eq.${encodeURIComponent(userId)}&created_at=gte.${encodeURIComponent(startDateIso)}&select=id`;
      try {
        const response = await fetchImpl(url, { method: 'GET', headers });
        if (!response.ok) return 0;
        const rows = await response.json();
        return Array.isArray(rows) ? rows.length : 0;
      } catch (err) {
        console.error('[ai-ledger-count-error]', err.message);
        return 0;
      }
    },

    async logSession(userId, session) {
      const url = `${restUrl}/ai_sessions`;
      try {
        await fetchImpl(url, {
          method: 'POST',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({
            user_id: userId,
            mode_id: session.modeId || 'unknown',
            provider: session.provider || 'mock',
            operation: session.operation,
            success: true,
            duration_ms: session.durationMs || 0,
            result_summary: session.resultSummary || '',
            metadata: {},
          }),
        });
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

export const createAiLedger = (config, fetchImpl = fetch) => {
  if (config.workspace?.configured) {
    return createSupabaseAiLedger(config, fetchImpl);
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
