import { IdService } from '@/core/ids';
import { storage } from '@/shared/storage';
import {
  ConsoleProductAnalyticsProvider,
  LocalProductAnalyticsProvider,
  PRODUCT_ANALYTICS_STORAGE_KEY,
} from './product-analytics.provider';
import type {
  ProductAnalyticsEvent,
  ProductAnalyticsEventName,
  ProductAnalyticsMetadata,
  ProductAnalyticsProvider,
  ProductAnalyticsProviderMode,
} from './product-analytics.types';

interface ProductAnalyticsEnv {
  VITE_PRODUCT_ANALYTICS_ENABLED?: string;
  VITE_PRODUCT_ANALYTICS_PROVIDER?: string;
}

interface ImportMetaWithProductAnalyticsEnv {
  env?: ProductAnalyticsEnv;
}

const ONCE_KEY_PREFIX = 'product_analytics_once_';
const skills = new Set([
  'reading',
  'writing',
  'listening',
  'speaking',
  'vocabulary',
  'grammar',
]);
const plans = new Set(['free', 'pro', 'enterprise']);
const subscriptionStatuses = new Set([
  'none',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'enterprise_pending',
]);
const sources = new Set(['user', 'system', 'checkout_return']);

const getConfig = (): {
  enabled: boolean;
  mode: ProductAnalyticsProviderMode;
} => {
  const env = (import.meta as unknown as ImportMetaWithProductAnalyticsEnv).env;
  const enabled =
    String(env?.VITE_PRODUCT_ANALYTICS_ENABLED ?? 'true').toLowerCase() !==
    'false';
  const requested = String(
    env?.VITE_PRODUCT_ANALYTICS_PROVIDER ?? 'local'
  ).toLowerCase();
  const mode: ProductAnalyticsProviderMode = ['local', 'console'].includes(
    requested
  )
    ? (requested as 'local' | 'console')
    : 'local';
  return { enabled, mode: enabled ? mode : 'disabled' };
};

export const sanitizeProductAnalyticsMetadata = (
  value: unknown
): ProductAnalyticsMetadata | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  const input = value as Record<string, unknown>;
  const sanitized: ProductAnalyticsMetadata = {};
  if (typeof input.skill === 'string' && skills.has(input.skill)) {
    sanitized.skill = input.skill as ProductAnalyticsMetadata['skill'];
  }
  if (
    typeof input.missionId === 'string' &&
    /^[a-zA-Z0-9:_-]{1,100}$/.test(input.missionId)
  ) {
    sanitized.missionId = input.missionId;
  }
  if (typeof input.plan === 'string' && plans.has(input.plan)) {
    sanitized.plan = input.plan as ProductAnalyticsMetadata['plan'];
  }
  if (
    typeof input.subscriptionStatus === 'string' &&
    subscriptionStatuses.has(input.subscriptionStatus)
  ) {
    sanitized.subscriptionStatus =
      input.subscriptionStatus as ProductAnalyticsMetadata['subscriptionStatus'];
  }
  if (typeof input.source === 'string' && sources.has(input.source)) {
    sanitized.source = input.source as ProductAnalyticsMetadata['source'];
  }
  if (typeof input.rating === 'number') {
    sanitized.rating = Math.max(1, Math.min(5, Math.round(input.rating)));
  }
  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
};

let customProvider: ProductAnalyticsProvider | null = null;

const resolveProvider = (): ProductAnalyticsProvider | null => {
  const config = getConfig();
  if (!config.enabled) return null;
  if (customProvider) return customProvider;
  return config.mode === 'console'
    ? new ConsoleProductAnalyticsProvider()
    : new LocalProductAnalyticsProvider();
};

export const ProductAnalyticsService = {
  getMode(): ProductAnalyticsProviderMode {
    if (customProvider) return 'custom';
    return getConfig().mode;
  },

  setProvider(provider: ProductAnalyticsProvider | null): void {
    customProvider = provider;
  },

  track(
    name: ProductAnalyticsEventName,
    screen: string,
    options: {
      durationSeconds?: number;
      metadata?: ProductAnalyticsMetadata;
    } = {}
  ): void {
    const provider = resolveProvider();
    if (!provider) return;
    const metadata = sanitizeProductAnalyticsMetadata(options.metadata);
    const event: ProductAnalyticsEvent = {
      id: IdService.createId('product_event'),
      name,
      screen: screen.trim().slice(0, 120) || 'unknown',
      timestamp: new Date().toISOString(),
      ...(options.durationSeconds !== undefined
        ? { durationSeconds: Math.max(0, Math.round(options.durationSeconds)) }
        : {}),
      ...(metadata ? { metadata } : {}),
    };
    void provider.track(event);
  },

  trackOnce(
    name: ProductAnalyticsEventName,
    screen: string,
    metadata?: ProductAnalyticsMetadata
  ): void {
    const key = `${ONCE_KEY_PREFIX}${name}`;
    if (storage.get<boolean>(key)) return;
    this.track(name, screen, { metadata });
    storage.set(key, true);
  },

  getLocalEvents(): ProductAnalyticsEvent[] {
    return (
      storage.get<ProductAnalyticsEvent[]>(PRODUCT_ANALYTICS_STORAGE_KEY) || []
    );
  },
};
