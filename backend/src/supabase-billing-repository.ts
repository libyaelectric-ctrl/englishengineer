import { createClient } from '@supabase/supabase-js';
import { logger } from './logger.js';
import type { SubscriptionSnapshot } from './billing-helpers.js';

const assertConfigured = (config: { supabaseUrl?: string | null; supabaseServiceRoleKey?: string | null }): void => {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error('Supabase billing repository requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
};

interface SubscriptionRow {
  plan_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  updated_at: string;
  source: string;
  topup_credits?: number;
}

const mapSubscriptionRow = (
  row: SubscriptionRow | null
): SubscriptionSnapshot | null =>
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

const mapSubscriptionSnapshot = (
  userId: string,
  snapshot: SubscriptionSnapshot
) => ({
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

const handleDbError = (error: { message?: string; status?: number; code?: string; details?: string }): Error => {
  const message = error.message || 'Supabase billing repository request failed.';
  const dbError = new Error(message) as Error & { status: number; code: string; details: string };
  dbError.status = error.status || 500;
  dbError.code = error.code || 'N/A';
  dbError.details = error.details || error.message || 'N/A';
  return dbError;
};

interface BillingRepository {
  mode: string;
  getSubscriptionStatus(userId: string): Promise<SubscriptionSnapshot | null>;
  upsertSubscriptionStatus(
    userId: string,
    snapshot: SubscriptionSnapshot
  ): Promise<void>;
  hasStripeEventBeenProcessed(eventId: string): Promise<boolean>;
  markStripeEventProcessed(
    eventId: string,
    metadata?: Record<string, unknown>
  ): Promise<void>;
}

export const createSupabaseBillingRepository = (
  config: { supabaseUrl: string; supabaseServiceRoleKey: string; [key: string]: unknown },
  fetchImpl: typeof fetch = fetch
): BillingRepository => {
  assertConfigured(config);

  const wrappedFetch = async (url: string, init?: RequestInit) => {
    let headersObj: Record<string, string> = {};
    if (init?.headers) {
      const h = init.headers;
      if (h instanceof Headers) {
        h.forEach((value, key) => {
          if (key.toLowerCase() === 'authorization') headersObj['Authorization'] = value;
          else if (key.toLowerCase() === 'apikey') headersObj['apikey'] = value;
          else headersObj[key] = value;
        });
      } else {
        headersObj = { ...(h as Record<string, string>) };
      }
    }
    const response = await fetchImpl(url, { ...init, headers: headersObj });
    if (!response.ok) {
      let bodyText = '';
      try { bodyText = await response.text(); }
      catch (readErr: unknown) { logger.warn('Billing repo error body', { error: readErr instanceof Error ? readErr.message : String(readErr) }); }
      const err = new Error(`Supabase billing repository request failed with status ${response.status}. Details: ${bodyText}`) as Error & { status: number };
      err.status = response.status;
      throw err;
    }
    return response;
  };

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
    { auth: { persistSession: false }, global: { fetch: wrappedFetch as typeof fetch } }
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
      return mapSubscriptionRow(data as SubscriptionRow);
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
