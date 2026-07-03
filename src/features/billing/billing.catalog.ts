export type CommercialPlanId = 'free' | 'starter' | 'core' | 'pro' | 'team';

export interface CommercialPlanPreview {
  id: CommercialPlanId;
  name: string;
  price: string;
  cadence: string;
  audience: string;
  bestFor: string;
  priceReason: string;
  benefits: string[];
  notIncluded: string;
  comparison: {
    learning: string;
    ai: string;
    analytics: string;
    team: string;
    limits: string;
  };
  ads: 'controlled-sponsor-ready' | 'none';
  status: 'available-local' | 'preview';
  actionLabel: string;
  actionHref: string;
}

export const COMMERCIAL_PLAN_CATALOG: CommercialPlanPreview[] = [
  {
    id: 'free',
    name: 'Free / Try Lite',
    price: '$0',
    cadence: 'No payment required',
    audience: 'Explore the core learning flow with controlled limits.',
    bestFor: 'Trying the learning system',
    priceReason: 'A permanent entry point before choosing a paid workflow.',
    benefits: [
      'Limited core learning access',
      'Local-first progress',
      'Basic analytics and grammar practice',
      'Controlled sponsor placements may be enabled later',
    ],
    notIncluded: 'No full AI allowance or team controls',
    comparison: {
      learning: 'Core modules, controlled access',
      ai: '3 requests/day in the current policy',
      analytics: 'Basic progress',
      team: 'Not included',
      limits: '5 module attempts and 25 vocabulary reviews/day',
    },
    ads: 'controlled-sponsor-ready',
    status: 'available-local',
    actionLabel: 'Start free',
    actionHref: '/signup',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$5',
    cadence: 'per month · planned',
    audience: 'A low-cost, ad-free entry for individual learners.',
    bestFor: 'Building a daily foundation',
    priceReason:
      'Lower price for focused Reading, Vocabulary and Grammar access.',
    benefits: [
      'Reading, Vocabulary and Grammar',
      'Limited Writing feedback',
      'Ad-free workspace',
      'Personal learning continuity',
    ],
    notIncluded: 'No advanced AI or manager reporting',
    comparison: {
      learning: 'Reading, Vocabulary and Grammar',
      ai: 'Limited Writing feedback planned',
      analytics: 'Basic progress planned',
      team: 'Not included',
      limits: 'Final paid limits pending verified launch',
    },
    ads: 'none',
    status: 'preview',
    actionLabel: 'Billing unavailable',
    actionHref: '/start',
  },
  {
    id: 'core',
    name: 'Core',
    price: '$10',
    cadence: 'per month · planned',
    audience: 'A fuller daily system for regular individual learners.',
    bestFor: 'Consistent independent study',
    priceReason:
      'Covers the complete daily learning loop without team features.',
    benefits: [
      'Fuller core skill access',
      'Daily learning recommendations',
      'Expanded Writing practice',
      'Ad-free workspace',
    ],
    notIncluded: 'No team seats or manager dashboard',
    comparison: {
      learning: 'Fuller individual learning loop',
      ai: 'Expanded allowance planned',
      analytics: 'Personal progress planned',
      team: 'Not included',
      limits: 'Final paid limits pending verified launch',
    },
    ads: 'none',
    status: 'preview',
    actionLabel: 'Billing unavailable',
    actionHref: '/start',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    cadence: 'per month',
    audience: 'For serious professional engineering communication practice.',
    bestFor: 'Career-focused engineers',
    priceReason:
      'Higher allowance for professional scenarios, tracking and AI feedback.',
    benefits: [
      'More AI feedback after backend verification',
      'Mistake Log and progress tracking',
      'Professional project scenarios',
      'Ad-free workspace',
    ],
    notIncluded: 'No organization management seats',
    comparison: {
      learning: 'All individual learning modules',
      ai: 'Higher allowance planned',
      analytics: 'Advanced analytics planned',
      team: 'Not included',
      limits: 'Final paid limits pending verified launch',
    },
    ads: 'none',
    status: 'preview',
    actionLabel: 'Billing unavailable',
    actionHref: '/start',
  },
  {
    id: 'team',
    name: 'Team',
    price: '$99',
    cadence: 'per month · planned',
    audience: 'For small engineering teams and company learning programs.',
    bestFor: 'Engineering teams and managers',
    priceReason:
      'One workspace for team seats, summaries and manager oversight.',
    benefits: [
      'Manager dashboard',
      'Team progress summaries',
      'User management readiness',
      'Ad-free team workspace',
    ],
    notIncluded: 'Custom enterprise services require a separate agreement',
    comparison: {
      learning: 'Team learning workspace',
      ai: 'Team allowance pending launch',
      analytics: 'Manager summaries planned',
      team: 'Seats and roles planned',
      limits: 'Final seat and usage limits pending agreement',
    },
    ads: 'none',
    status: 'preview',
    actionLabel: 'Explore Team',
    actionHref: '/business',
  },
];

export const SPONSOR_PLACEMENT_POLICY = {
  eligiblePlan: 'free' as const,
  configured: false,
  allowedCategories: [
    'Dictionary tools',
    'English learning resources',
    'Engineering career platforms',
    'Technical learning sites',
    'Productivity tools',
    'Professional education platforms',
  ],
  forbiddenSurfaces: [
    'Active learning tasks',
    'Primary actions',
    'Mobile bottom navigation',
    'Blocking popups',
  ],
};
