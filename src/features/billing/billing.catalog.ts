export type CommercialPlanId =
  | 'free'
  | 'pro'
  | 'project'
  | 'max'
  | 'exec'
  | 'private';

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
      ai: '3 requests/day',
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
    id: 'pro',
    name: 'Pro',
    price: '$19',
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
      ai: 'Unlimited coach sessions',
      analytics: '12-month progress history',
      team: 'Not included',
      limits: 'Unlimited daily attempts and reviews, 2 doc uploads/month',
    },
    ads: 'none',
    status: 'available-local',
    actionLabel: 'Upgrade to Pro',
    actionHref: '/checkout?plan=pro',
  },
  {
    id: 'project',
    name: 'Project',
    price: '$39',
    cadence: 'per month',
    audience: 'For engineers managing complex technical project scopes.',
    bestFor: 'Project leaders & designers',
    priceReason:
      'Unlocks project workspaces, persistent memory and custom scenarios.',
    benefits: [
      '3 Project Workspaces',
      'Persistent Project Memory with tenant isolation',
      'Custom scenario generation from project docs',
      'LinkedIn profile optimization tools',
      'Persistent AI agent assistance',
    ],
    notIncluded: 'No voice integration modules',
    comparison: {
      learning: 'All individual learning modules',
      ai: 'Persistent agent + custom scenario generator',
      analytics: 'Project-based advanced analytics',
      team: '3 project workspaces',
      limits: '20 document uploads/month',
    },
    ads: 'none',
    status: 'available-local',
    actionLabel: 'Upgrade to Project',
    actionHref: '/checkout?plan=project',
  },
  {
    id: 'max',
    name: 'Max',
    price: '$59',
    cadence: 'per month',
    audience:
      'For engineers needing voice meetings, speech simulation, and unlimited workspaces.',
    bestFor: 'International meeting presenters & leads',
    priceReason:
      'Unlocks real voice speaking, pronunciation analysis, voice simulator, and unlimited uploads.',
    benefits: [
      'Unlimited Project Workspaces & uploads',
      'Real Voice Speaking (mobile mic supported)',
      'Speech Pronunciation Analysis',
      'Voice Meeting Simulator',
      'Voice minute wallet integration',
    ],
    notIncluded: 'No dedicated executive mentoring',
    comparison: {
      learning: 'All voice and listening modules',
      ai: 'Speech and audio AI evaluations + custom helper',
      analytics: 'Voice metrics and flow analytics',
      team: 'Unlimited workspaces',
      limits: 'Unlimited uploads, custom voice minutes',
    },
    ads: 'none',
    status: 'available-local',
    actionLabel: 'Upgrade to Max',
    actionHref: '/checkout?plan=max',
  },
  {
    id: 'exec',
    name: 'Exec',
    price: '$99',
    cadence: 'per month',
    audience:
      'For executives, business development leads and engineering directors.',
    bestFor: 'Directors & executive leads',
    priceReason: 'Includes dedicated executive mentoring and VIP priorities.',
    benefits: [
      'Dedicated executive coaching sessions',
      'VIP priority queue slots',
      'Offline audio downloads',
      'All Max tier features included',
    ],
    notIncluded: 'No private dedicated AI proxy server',
    comparison: {
      learning: 'Executive training and meetings',
      ai: 'VIP prioritized response times',
      analytics: 'Executive dashboard reports',
      team: 'Unlimited workspaces',
      limits: 'Unlimited uploads, unlimited voice minutes',
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
