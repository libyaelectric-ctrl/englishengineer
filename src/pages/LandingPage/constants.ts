import {
  Activity,
  Bot,
  FolderOpen,
  Headphones,
  type LucideIcon,
  Mic,
  Terminal,
} from 'lucide-react';

import type { TranslationKey } from '@/features/localization/localization.types';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://englishengineer.vercel.app';

export const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'EngVox',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  description: 'AI-powered English training for engineers.',
  url: SITE_URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export const FEATURES: Array<{
  icon: LucideIcon;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}> = [
  { icon: Terminal, titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc' },
  { icon: Mic, titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc' },
  { icon: Headphones, titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc' },
  { icon: FolderOpen, titleKey: 'landing.feature4Title', descKey: 'landing.feature4Desc' },
  { icon: Bot, titleKey: 'landing.feature5Title', descKey: 'landing.feature5Desc' },
  { icon: Activity, titleKey: 'landing.feature6Title', descKey: 'landing.feature6Desc' },
];

export const WORKFLOW = [
  {
    image: '/agentic/define.webp',
    kickerKey: 'landing.workflowStep1Kicker' as TranslationKey,
    titleKey: 'landing.workflowStep1Title' as TranslationKey,
    descKey: 'landing.workflowStep1Desc' as TranslationKey,
  },
  {
    image: '/agentic/compose.webp',
    kickerKey: 'landing.workflowStep2Kicker' as TranslationKey,
    titleKey: 'landing.workflowStep2Title' as TranslationKey,
    descKey: 'landing.workflowStep2Desc' as TranslationKey,
  },
  {
    image: '/agentic/deploy.webp',
    kickerKey: 'landing.workflowStep3Kicker' as TranslationKey,
    titleKey: 'landing.workflowStep3Title' as TranslationKey,
    descKey: 'landing.workflowStep3Desc' as TranslationKey,
  },
];

export const FAQ_ITEMS: Array<{ questionKey: TranslationKey; answerKey: TranslationKey }> = [
  { questionKey: 'landing.faq1Q', answerKey: 'landing.faq1A' },
  { questionKey: 'landing.faq2Q', answerKey: 'landing.faq2A' },
  { questionKey: 'landing.faq3Q', answerKey: 'landing.faq3A' },
  { questionKey: 'landing.faq4Q', answerKey: 'landing.faq4A' },
  { questionKey: 'landing.faq5Q', answerKey: 'landing.faq5A' },
  { questionKey: 'landing.faq6Q', answerKey: 'landing.faq6A' },
];
