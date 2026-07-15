import type { SkillName } from '@/features/profile';
import {
  BookOpen,
  Database,
  Headphones,
  Languages,
  Mic2,
  PenTool,
} from 'lucide-react';

export const ICON_MAP: Record<string, typeof BookOpen> = {
  BookOpen,
  PenTool,
  Headphones,
  Mic2,
  Languages,
  Database,
};

export interface GraphNode {
  id: string;
  label: string;
  type: 'hub' | 'skill' | 'topic' | 'grammar';
  x: number;
  y: number;
  color: string;
  size: number;
  description: string;
  status: string;
  strength: number;
  connections: string[];
  linkUrl?: string;
  relatedVocab?: string[];
  relatedGrammar?: string[];
}

export const SKILL_META: Record<
  SkillName,
  { label: string; route: string | null; icon: string }
> = {
  reading: { label: 'Reading', route: '/reading', icon: 'BookOpen' },
  writing: { label: 'Writing', route: '/writing', icon: 'PenTool' },
  listening: { label: 'Listening', route: '/listening', icon: 'Headphones' },
  speaking: { label: 'Speaking', route: '/speaking', icon: 'Mic2' },
  vocabulary: { label: 'Vocabulary', route: '/vocabulary', icon: 'Languages' },
  grammar: { label: 'Grammar', route: '/grammar', icon: 'Database' },
};

export const DOMAINS = [
  'All',
  'general-english',
  'professional-communication',
  'construction-site',
  'electrical',
  'mechanical',
  'architecture',
  'qa-qc',
  'hse',
];

