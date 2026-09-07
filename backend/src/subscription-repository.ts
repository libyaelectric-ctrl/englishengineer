import type { SubscriptionSnapshot } from './billing-helpers.js';
import { createSupabaseBillingRepository } from './supabase-billing-repository.js';

export interface TopupConsumptionResult {
  consumed: boolean;
  duplicate: boolean;
  remainingCredits: number;
}
export interface SubscriptionRepository {
  mode: string;
  getSubscriptionStatus(userId: string): Promise<SubscriptionSnapshot | null>;
  upsertSubscriptionStatus(userId: string, snapshot: SubscriptionSnapshot): Promise<void>;
  consumeTopupCredit(userId: string, requestId: string): Promise<TopupConsumptionResult>;
  upsertBillingCustomer(data: {
    userId: string;
    dodoCustomerId?: string | null;
    stripeCustomerId?: string | null;
    billingEmail?: string | null;
  }): Promise<void>;
  hasStripeEventBeenProcessed(eventId: string): Promise<boolean>;
  markStripeEventProcessed(eventId: string, metadata?: Record<string, unknown>): Promise<void>;
  getProcessedEventCount?(): number;
}
const pruneEvents = (events: Map<string, number>, now: number, ttlMs: number, maxEntries: number): void => {
  for (const [id, timestamp] of events) if (now - timestamp >= ttlMs) events.delete(id);
  while (events.size > maxEntries) {
    const oldest = events.keys().next().value;
    if (oldest === undefined) break;
    events.delete(oldest);
  }
};
interface MemoryRepoOpts {
  eventTtlMs?: number;
  eventCacheMax?: number;
  subscriptionCacheMax?: number;
  now?: () => number;
}
export const createMemorySubscriptionRepository = ({
  eventTtlMs = 86_400_000,
  eventCacheMax = 5_000,
  subscriptionCacheMax = 10_000,
  now = () => Date.now(),
}: MemoryRepoOpts = {}): SubscriptionRepository => {
  const subscriptions = new Map<string, SubscriptionSnapshot>();
  const events = new Map<string, number>();
  const consumptions = new Map<string, TopupConsumptionResult>();
  const pruneSubscriptions = (): void => {
    while (subscriptions.size > subscriptionCacheMax) {
      const oldest = subscriptions.keys().next().value;
      if (oldest === undefined) break;
      subscriptions.delete(oldest);
    }
  };
  return {
    mode: 'memory',
    async getSubscriptionStatus(userId) { return subscriptions.get(userId) ?? null; },
    async upsertSubscriptionStatus(userId, snapshot) { subscriptions.set(userId, snapshot); pruneSubscriptions(); },
    async consumeTopupCredit(userId, requestId) {
      const key = `${userId}\n${requestId}`;
      const existing = consumptions.get(key);
      if (existing) return { ...existing, duplicate: true };
      const subscription = subscriptions.get(userId);
      const current = subscription?.topupCredits ?? 0;
      const result = { consumed: current > 0, duplicate: false, remainingCredits: Math.max(0, current - 1) };
      if (subscription && result.consumed) subscriptions.set(userId, { ...subscription, topupCredits: result.remainingCredits, updatedAt: new Date(now()).toISOString(), source: 'ai_atomic_credit_consumption' });
      consumptions.set(key, result);
      return result;
    },
    async hasStripeEventBeenProcessed(eventId) { pruneEvents(events, now(), eventTtlMs, eventCacheMax); return events.has(eventId); },
    async upsertBillingCustomer() {},
    async markStripeEventProcessed(eventId) { events.delete(eventId); events.set(eventId, now()); pruneEvents(events, now(), eventTtlMs, eventCacheMax); },
    getProcessedEventCount() { pruneEvents(events, now(), eventTtlMs, eventCacheMax); return events.size; },
  };
};
export const createSubscriptionRepository = (
  config: { repositoryMode?: string; environment?: string; allowMemoryRepository?: boolean; eventCacheTtlMs?: number; eventCacheMax?: number; supabaseUrl?: string; supabaseServiceRoleKey?: string },
  fetchImpl: typeof fetch = fetch
): SubscriptionRepository => {
  if (config.repositoryMode === 'supabase') return createSupabaseBillingRepository({ supabaseUrl: config.supabaseUrl!, supabaseServiceRoleKey: config.supabaseServiceRoleKey! }, fetchImpl);
  if (config.environment === 'production' && !config.allowMemoryRepository) throw new Error('Persistent billing repository is required in production. Configure a repository adapter or explicitly allow memory storage for a non-public environment.');
  return createMemorySubscriptionRepository({ eventTtlMs: config.eventCacheTtlMs, eventCacheMax: config.eventCacheMax });
};
