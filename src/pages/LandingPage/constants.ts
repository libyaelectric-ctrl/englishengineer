import {
  BarChart3,
  BookOpen,
  Brain,
  Headphones,
  Mic,
  PenLine,
  type LucideIcon,
} from 'lucide-react';

export const APP_VERSION = '4.0.1';

export const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'EngVox',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  description: 'AI-powered English training for engineers.',
  url: 'https://englishengineer.vercel.app',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export const STATS = [
  { value: '6', label: 'skill modules' },
  { value: 'A1-C2', label: 'CEFR path' },
  { value: '90+', label: 'site scenarios' },
  { value: '24/7', label: 'AI coach' },
];

export const FEATURES: Array<{
  icon: LucideIcon;
  title: string;
  desc: string;
}> = [
  {
    icon: PenLine,
    title: 'Writing desk',
    desc: 'RFIs, NCRs, submittals and email drafts reviewed for clarity, grammar and engineering tone.',
  },
  {
    icon: Mic,
    title: 'Speaking room',
    desc: 'Meeting updates, site briefings and toolbox talks with pronunciation and fluency feedback.',
  },
  {
    icon: Headphones,
    title: 'Listening lab',
    desc: 'Commissioning notes, safety talks and technical briefings tuned for real project audio.',
  },
  {
    icon: BookOpen,
    title: 'Reading vault',
    desc: 'Specifications, contracts and reports converted into vocabulary and comprehension practice.',
  },
  {
    icon: Brain,
    title: 'AI coach',
    desc: 'Personal feedback loops remember weak points and turn each attempt into a next action.',
  },
  {
    icon: BarChart3,
    title: 'Progress control',
    desc: 'Skill analytics show readiness, risk areas and what to practice before the next project moment.',
  },
];

export const WORKFLOW = [
  {
    image: '/agentic/define.png',
    kicker: '01 / Define',
    title: 'Profile the engineering context',
    desc: 'Discipline, CEFR level, project role and communication goal are translated into a focused practice path.',
  },
  {
    image: '/agentic/compose.png',
    kicker: '02 / Compose',
    title: 'Practice in realistic project scenes',
    desc: 'The interface frames writing, speaking, reading and listening tasks around actual site communication.',
  },
  {
    image: '/agentic/deploy.png',
    kicker: '03 / Improve',
    title: 'Turn feedback into the next action',
    desc: 'AI review, mistake memory and analytics keep the learner moving from attempt to measurable progress.',
  },
];
