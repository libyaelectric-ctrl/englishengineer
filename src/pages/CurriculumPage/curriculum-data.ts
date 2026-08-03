import { BookOpen, Database, Headphones, Languages, Mic2, PenTool } from 'lucide-react';

import type { SkillName } from '@/features/profile';

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

export const SKILL_META: Record<SkillName, { label: string; route: string | null; icon: string }> =
  {
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
