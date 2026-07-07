export const PRODUCT_ANALYTICS_EVENT_NAMES = [
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
  'screen_viewed',
  'screen_duration',
  'feedback_submitted',
  'template_used',
  'quick_ai_action_used',
  'daily_task_completed',
  'seven_day_report_generated',
  'beta_payment_intent',
] as const;

export type ProductAnalyticsEventName =
  (typeof PRODUCT_ANALYTICS_EVENT_NAMES)[number];

export type ProductAnalyticsSkill =
  | 'reading'
  | 'writing'
  | 'listening'
  | 'speaking'
  | 'vocabulary'
  | 'grammar';

export interface ProductAnalyticsMetadata {
  skill?: ProductAnalyticsSkill;
  missionId?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  subscriptionStatus?:
    | 'none'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'incomplete'
    | 'enterprise_pending';
  source?: 'user' | 'system' | 'checkout_return';
  rating?: number;
}

export interface ProductAnalyticsEvent {
  id: string;
  name: ProductAnalyticsEventName;
  screen: string;
  timestamp: string;
  durationSeconds?: number;
  metadata?: ProductAnalyticsMetadata;
}

export interface ProductAnalyticsProvider {
  readonly name: string;
  track(event: ProductAnalyticsEvent): void | Promise<void>;
}

export type ProductAnalyticsProviderMode =
  | 'disabled'
  | 'local'
  | 'console'
  | 'posthog'
  | 'custom';
