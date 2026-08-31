import { CurrencyConfig } from '@/features/billing/currency.config';

export interface PricingTierFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  originalMonthlyPrice?: number;
  originalAnnualPrice?: number;
  description: string;
  audience: string;
  bestFor: string;
  features: PricingTierFeature[];
  notIncluded: string;
  popular: boolean;
  comingSoon: boolean;
  accessBadge: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Start learning with core modules at no cost.',
    audience: 'Exploring engineering English',
    bestFor: 'Trying out the platform',
    accessBadge: 'ACCESS-LVL-FREE',
    popular: false,
    comingSoon: false,
    features: [
      { name: 'Placement Test', included: true },
      { name: 'Learning Hub', included: true },
      { name: 'Progress Tracking', included: true },
      { name: 'Vocabulary', included: true },
      { name: 'Grammar', included: true },
      { name: 'Translator', included: false },
      { name: 'Reading', included: false },
      { name: 'Writing', included: false },
      { name: 'Speaking', included: false },
      { name: 'Listening', included: false },
      { name: 'Tool', included: false },
      { name: 'AI Copilot', included: false },
    ],
    notIncluded: 'Translator, Reading, Writing, Speaking, Listening, Tool, AI Copilot',
  },
  {
    id: 'junior',
    name: 'Junior',
    monthlyPrice: 19.99,
    annualPrice: 16.66,
    originalMonthlyPrice: 29.99,
    originalAnnualPrice: 24.99,
    description: 'Essential learning core for daily engineering English practice.',
    audience: 'Getting started with discipline-specific vocabulary',
    bestFor: 'Individual engineers starting their journey',
    accessBadge: 'ACCESS-LVL-00',
    popular: false,
    comingSoon: false,
    features: [
      {
        name: 'Placement Test',
        included: true,
        tooltip: 'CEFR assessment to determine your level',
      },
      { name: 'Learning Hub', included: true, tooltip: 'Core learning modules access' },
      { name: 'Progress Tracking', included: true, tooltip: 'Daily and weekly progress metrics' },
      { name: 'Vocabulary', included: true, tooltip: 'General + Engineering word pool' },
      { name: 'Grammar', included: true, tooltip: 'Contextual grammar exercises' },
      { name: 'Translator', included: false },
      { name: 'Reading', included: false },
      { name: 'Writing', included: false },
      { name: 'Speaking', included: false },
      { name: 'Listening', included: false },
      { name: 'Tool', included: false },
      { name: 'AI Copilot', included: false },
    ],
    notIncluded: 'Translator, Reading, Writing modules',
  },
  {
    id: 'senior',
    name: 'Senior',
    monthlyPrice: 39.99,
    annualPrice: 33.33,
    originalMonthlyPrice: 59.99,
    originalAnnualPrice: 49.99,
    description: 'Expand your skills with reading, writing, and translation.',
    audience: 'Engineers who read and write technical documents',
    bestFor: 'Professional engineers improving documentation skills',
    accessBadge: 'ACCESS-LVL-01',
    popular: true,
    comingSoon: false,
    features: [
      { name: 'Placement Test', included: true },
      { name: 'Learning Hub', included: true },
      { name: 'Progress Tracking', included: true },
      { name: 'Vocabulary', included: true },
      { name: 'Grammar', included: true },
      { name: 'Translator', included: true, tooltip: 'Technical document translation' },
      { name: 'Reading', included: true, tooltip: 'Comprehension exercises' },
      { name: 'Writing', included: true, tooltip: 'Feedback & corrections' },
      { name: 'Speaking', included: false },
      { name: 'Listening', included: false },
      { name: 'Tool', included: false },
      { name: 'AI Copilot', included: false },
    ],
    notIncluded: 'Speaking, Listening, AI Copilot',
  },
  {
    id: 'specialist',
    name: 'Specialist',
    monthlyPrice: 49.99,
    annualPrice: 41.66,
    originalMonthlyPrice: 79.99,
    originalAnnualPrice: 66.66,
    description: 'Add speaking and listening to complete your communication skills.',
    audience: 'Engineers in international project meetings',
    bestFor: 'Engineers in global team environments',
    accessBadge: 'ACCESS-LVL-02',
    popular: false,
    comingSoon: false,
    features: [
      { name: 'Placement Test', included: true },
      { name: 'Learning Hub', included: true },
      { name: 'Progress Tracking', included: true },
      { name: 'Vocabulary', included: true },
      { name: 'Grammar', included: true },
      { name: 'Translator', included: true },
      { name: 'Reading', included: true },
      { name: 'Writing', included: true },
      { name: 'Speaking', included: true, tooltip: 'Practice & pronunciation' },
      { name: 'Listening', included: true, tooltip: 'Comprehension training' },
      { name: 'Tool', included: false },
      { name: 'AI Copilot', included: false },
    ],
    notIncluded: 'Tool module, AI Copilot',
  },
  {
    id: 'master',
    name: 'Master',
    monthlyPrice: 59.99,
    annualPrice: 49.99,
    originalMonthlyPrice: 99.99,
    originalAnnualPrice: 83.33,
    description: 'Full access: all modules including AI Copilot and tools.',
    audience: 'Engineers seeking complete professional mastery',
    bestFor: 'Senior engineers and technical leads',
    accessBadge: 'ACCESS-LVL-03',
    popular: false,
    comingSoon: false,
    features: [
      { name: 'Placement Test', included: true },
      { name: 'Learning Hub', included: true },
      { name: 'Progress Tracking', included: true },
      { name: 'Vocabulary', included: true },
      { name: 'Grammar', included: true },
      { name: 'Translator', included: true },
      { name: 'Reading', included: true },
      { name: 'Writing', included: true },
      { name: 'Speaking', included: true },
      { name: 'Listening', included: true },
      { name: 'Tool', included: true, tooltip: 'Engineering tools access' },
      { name: 'AI Copilot', included: true, tooltip: 'Advanced AI coaching' },
    ],
    notIncluded: 'Nothing — full access',
  },
];

