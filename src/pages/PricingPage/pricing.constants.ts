import { Building2, Sparkles } from 'lucide-react';

import { COMMERCIAL_PLAN_CATALOG } from '@/features/billing';

export const ACTIVE_PLANS = COMMERCIAL_PLAN_CATALOG.filter((plan) =>
  ['free', 'pro', 'project', 'exec', 'private'].includes(plan.id)
);

export const ACCESS_BADGES: Record<string, string> = {
  free: 'ACCESS-LVL-00',
  pro: 'ACCESS-LVL-01',
  project: 'ACCESS-LVL-02',
  exec: 'ACCESS-LVL-03',
  private: 'SECURE-PRIVATE',
};

export const BASE_USD_MAP: Record<string, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  pro: { monthly: 29, annual: 23 },
  project: { monthly: 59, annual: 47 },
  exec: { monthly: 99, annual: 79 },
  private: { monthly: 999, annual: 799 },
};

export const HIGHLIGHTED_PLANS = new Set(['pro', 'project']);

export const PLAN_BADGES: Record<string, { icon: typeof Sparkles; label: string; color: string }> = {
  pro: { icon: Sparkles, label: 'Popular', color: 'bg-primary' },
  project: {
    icon: Building2,
    label: 'Engineering Teams',
    color: 'bg-blue-600',
  },
};

export const COMPARISON_ROWS = [
  {
    key: 'learning',
    label: 'Domain Learning Modules',
    icon: Sparkles,
    tooltip:
      'Access to 10 engineering disciplines, CEFR A1-C2 curriculum, and ASTM/Eurocode vocabulary.',
  },
  {
    key: 'ai',
    label: 'AI Voice & Writing Coach',
    icon: Building2,
    tooltip:
      'Real-time oral defense practice, FIDIC contract correction, and technical presentation feedback.',
  },
  {
    key: 'analytics',
    label: 'Analytics & Skill Metrics',
    icon: Sparkles,
    tooltip:
      'CEFR progression tracking, team performance dashboards, and error diagnostic logs.',
  },
  {
    key: 'team',
    label: 'Team Management & SSO',
    icon: Building2,
    tooltip:
      'Group seat allocation, SAML/Okta single sign-on, and central billing control.',
  },
  {
    key: 'limits',
    label: 'Usage Allowance Limits',
    icon: Sparkles,
    tooltip:
      'Monthly voice practice minutes, document upload counts, and AI token limits.',
  },
] as const;
