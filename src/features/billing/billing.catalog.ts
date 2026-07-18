export type CommercialPlanId = 'free' | 'pro' | 'project' | 'exec' | 'private';

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
      'Controlled sponsor placements',
    ],
    notIncluded: 'No full AI allowance or team controls',
    comparison: {
      learning: 'Core modules, controlled access',
      ai: '1 request/day',
      analytics: 'Basic progress',
      team: 'Not included',
      limits: '1 attempt and 5 reviews/day',
    },
    ads: 'controlled-sponsor-ready',
    status: 'available-local',
    actionLabel: 'Start free',
    actionHref: '/signup',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    cadence: 'per month',
    audience: 'For serious professional engineering communication practice.',
    bestFor: 'Career-focused engineers',
    priceReason:
      'Higher allowance for professional scenarios, tracking and AI feedback.',
    benefits: [
      'Unlimited AI feedback and corrections',
      'Mistake Log and progress tracking',
      'Professional project scenarios',
      'Ad-free workspace',
    ],
    notIncluded: 'No project workspaces or persistent memory',
    comparison: {
      learning: 'All individual learning modules',
      ai: '10 requests/day',
      analytics: '12-month progress history',
      team: 'Not included',
      limits: '10 attempts and 10 reviews/day, 2 doc uploads/month',
    },
    ads: 'none',
    status: 'available-local',
    actionLabel: 'Upgrade to Pro',
    actionHref: '/checkout?plan=pro',
  },
  {
    id: 'project',
    name: 'Project',
    price: '$59',
    cadence: 'per month',
    audience: 'For engineers managing complex technical project scopes.',
    bestFor: 'Project leaders & designers',
    priceReason:
      'Unlocks project workspaces, persistent memory and custom scenarios.',
    benefits: [
      '3 isolated Project Workspaces',
      'Persistent Workspace Memory (inject context into every AI session)',
      '20 document uploads per month, scoped per workspace',
      'Unlimited AI Coach sessions',
      'Custom scenario generation',
      'LinkedIn optimization tools',
    ],
    notIncluded: 'No voice integration modules',
    comparison: {
      learning: 'All individual learning modules',
      ai: 'Unlimited sessions + workspace memory context',
      analytics: 'Project-based advanced analytics',
      team: '3 isolated project workspaces',
      limits: '20 document uploads/month',
    },
    ads: 'none',
    status: 'available-local',
    actionLabel: 'Upgrade to Project',
    actionHref: '/checkout?plan=project',
  },
  {
    id: 'exec',
    name: 'Exec',
    price: '$99',
    cadence: 'per month',
    audience:
      'For executives, business development leads and engineering directors.',
    bestFor: 'Directors & executive leads',
    priceReason:
      'Includes voice meetings, speech simulation and VIP priority coaching.',
    benefits: [
      'Real Voice Speaking & Pronunciation Analysis',
      'Voice Meeting Simulator & Minute Wallet',
      'Dedicated executive coaching sessions',
      'VIP priority queue slots',
      'All Project tier features included',
    ],
    notIncluded: 'No private dedicated AI proxy server',
    comparison: {
      learning: 'Executive training, voice and meetings',
      ai: 'VIP prioritized + Speech AI evaluations',
      analytics: 'Voice metrics and executive dashboard',
      team: '3 workspaces',
      limits: 'Unlimited uploads, 300 voice minutes/month',
    },
    ads: 'none',
    status: 'available-local',
    actionLabel: 'Upgrade to Exec',
    actionHref: '/checkout?plan=exec',
  },
  {
    id: 'private',
    name: 'Private',
    price: '$999',
    cadence: 'per month',
    audience:
      'For ultra-secure private engineering firms and state-level projects.',
    bestFor: 'Defense, space & government contractors',
    priceReason:
      'Runs on a dedicated private AI proxy server with complete zero-data retention.',
    benefits: [
      'Dedicated private proxy server deployment',
      'Zero-data retention guarantee on AI requests',
      'Custom security audits & controls',
      'All Exec tier features included',
    ],
    notIncluded: 'None',
    comparison: {
      learning: 'Ultimate private learning workspace',
      ai: 'Dedicated server instances',
      analytics: 'Custom private compliance reporting',
      team: 'Unlimited workspaces',
      limits: 'Infinite capacity',
    },
    ads: 'none',
    status: 'available-local',
    actionLabel: 'Upgrade to Private',
    actionHref: '/checkout?plan=private',
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