export const PRICING_FEATURE_ORDER = [
  'Placement Test',
  'Learning Hub',
  'Progress Tracking',
  'Vocabulary',
  'Grammar',
  'Translator',
  'Reading',
  'Writing',
  'Speaking',
  'Listening',
  'Tool',
  'AI Copilot',
] as const;

export const formatPrice = (amount: number, currencyCode = 'USD'): string => {
  if (amount === 0) return 'Free';
  const currency = CurrencyConfig.CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol ?? '$';
  return `${symbol}${amount}`;
};

export interface CurrencyConfigItem {
  code: string;
  symbol: string;
  flag: string;
  region: string;
}

export const CURRENCIES: CurrencyConfigItem[] = [
  { code: 'USD', symbol: '$', flag: '🇺🇸', region: 'United States' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', region: 'Europe' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', region: 'United Kingdom' },
  { code: 'TRY', symbol: '₺', flag: '🇹🇷', region: 'Turkey' },
  { code: 'JPY', symbol: '¥', flag: '🇯🇵', region: 'Japan' },
  { code: 'RUB', symbol: '₽', flag: '🇷🇺', region: 'Russia' },
];

export const getAnnualSavings = (tier: PricingTier): number => {
  return Math.round(((tier.monthlyPrice - tier.annualPrice) / tier.monthlyPrice) * 100);
};

export const getRecommendedPlan = (totalItemCount: number): string => {
  if (totalItemCount >= 4500) return 'master';
  if (totalItemCount >= 4000) return 'specialist';
  if (totalItemCount >= 3000) return 'senior';
  return 'junior';
};

export const getDynamicPricingMessage = (
  tier: PricingTier,
  totalItemCount: number
): string | null => {
  if (totalItemCount >= 4500 && tier.id === 'master') {
    return 'Best value for your extensive content library';
  }
  if (totalItemCount >= 4000 && tier.id === 'specialist') {
    return 'Recommended for your content size';
  }
  return null;
};
