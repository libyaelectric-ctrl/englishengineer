import { Building2, Sparkles } from 'lucide-react';

import { COMMERCIAL_PLAN_CATALOG } from '@/features/billing';

export const ACTIVE_PLANS = COMMERCIAL_PLAN_CATALOG.filter((plan) =>
  ['junior', 'senior', 'specialist', 'master', 'team'].includes(plan.id)
);

export const ACCESS_BADGES: Record<string, string> = {
  junior: 'ACCESS-LVL-00',
  senior: 'ACCESS-LVL-01',
  specialist: 'ACCESS-LVL-02',
  master: 'ACCESS-LVL-03',
  team: 'ENTERPRISE',
};

export const BASE_USD_MAP: Record<string, { monthly: number; annual: number }> = {
  junior: { monthly: 29, annual: 23 },
  senior: { monthly: 59, annual: 47 },
  specialist: { monthly: 79, annual: 63 },
  master: { monthly: 99, annual: 79 },
  team: { monthly: 999, annual: 799 },
};

export const HIGHLIGHTED_PLANS = new Set(['senior']);

export const PLAN_BADGES: Record<string, { icon: typeof Sparkles; label: string; color: string }> =
  {
    senior: { icon: Sparkles, label: 'Most Popular', color: 'bg-primary' },
    team: {
      icon: Building2,
      label: 'Coming Soon',
      color: 'bg-slate-500',
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
    tooltip: 'CEFR progression tracking, team performance dashboards, and error diagnostic logs.',
  },
  {
    key: 'team',
    label: 'Team Management & SSO',
    icon: Building2,
    tooltip: 'Group seat allocation, SAML/Okta single sign-on, and central billing control.',
  },
  {
    key: 'limits',
    label: 'Usage Allowance Limits',
    icon: Sparkles,
    tooltip: 'Monthly voice practice minutes, document upload counts, and AI token limits.',
  },
] as const;