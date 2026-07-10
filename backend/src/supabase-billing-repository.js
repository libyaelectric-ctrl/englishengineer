import { createClient } from '@supabase/supabase-js';

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
        topupCredits: row.topup_credits || 0,
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
  topup_credits: snapshot.topupCredits || 0,
});

const handleDbError = (error) => {
  const message =
    error.message || 'Supabase billing repository request failed.';
  const dbError = new Error(message);
  dbError.status = error.status || 500;
  dbError.code = error.code || 'N/A';
  dbError.details = error.details || error.message || 'N/A';
  return dbError;
};

export const createSupabaseBillingRepository = (config, fetchImpl = fetch) => {
  assertConfigured(config);

  const wrappedFetch = async (url, init) => {
    let headersObj = {};
    if (init?.headers) {
      if (typeof init.headers.forEach === 'function') {
        init.headers.forEach((value, key) => {
          headersObj[key] = value;
          if (key.toLowerCase() === 'authorization') {
            headersObj['Authorization'] = value;
          }
          if (key.toLowerCase() === 'apikey') {
            headersObj['apikey'] = value;
          }
        });
      } else {
        headersObj = { ...init.headers };
      }
    }
    const newInit = {
      ...init,
      headers: headersObj,
    };
    const response = await fetchImpl(url, newInit);
    if (!response.ok) {
      let bodyText = '';
      try {
        bodyText = await response.text();
      } catch {}
      const err = new Error(
        `Supabase billing repository request failed with status ${response.status}. Details: ${bodyText}`
      );
      err.status = response.status;
      throw err;
    }
    return response;
  };

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
      },
      global: {
        fetch: wrappedFetch,
      },
    }
  );

  return {
    mode: 'supabase',
    async getSubscriptionStatus(userId) {
      const { data, error } = await supabase
        .from('subscription_status')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      if (error) {
        throw handleDbError(error);
      }
      return mapSubscriptionRow(data);
    },
    async upsertSubscriptionStatus(userId, snapshot) {
      const { error } = await supabase
        .from('subscription_status')
        .upsert(mapSubscriptionSnapshot(userId, snapshot), {
          onConflict: 'user_id',
        });
      if (error) {
        throw handleDbError(error);
      }
    },
    async hasStripeEventBeenProcessed(eventId) {
      const { data, error } = await supabase
        .from('stripe_processed_events')
        .select('stripe_event_id')
        .eq('stripe_event_id', eventId)
        .limit(1)
        .maybeSingle();
      if (error) {
        throw handleDbError(error);
      }
      return !!data;
    },
    async markStripeEventProcessed(eventId, metadata = {}) {
      const { error } = await supabase.from('stripe_processed_events').upsert(
        {
          stripe_event_id: eventId,
          event_type:
            typeof metadata.type === 'string' ? metadata.type : 'unknown',
          processed_at:
            typeof metadata.processedAt === 'string'
              ? metadata.processedAt
              : new Date().toISOString(),
          metadata,
        },
        {
          onConflict: 'stripe_event_id',
        }
      );
      if (error) {
        throw handleDbError(error);
      }
    },
  };
};
