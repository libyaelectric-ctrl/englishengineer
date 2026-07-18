import { createSupabaseBillingRepository } from './supabase-billing-repository.js';
import type { SubscriptionSnapshot } from './billing-helpers.js';

export interface SubscriptionRepository {
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
  getProcessedEventCount?(): number;
}

const pruneEvents = (
  events: Map<string, number>,
  now: number,
  ttlMs: number,
  maxEntries: number
): void => {
  for (const [eventId, timestamp] of events) {
    if (now - timestamp >= ttlMs) events.delete(eventId);
  }
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

  const pruneSubscriptions = (): void => {
    while (subscriptions.size > subscriptionCacheMax) {
      const oldest = subscriptions.keys().next().value;
      if (oldest === undefined) break;
      subscriptions.delete(oldest);
    }
  };

  return {
    mode: 'memory',
    async getSubscriptionStatus(userId) {
      return subscriptions.get(userId) ?? null;
    },
    async upsertSubscriptionStatus(userId, snapshot) {
      subscriptions.set(userId, snapshot);
      pruneSubscriptions();
    },
    async hasStripeEventBeenProcessed(eventId) {
      pruneEvents(events, now(), eventTtlMs, eventCacheMax);
      return events.has(eventId);
    },
    async markStripeEventProcessed(eventId) {
      events.delete(eventId);
      events.set(eventId, now());
      pruneEvents(events, now(), eventTtlMs, eventCacheMax);
    },
    getProcessedEventCount() {
      pruneEvents(events, now(), eventTtlMs, eventCacheMax);
      return events.size;
    },
  };
};

export const createSubscriptionRepository = (
  config: {
    repositoryMode?: string;
    environment?: string;
    allowMemoryRepository?: boolean;
    eventCacheTtlMs?: number;
    eventCacheMax?: number;
    supabaseUrl?: string;
    supabaseServiceRoleKey?: string;
  },
  fetchImpl: typeof fetch = fetch
): SubscriptionRepository => {
  if (config.repositoryMode === 'supabase') {
    return createSupabaseBillingRepository({
      supabaseUrl: config.supabaseUrl!,
      supabaseServiceRoleKey: config.supabaseServiceRoleKey!,
    }, fetchImpl);
  }
  if (config.environment === 'production' && !config.allowMemoryRepository) {
    throw new Error(
      'Persistent billing repository is required in production. Configure a repository adapter or explicitly allow memory storage for a non-public environment.'
    );
  }
  return createMemorySubscriptionRepository({
    eventTtlMs: config.eventCacheTtlMs,
    eventCacheMax: config.eventCacheMax,
  });
};
