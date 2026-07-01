import { create } from 'zustand';
import { BetaService } from './beta.service';
import {
  BetaFeedbackEntry,
  BetaOnboardingProfile,
  ProductAnalyticsSummary,
} from './beta.types';
import type { ProductAnalyticsEventName } from '@/features/analytics/product-analytics.types';

interface BetaStoreState {
  onboardingProfile: BetaOnboardingProfile | null;
  feedbackEntries: BetaFeedbackEntry[];
  analyticsSummary: ProductAnalyticsSummary;
  completeOnboarding: (
    profile: Omit<BetaOnboardingProfile, 'completedAt'>
  ) => void;
  submitFeedback: (entry: Omit<BetaFeedbackEntry, 'id' | 'createdAt'>) => void;
  trackScreen: (screen: string) => void;
  trackEvent: (
    name: ProductAnalyticsEventName,
    screen: string,
    durationSeconds?: number
  ) => void;
}

export const useBetaStore = create<BetaStoreState>((set) => ({
  onboardingProfile: BetaService.getOnboardingProfile(),
  feedbackEntries: BetaService.getFeedbackEntries(),
  analyticsSummary: BetaService.getAnalyticsSummary(),

  completeOnboarding: (profile) => {
    const saved = BetaService.saveOnboardingProfile(profile);
    BetaService.trackEvent('onboarding_completed', 'onboarding');
    set({
      onboardingProfile: saved,
      analyticsSummary: BetaService.getAnalyticsSummary(),
    });
  },

  submitFeedback: (entry) => {
    BetaService.saveFeedback(entry);
    BetaService.trackEvent('feedback_submitted', entry.screen);
    set({
      feedbackEntries: BetaService.getFeedbackEntries(),
      analyticsSummary: BetaService.getAnalyticsSummary(),
    });
  },

  trackScreen: (screen) => {
    BetaService.trackEvent('screen_viewed', screen);
    set({ analyticsSummary: BetaService.getAnalyticsSummary() });
  },
  trackEvent: (name, screen, durationSeconds) => {
    BetaService.trackEvent(name, screen, durationSeconds);
    set({ analyticsSummary: BetaService.getAnalyticsSummary() });
  },
}));