export const GRAPH_NODES: GraphNode[] = [
  {
    id: 'hub',
    label: 'B2 CEFR Hub',
    type: 'hub',
    x: 400,
    y: 250,
    color: '#6366f1',
    size: 24,
    description:
      'The core alignment hub for B2 level engineering communications, connecting vocabulary domain filters to targeted skill tasks.',
    status: 'Active Target',
    strength: 78,
    connections: [
      'reading',
      'writing',
      'listening',
      'speaking',
      'vocabulary',
      'grammar',
    ],
  },
  {
    id: 'reading',
    label: 'Reading Practice',
    type: 'skill',
    x: 280,
    y: 170,
    color: '#10b981',
    size: 16,
    description:
      'Technical manuals, site constraints, sequence reports, and witness logs.',
    status: 'Proficient',
    strength: 84,
    connections: ['hub', 'topic-coordination', 'topic-hse'],
    linkUrl: '/reading',
  },
  {
    id: 'writing',
    label: 'Writing Practice',
    type: 'skill',
    x: 280,
    y: 330,
    color: '#10b981',
    size: 16,
    description:
      'QA/QC inspector comments, recovery action plans, and professional email correspondence.',
    status: 'Needs Practice',
    strength: 54,
    connections: [
      'hub',
      'topic-inspection',
      'topic-tech-write',
      'grammar-passive',
    ],
    linkUrl: '/writing',
  },
  {
    id: 'listening',
    label: 'Listening Practice',
    type: 'skill',
    x: 520,
    y: 170,
    color: '#10b981',
    size: 16,
    description:
      'Comprehending toolboxes, inspection feedback, site constraint updates, and witness reviews.',
    status: 'Proficient',
    strength: 73,
    connections: ['hub', 'topic-hse'],
    linkUrl: '/listening',
  },
  {
    id: 'speaking',
    label: 'Speaking Practice',
    type: 'skill',
    x: 520,
    y: 330,
    color: '#10b981',
    size: 16,
    description:
      'Site meeting participation, risk warning communication, and witness coordination.',
    status: 'Needs Practice',
    strength: 62,
    connections: ['hub', 'topic-coordination', 'grammar-conditionals'],
    linkUrl: '/speaking',
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary Memory',
    type: 'skill',
    x: 400,
    y: 100,
    color: '#f59e0b',
    size: 16,
    description:
      'Site vocabulary engine, containing MEP, electrical, civil, and safety terminology.',
    status: 'On track',
    strength: 81,
    connections: ['hub', 'topic-inspection'],
    linkUrl: '/vocabulary',
  },
  {
    id: 'grammar',
    label: 'Grammar Foundations',
    type: 'skill',
    x: 400,
    y: 400,
    color: '#ec4899',
    size: 16,
    description:
      'Active/Passive reporting style, relative clauses, and site condition hypotheticals.',
    status: 'On track',
    strength: 70,
    connections: ['hub', 'grammar-passive', 'grammar-conditionals'],
    linkUrl: '/grammar',
  },
  {
    id: 'topic-coordination',
    label: 'Site Coordination',
    type: 'topic',
    x: 140,
    y: 120,
    color: '#3b82f6',
    size: 12,
    description:
      'Clarifying sequence, ownership, and constraint during coordination meetings.',
    status: 'Unlocked',
    strength: 75,
    connections: ['reading', 'speaking'],
    relatedVocab: [
      'constraint',
      'alignment',
      'sequence',
      'milestone',
      'handover',
    ],
    relatedGrammar: ['Passive reports', 'Future possibility'],
  },
  {
    id: 'topic-inspection',
    label: 'QA/QC Inspection',
    type: 'topic',
    x: 140,
    y: 380,
    color: '#3b82f6',
    size: 12,
    description:
      'Standardizing comment format, non-conformance reports, and corrective actions.',
    status: 'Unlocked',
    strength: 68,
    connections: ['writing', 'vocabulary'],
    relatedVocab: [
      'deviation',
      'non-conformance',
      'remediation',
      'tolerance',
      'insulation',
    ],
    relatedGrammar: ['Passive voice (reports)', 'Present perfect for state'],
  },
  {
    id: 'topic-hse',
    label: 'HSE & Safety Rules',
    type: 'topic',
    x: 660,
    y: 120,
    color: '#3b82f6',
    size: 12,
    description:
      'Communicating hazards, emergency guidelines, and warning actions.',
    status: 'Unlocked',
    strength: 88,
    connections: ['listening', 'reading'],
    relatedVocab: ['hazard', 'PPE', 'clearance', 'evacuation', 'compliance'],
    relatedGrammar: ['Imperative statements', 'First conditional constraints'],
  },
  {
    id: 'topic-tech-write',
    label: 'Technical Writing',
    type: 'topic',
    x: 660,
    y: 380,
    color: '#3b82f6',
    size: 12,
    description:
      'Writing specifications, summaries of delays, and request details clearly.',
    status: 'Unlocked',
    strength: 63,
    connections: ['writing', 'grammar'],
    relatedVocab: [
      'specification',
      'scope',
      'variance',
      'contingency',
      'revision',
    ],
    relatedGrammar: ['Relative clauses', 'Gerunds as subjects'],
  },
  {
    id: 'grammar-passive',
    label: 'Passive Voice',
    type: 'grammar',
    x: 240,
    y: 450,
    color: '#a855f7',
    size: 10,
    description:
      'Standardizing reports (e.g., "The cables were pulled...") to sound objective.',
    status: 'Proficient',
    strength: 78,
    connections: ['grammar', 'writing'],
    relatedVocab: [
      'installed',
      'tested',
      'witnessed',
      'rejected',
      'commissioned',
    ],
  },
  {
    id: 'grammar-conditionals',
    label: 'Conditionals',
    type: 'grammar',
    x: 560,
    y: 450,
    color: '#a855f7',
    size: 10,
    description:
      'Discussing safety hazards and recovery (e.g., "If the main breaker trips, the backup system starts").',
    status: 'Needs review',
    strength: 58,
    connections: ['grammar', 'speaking'],
    relatedVocab: ['trip', 'fail-safe', 'contingency', 'backup', 'bypass'],
  },
];

export const GRAPH_LINKS = [
  { source: 'hub', target: 'reading' },
  { source: 'hub', target: 'writing' },
  { source: 'hub', target: 'listening' },
  { source: 'hub', target: 'speaking' },
  { source: 'hub', target: 'vocabulary' },
  { source: 'hub', target: 'grammar' },
  { source: 'topic-coordination', target: 'reading' },
  { source: 'topic-coordination', target: 'speaking' },
  { source: 'topic-inspection', target: 'writing' },
  { source: 'topic-inspection', target: 'vocabulary' },
  { source: 'topic-hse', target: 'listening' },
  { source: 'topic-hse', target: 'reading' },
  { source: 'topic-tech-write', target: 'writing' },
  { source: 'topic-tech-write', target: 'grammar' },
  { source: 'grammar-passive', target: 'grammar' },
  { source: 'grammar-passive', target: 'writing' },
  { source: 'grammar-conditionals', target: 'grammar' },
  { source: 'grammar-conditionals', target: 'speaking' },
];
