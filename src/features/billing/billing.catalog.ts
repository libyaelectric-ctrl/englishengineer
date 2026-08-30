export type CommercialPlanId = 'junior' | 'senior' | 'specialist' | 'master' | 'team';

export interface CommercialPlanPreview {
  id: CommercialPlanId;
  name: string;
  price: string;
  originalPrice?: string;
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
    id: 'junior',
    name: 'Junior',
    price: '$19',
    originalPrice: '$29',
    cadence: 'per month',
    audience: 'Essential learning core for daily engineering English practice.',
    bestFor: 'Getting started with discipline-specific vocabulary',
    priceReason: 'Placement test, vocabulary, grammar, and progress tracking.',
    benefits: [
      'Placement Test & CEFR assessment',
      'Learning Hub with smart repetition',
      'Vocabulary & Grammar modules',
      'Progress Tracking & analytics',
    ],
    notIncluded: 'No translator, reading, or writing modules',
    comparison: {
      learning: 'Core modules (Vocabulary, Grammar)',
      ai: '3 AI requests/day',
      analytics: 'Progress dashboard',
      team: 'Not included',
      limits: '5 attempts and 20 reviews/day',
    },
    ads: 'controlled-sponsor-ready',
    status: 'available-local',
    actionLabel: 'Start with Junior',
    actionHref: '/checkout?plan=junior',
  },
  {
    id: 'senior',
    name: 'Senior',
    price: '$39',
    originalPrice: '$59',
    cadence: 'per month',
    audience: 'Expand your skills with reading, writing, and translation.',
    bestFor: 'Engineers who read and write technical documents',
    priceReason: 'Everything in Junior plus translator, reading, and writing feedback.',
    benefits: [
      'Everything in Junior',
      'Translator module',
      'Reading comprehension',
      'Writing feedback & corrections',
      'Advanced analytics',
    ],
    notIncluded: 'No speaking or listening practice',
    comparison: {
      learning: 'Junior + Reading, Writing, Translator',
      ai: '15 AI requests/day',
      analytics: '12-month progress history',
      team: 'Not included',
      limits: '20 attempts and 50 reviews/day, 10 doc uploads/month',
    },
    ads: 'none',
    status: 'available-local',
    actionLabel: 'Upgrade to Senior',
    actionHref: '/checkout?plan=senior',
  },
  {
    id: 'specialist',
    name: 'Specialist',
    price: '$49',
    originalPrice: '$79',
    cadence: 'per month',
    audience: 'Add speaking and listening to complete your communication skills.',
    bestFor: 'Engineers in international project meetings',
    priceReason: 'Everything in Senior plus speaking, listening, and project workspaces.',
    benefits: [
      'Everything in Senior',
      'Speaking practice & pronunciation',
      'Listening comprehension',
      '3 Project Workspaces',
      'Persistent workspace memory',
    ],
    notIncluded: 'No AI Copilot or advanced tools',
    comparison: {
      learning: 'Senior + Speaking, Listening, Workspaces',
      ai: '50 AI requests/day',
      analytics: 'Project-based advanced analytics',
      team: '3 isolated project workspaces',
      limits: '50 attempts and 100 reviews/day, 50 doc uploads/month',
    },
    ads: 'none',
    status: 'available-local',
    actionLabel: 'Upgrade to Specialist',
    actionHref: '/checkout?plan=specialist',
  },
  {
    id: 'master',
    name: 'Master',
    price: '$59',
    originalPrice: '$99',
    cadence: 'per month',
    audience: 'Full access to all modules including AI Copilot and tools.',
    bestFor: 'Engineers who want complete professional mastery',
    priceReason: 'All modules unlocked: tools, AI Copilot, LinkedIn optimization.',
    benefits: [
      'Everything in Specialist',
      'AI Copilot (advanced coaching)',
      'Tool module',
      'LinkedIn optimization',
      'Custom scenario generation',
      'Unlimited AI feedback',
    ],
    notIncluded: 'Nothing — full access',
    comparison: {
      learning: 'All modules unlocked',
      ai: 'Unlimited sessions + AI Copilot',
      analytics: 'Full analytics suite',
      team: '5 workspaces',
      limits: 'Unlimited uploads and requests',
    },
    ads: 'none',
    status: 'available-local',
    actionLabel: 'Upgrade to Master',
    actionHref: '/checkout?plan=master',
  },
  {
    id: 'team',
    name: 'Team',
    price: '$999',
    cadence: 'per month',
    audience: 'Enterprise solution for engineering organizations.',
    bestFor: 'Companies and teams with 10+ engineers',
    priceReason: 'Team management, admin controls, and dedicated support.',
    benefits: [
      'Everything in Master',
      'Team management dashboard',
      'Admin controls & analytics',
      'Dedicated support',
      'Coming soon',
    ],
    notIncluded: 'None — enterprise ready',
    comparison: {
      learning: 'Ultimate team workspace',
      ai: 'Unlimited + team pool',
      analytics: 'Team compliance reporting',
      team: 'Unlimited workspaces',
      limits: 'Infinite capacity',
    },
    ads: 'none',
    status: 'preview',
    actionLabel: 'Coming Soon',
    actionHref: '#',
  },
];

export const SPONSOR_PLACEMENT_POLICY = {
  eligiblePlan: 'junior' as const,
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
