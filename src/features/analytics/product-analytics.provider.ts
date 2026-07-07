import { storage } from '@/shared/storage';
import { logger } from '@/shared/logger';
import type {
  ProductAnalyticsEvent,
  ProductAnalyticsProvider,
} from './product-analytics.types';

export const PRODUCT_ANALYTICS_STORAGE_KEY = 'beta_product_analytics';

export class LocalProductAnalyticsProvider implements ProductAnalyticsProvider {
  readonly name = 'local';

  track(event: ProductAnalyticsEvent): void {
    const events =
      storage.get<ProductAnalyticsEvent[]>(PRODUCT_ANALYTICS_STORAGE_KEY) || [];
    storage.set(
      PRODUCT_ANALYTICS_STORAGE_KEY,
      [event, ...events].slice(0, 500)
    );
  }
}

export class ConsoleProductAnalyticsProvider implements ProductAnalyticsProvider {
  readonly name = 'console';

  track(event: ProductAnalyticsEvent): void {
    logger.i('[PRODUCT ANALYTICS]', {
      name: event.name,
      screen: event.screen,
      durationSeconds: event.durationSeconds,
      metadata: event.metadata,
    });
  }
}

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void;
      identify: (id: string, props?: Record<string, unknown>) => void;
    };
  }
}

export class PostHogProductAnalyticsProvider implements ProductAnalyticsProvider {
  readonly name = 'posthog';

  track(event: ProductAnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(event.name, {
        screen: event.screen,
        duration_seconds: event.durationSeconds,
        ...event.metadata,
      });
    }
  }
}
