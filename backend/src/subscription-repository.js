import { createSupabaseBillingRepository } from './supabase-billing-repository.js';

const pruneEvents = (events, now, ttlMs, maxEntries) => {
  for (const [eventId, timestamp] of events) {
    if (now - timestamp >= ttlMs) events.delete(eventId);
  }
  while (events.size > maxEntries) {
    const oldest = events.keys().next().value;
    if (oldest === undefined) break;
    events.delete(oldest);
  }
};

export const createMemorySubscriptionRepository = ({
  eventTtlMs = 86_400_000,
  eventCacheMax = 5_000,
  subscriptionCacheMax = 10_000,
  now = () => Date.now(),
} = {}) => {
  const subscriptions = new Map();
  const events = new Map();

  const pruneSubscriptions = () => {
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

export const createSubscriptionRepository = (config, fetchImpl = fetch) => {
  if (config.repositoryMode === 'supabase') {
    return createSupabaseBillingRepository(config, fetchImpl);
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
