const createHeaders = (serviceRoleKey, prefer) => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
  ...(prefer ? { Prefer: prefer } : {}),
});

const assertConfigured = (config) => {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error(
      'Supabase billing repository requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
};

const mapSubscriptionRow = (row) =>
  row
    ? {
        planId: row.plan_id,
        status: row.status,
        currentPeriodEnd: row.current_period_end,
        cancelAtPeriodEnd: row.cancel_at_period_end,
        stripeCustomerId: row.stripe_customer_id,
        stripeSubscriptionId: row.stripe_subscription_id,
        updatedAt: row.updated_at,
        source: row.source,
      }
    : null;

const mapSubscriptionSnapshot = (userId, snapshot) => ({
  user_id: userId,
  plan_id: snapshot.planId,
  status: snapshot.status,
  current_period_end: snapshot.currentPeriodEnd,
  cancel_at_period_end: snapshot.cancelAtPeriodEnd,
  stripe_customer_id: snapshot.stripeCustomerId,
  stripe_subscription_id: snapshot.stripeSubscriptionId,
  updated_at: snapshot.updatedAt,
  source: snapshot.source,
});

export const createSupabaseBillingRepository = (config, fetchImpl = fetch) => {
  assertConfigured(config);
  const restUrl = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1`;
  const request = async (path, init = {}) => {
    const { prefer, ...requestInit } = init;
    const response = await fetchImpl(`${restUrl}/${path}`, {
      ...requestInit,
      headers: {
        ...createHeaders(config.supabaseServiceRoleKey, prefer),
        ...init.headers,
      },
    });
    if (!response.ok) {
      let errorBody = 'N/A';
      try {
        errorBody = await response.text();
      } catch {}
      const dbError = new Error(
        `Supabase billing repository request failed with status ${response.status}.`
      );
      dbError.status = response.status;
      try {
        const parsed = JSON.parse(errorBody);
        dbError.code = parsed.code || 'N/A';
        dbError.details = parsed.details || parsed.message || errorBody;
      } catch {
        dbError.code = 'N/A';
        dbError.details = errorBody;
      }
      throw dbError;
    }
    return response;
  };

  return {
    mode: 'supabase',
    async getSubscriptionStatus(userId) {
      const response = await request(
        `subscription_status?user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,
        { method: 'GET' }
      );
      const rows = await response.json();
      return mapSubscriptionRow(Array.isArray(rows) ? rows[0] : null);
    },
    async upsertSubscriptionStatus(userId, snapshot) {
      await request('subscription_status?on_conflict=user_id', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=minimal',
        body: JSON.stringify(mapSubscriptionSnapshot(userId, snapshot)),
      });
    },
    async hasStripeEventBeenProcessed(eventId) {
      const response = await request(
        `stripe_processed_events?stripe_event_id=eq.${encodeURIComponent(eventId)}&select=stripe_event_id&limit=1`,
        { method: 'GET' }
      );
      const rows = await response.json();
      return Array.isArray(rows) && rows.length > 0;
    },
    async markStripeEventProcessed(eventId, metadata = {}) {
      await request('stripe_processed_events?on_conflict=stripe_event_id', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=minimal',
        body: JSON.stringify({
          stripe_event_id: eventId,
          event_type:
            typeof metadata.type === 'string' ? metadata.type : 'unknown',
          processed_at:
            typeof metadata.processedAt === 'string'
              ? metadata.processedAt
              : new Date().toISOString(),
          metadata,
        }),
      });
    },
  };
};
