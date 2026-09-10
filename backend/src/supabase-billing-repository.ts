/* eslint-disable complexity */
import { createClient } from '@supabase/supabase-js';
import type { SubscriptionSnapshot } from './billing-helpers.js';
import { normalizePlanId } from './billing-plan-migration.js';
import { logger } from './logger.js';
import type { SubscriptionRepository, TopupConsumptionResult } from './subscription-repository.js';
const assertConfigured = (config: { supabaseUrl?: string | null; supabaseServiceRoleKey?: string | null }): void => {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) throw new Error('Supabase billing repository requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
};
interface SubscriptionRow { plan_id: string; status: string; current_period_end: string | null; cancel_at_period_end: boolean; stripe_customer_id: string | null; stripe_subscription_id: string | null; updated_at: string; source: string; topup_credits?: number; }
const mapSubscriptionRow = (row: SubscriptionRow | null): SubscriptionSnapshot | null => row ? { planId: normalizePlanId(row.plan_id), status: row.status, currentPeriodEnd: row.current_period_end, cancelAtPeriodEnd: row.cancel_at_period_end, stripeCustomerId: row.stripe_customer_id, stripeSubscriptionId: row.stripe_subscription_id, updatedAt: row.updated_at, source: row.source, topupCredits: row.topup_credits || 0 } : null;
const mapSubscriptionSnapshot = (userId: string, snapshot: SubscriptionSnapshot) => ({ user_id: userId, plan_id: snapshot.planId, status: snapshot.status, current_period_end: snapshot.currentPeriodEnd, cancel_at_period_end: snapshot.cancelAtPeriodEnd, stripe_customer_id: snapshot.stripeCustomerId, stripe_subscription_id: snapshot.stripeSubscriptionId, updated_at: snapshot.updatedAt, source: snapshot.source, topup_credits: snapshot.topupCredits ?? 0 });
const handleDbError = (error: { message?: string; status?: number; code?: string; details?: string }): Error => { const value = new Error(error.message || 'Supabase billing repository request failed.') as Error & { status: number; code: string; details: string }; value.status = error.status || 500; value.code = error.code || 'N/A'; value.details = error.details || error.message || 'N/A'; return value; };
export const createSupabaseBillingRepository = (config: { supabaseUrl: string; supabaseServiceRoleKey: string; [key: string]: unknown }, fetchImpl: typeof fetch = fetch): SubscriptionRepository => {
  assertConfigured(config);
  const wrappedFetch = async (url: string, init?: RequestInit) => {
    let headersObj: Record<string, string> = {};
    if (init?.headers) { const headers = init.headers; if (headers instanceof Headers) headers.forEach((value, key) => { headersObj[key.toLowerCase() === 'authorization' ? 'Authorization' : key] = value; }); else headersObj = { ...(headers as Record<string, string>) }; }
    const response = await fetchImpl(url, { ...init, headers: headersObj });
    if (!response.ok) { let bodyText = ''; try { bodyText = await response.text(); } catch {} logger.warn('Billing repo error body', { body: bodyText }); const error = new Error(`Supabase billing repository request failed with status ${response.status}`) as Error & { status: number }; error.status = response.status; throw error; }
    return response;
  };
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, { auth: { persistSession: false }, global: { fetch: wrappedFetch as typeof fetch } });
  return {
    mode: 'supabase',
    async getSubscriptionStatus(userId) { const { data, error } = await supabase.from('subscription_status').select('*').eq('user_id', userId).limit(1).maybeSingle(); if (error) throw handleDbError(error); return mapSubscriptionRow(data as SubscriptionRow); },
    async upsertSubscriptionStatus(userId, snapshot) { const { error } = await supabase.from('subscription_status').upsert(mapSubscriptionSnapshot(userId, snapshot), { onConflict: 'user_id' }); if (error) throw handleDbError(error); },
    async consumeTopupCredit(userId, requestId) { const { data, error } = await supabase.rpc('consume_ai_topup_credit', { p_user_id: userId, p_request_id: requestId }); if (error) throw handleDbError(error); const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null; if (!row) throw new Error('Atomic top-up RPC returned no result.'); return { consumed: row.consumed === true, duplicate: row.duplicate === true, remainingCredits: Number(row.remaining_credits) || 0 } satisfies TopupConsumptionResult; },
    async hasStripeEventBeenProcessed(eventId) { const { data, error } = await supabase.from('stripe_processed_events').select('stripe_event_id').eq('stripe_event_id', eventId).limit(1).maybeSingle(); if (error) throw handleDbError(error); return !!data; },
    async upsertBillingCustomer(data) { const row: Record<string, unknown> = { user_id: data.userId, updated_at: new Date().toISOString() }; if (data.dodoCustomerId) row.dodo_customer_id = data.dodoCustomerId; if (data.stripeCustomerId) row.stripe_customer_id = data.stripeCustomerId; if (data.billingEmail) row.billing_email = data.billingEmail; const { error } = await supabase.from('billing_customers').upsert(row, { onConflict: 'user_id' }); if (error) logger.warn('Failed to upsert billing customer', { error: error.message, userId: data.userId }); },
    async markStripeEventProcessed(eventId, metadata = {}) { const { error } = await supabase.from('stripe_processed_events').upsert({ stripe_event_id: eventId, event_type: typeof metadata.type === 'string' ? metadata.type : 'unknown', processed_at: typeof metadata.processedAt === 'string' ? metadata.processedAt : new Date().toISOString(), metadata }, { onConflict: 'stripe_event_id' }); if (error) throw handleDbError(error); },
  };
};
