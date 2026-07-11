// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { calculateProductAnalyticsSummary } from './beta.helpers';
import { ProductAnalyticsEvent } from './beta.types';
import type { ProductAnalyticsEventName } from '@/features/analytics/product-analytics.types';

const event = (
  name: ProductAnalyticsEventName,
  daysAgo = 0
): ProductAnalyticsEvent => ({
  id: `${name}-${daysAgo}`,
  name,
  screen: '/test',
  timestamp: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
});

describe('closed beta analytics', () => {
  it('counts product adoption events independently', () => {
    const summary = calculateProductAnalyticsSummary([
      event('template_used'),
      event('template_used'),
      event('quick_ai_action_used'),
      event('daily_task_completed'),
      event('seven_day_report_generated'),
      event('beta_payment_intent'),
    ]);
    expect(summary.templatesUsed).toBe(2);
    expect(summary.quickAIActionsUsed).toBe(1);
    expect(summary.dailyTasksCompleted).toBe(1);
    expect(summary.sevenDayReportsGenerated).toBe(1);
    expect(summary.paymentIntent).toBe(1);
  });

  it('marks a returning-user signal across separate active dates', () => {
    expect(
      calculateProductAnalyticsSummary([
        event('screen_viewed'),
        event('screen_viewed', 2),
      ]).returningUsers
    ).toBe(1);
  });
});
