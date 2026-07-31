import {
  Activity,
  Bot,
  FolderOpen,
  Headphones,
  type LucideIcon,
  Mic,
  Terminal,
} from 'lucide-react';

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
    icon: Terminal,
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
    icon: FolderOpen,
    title: 'Reading vault',
    desc: 'Specifications, contracts and reports converted into vocabulary and comprehension practice.',
  },
  {
    icon: Bot,
    title: 'AI coach',
    desc: 'Personal feedback loops remember weak points and turn each attempt into a next action.',
  },
  {
    icon: Activity,
    title: 'Progress control',
    desc: 'Skill analytics show readiness, risk areas and what to practice before the next project moment.',
  },
];

export const WORKFLOW = [
  {
    image: '/agentic/define.webp',
    kicker: '01 / Define',
    title: 'Profile the engineering context',
    desc: 'Discipline, CEFR level, project role and communication goal are translated into a focused practice path.',
  },
  {
    image: '/agentic/compose.webp',
    kicker: '02 / Compose',
    title: 'Practice in realistic project scenes',
    desc: 'The interface frames writing, speaking, reading and listening tasks around actual site communication.',
  },
  {
    image: '/agentic/deploy.webp',
    kicker: '03 / Improve',
    title: 'Turn feedback into the next action',
    desc: 'AI review, mistake memory and analytics keep the learner moving from attempt to measurable progress.',
  },
];

export const FAQ_ITEMS = [
  {
    question: 'Is there a free plan available?',
    answer:
      'Yes. The free plan includes core learning modules, vocabulary & grammar drills, and daily AI request allowances with no credit card required.',
  },
  {
    question: 'Who is EngVox specifically built for?',
    answer:
      'EngVox is engineered for all 10 key disciplines: Architecture, Chemical, Civil, Computer/Software, Electrical, Electronics, HSE, Industrial, Mechanical, and Mechatronics/Robotics engineers, site managers, and technical project leads communicating internationally.',
  },
  {
    question: 'How do Project Workspaces & Persistent Memory work?',
    answer:
      'Project plans allow you to create isolated workspaces where AI retains your project specs, FIDIC contract terms, and technical drawings across all coaching sessions.',
  },
  {
    question: 'Is EngVox suitable for preparing for technical interviews or presentations?',
    answer:
      'Absolutely. Our AI Coach simulates oral defense panels, client design reviews, site safety briefings, and PR reviews with instant CEFR fluency feedback.',
  },
  {
    question: 'Does EngVox support offline-first usage?',
    answer:
      'Yes. Core technical vocabulary, FIDIC contract glossaries, and practice scenarios work completely offline, synchronizing automatically when online.',
  },
  {
    question: 'Can I upgrade, downgrade, or cancel my subscription at any time?',
    answer:
      'Yes. You can change plans or cancel anytime from your billing portal with zero hidden cancellation fees or long-term contracts.',
  },
];
