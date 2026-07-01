import { IdService } from '@/core/ids/id.service';
import { storage } from '@/shared/storage';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import type { ProductAnalyticsEventName } from '@/features/analytics/product-analytics.types';
import { BetaFeedbackEntry, BetaOnboardingProfile } from './beta.types';
import { calculateProductAnalyticsSummary } from './beta.helpers';

const ONBOARDING_KEY = 'beta_onboarding_profile';
const FEEDBACK_KEY = 'beta_feedback_entries';

export const BetaService = {
  getOnboardingProfile(): BetaOnboardingProfile | null {
    return storage.get<BetaOnboardingProfile>(ONBOARDING_KEY);
  },

  saveOnboardingProfile(
    profile: Omit<BetaOnboardingProfile, 'completedAt'>
  ): BetaOnboardingProfile {
    const saved = {
      ...profile,
      completedAt: new Date().toISOString(),
    };
    storage.set(ONBOARDING_KEY, saved);
    return saved;
  },

  getFeedbackEntries(): BetaFeedbackEntry[] {
    return storage.get<BetaFeedbackEntry[]>(FEEDBACK_KEY) || [];
  },

  saveFeedback(
    entry: Omit<BetaFeedbackEntry, 'id' | 'createdAt'>
  ): BetaFeedbackEntry {
    const saved: BetaFeedbackEntry = {
      ...entry,
      id: IdService.createId('beta_feedback'),
      createdAt: new Date().toISOString(),
    };
    storage.set(
      FEEDBACK_KEY,
      [saved, ...this.getFeedbackEntries()].slice(0, 100)
    );
    return saved;
  },

  trackEvent(
    name: ProductAnalyticsEventName,
    screen: string,
    durationSeconds?: number
  ): void {
    ProductAnalyticsService.track(name, screen, { durationSeconds });
  },

  getAnalyticsSummary() {
    return calculateProductAnalyticsSummary(
      ProductAnalyticsService.getLocalEvents()
    );
  },
};
