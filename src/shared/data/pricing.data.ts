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
    id: 'junior',
    name: 'Junior',
    monthlyPrice: 29,
    annualPrice: 23,
    description: 'Essential learning core for daily engineering English practice.',
    audience: 'Getting started with discipline-specific vocabulary',
    bestFor: 'Individual engineers starting their journey',
    accessBadge: 'ACCESS-LVL-00',
    popular: false,
    comingSoon: false,
    features: [
      { name: 'Placement Test', included: true, tooltip: 'CEFR assessment to determine your level' },
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
    monthlyPrice: 59,
    annualPrice: 47,
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
    monthlyPrice: 79,
    annualPrice: 63,
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
    monthlyPrice: 99,
    annualPrice: 79,
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
  {
    id: 'team',
    name: 'Team',
    monthlyPrice: 999,
    annualPrice: 799,
    description: 'Enterprise solution for engineering organizations.',
    audience: 'Companies and teams with 10+ engineers',
    bestFor: 'Enterprise teams and organizations',
    accessBadge: 'ENTERPRISE',
    popular: false,
    comingSoon: true,
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
      { name: 'Tool', included: true },
      { name: 'AI Copilot', included: true },
    ],
    notIncluded: 'None — enterprise ready',
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

import { CurrencyConfig } from '@/features/billing/currency.config';