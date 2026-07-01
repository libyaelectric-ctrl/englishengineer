import { afterEach, describe, expect, it } from 'vitest';
import {
  PRODUCT_ANALYTICS_EVENT_NAMES,
  type ProductAnalyticsEvent,
  type ProductAnalyticsMetadata,
} from './product-analytics.types';
import {
  ProductAnalyticsService,
  sanitizeProductAnalyticsMetadata,
} from './product-analytics.service';

const requiredFunnelEvents = [
  'signup_started',
  'signup_completed',
  'onboarding_started',
  'onboarding_completed',
  'first_task_started',
  'first_task_completed',
  'vocabulary_review_started',
  'vocabulary_review_completed',
  'grammar_task_started',
  'grammar_task_completed',
  'speaking_roleplay_started',
  'speaking_roleplay_completed',
  'writing_task_started',
  'writing_task_completed',
  'review_queue_opened',
  'paywall_viewed',
  'checkout_started',
  'checkout_completed',
  'subscription_cancel_clicked',
  'subscription_cancel_at_period_end_detected',
] as const;

describe('product analytics privacy guard', () => {
  afterEach(() => ProductAnalyticsService.setProvider(null));

  it('defines every required funnel event in the typed catalog', () => {
    requiredFunnelEvents.forEach((name) =>
      expect(PRODUCT_ANALYTICS_EVENT_NAMES).toContain(name)
    );
  });

  it('drops raw answers, personal data and invalid free-text metadata', () => {
    const unsafe = {
      skill: 'writing',
      missionId: 'A full raw writing answer must not pass',
      rating: 9,
      rawAnswer: 'confidential report text',
      email: 'engineer@example.com',
      transcript: 'raw speaking transcript',
    } as unknown as ProductAnalyticsMetadata;

    expect(sanitizeProductAnalyticsMetadata(unsafe)).toEqual({
      skill: 'writing',
      rating: 5,
    });
  });

  it('sends only sanitized metadata through a pluggable provider', () => {
    const events: ProductAnalyticsEvent[] = [];
    ProductAnalyticsService.setProvider({
      name: 'test-provider',
      track: (event) => {
        events.push(event);
      },
    });

    ProductAnalyticsService.track('writing_task_completed', '/writing', {
      durationSeconds: -4,
      metadata: {
        skill: 'writing',
        missionId: 'writing_technical_email_01',
        source: 'user',
      },
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      name: 'writing_task_completed',
      screen: '/writing',
      durationSeconds: 0,
      metadata: {
        skill: 'writing',
        missionId: 'writing_technical_email_01',
        source: 'user',
      },
    });
    expect(events[0]).not.toHaveProperty('userId');
  });
});

// @vitest-environment node
