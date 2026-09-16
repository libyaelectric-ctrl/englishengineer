import { BookMarked, BookOpen, Headphones, Languages, MessageSquare, PenTool } from 'lucide-react';

import { RANK_THRESHOLDS } from '@/shared/constants/elo.constants';
import { getRankIcon } from '@/shared/icons/registry';

export const SKILLS = [
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    icon: BookMarked,
    color: 'from-blue-500 to-cyan-400', // palette-exempt: decorative topic accent gradient
    bgLight: 'bg-blue-50',
    textDark: 'text-blue-700',
  },
  {
    id: 'grammar',
    label: 'Grammar',
    icon: Languages,
    color: 'from-violet-500 to-fuchsia-400',
    bgLight: 'bg-violet-50',
    textDark: 'text-violet-700',
  },
  {
    id: 'reading',
    label: 'Reading',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-400',
    bgLight: 'bg-emerald-50',
    textDark: 'text-emerald-700',
  },
  {
    id: 'writing',
    label: 'Writing',
    icon: PenTool,
    color: 'from-orange-500 to-amber-400',
    bgLight: 'bg-orange-50',
    textDark: 'text-orange-700',
  },
  {
    id: 'listening',
    label: 'Listening',
    icon: Headphones,
    color: 'from-rose-500 to-pink-400',
    bgLight: 'bg-rose-50',
    textDark: 'text-rose-700',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    icon: MessageSquare,
    color: 'from-indigo-500 to-blue-400',
    bgLight: 'bg-indigo-50',
    textDark: 'text-indigo-700',
  },
];

export const CEFR_LEVELS = [
  'A1',
  'A1+',
  'A2',
  'A2+',
  'B1',
  'B1+',
  'B2',
  'B2+',
  'C1',
  'C1+',
  'C2',
  'C2+',
];

const CEFR_THRESHOLDS: [number, string][] = [
  [1333, 'A1+'],
  [1666, 'A2'],
  [2000, 'A2+'],
  [2333, 'B1'],
  [2666, 'B1+'],
  [3000, 'B2'],
  [3333, 'B2+'],
  [3666, 'C1'],
  [4000, 'C1+'],
  [4333, 'C2'],
  [4666, 'C2+'],
];

export const getCEFRBand = (elo: number) => {
  const match = CEFR_THRESHOLDS.find(([threshold]) => elo < threshold);
  return match?.[1] ?? 'C2+';
};

export const getCEFRIndex = (cefr: string) => CEFR_LEVELS.indexOf(cefr);

export const getRank = (elo: number) => {
  if (elo >= RANK_THRESHOLDS.GRANDMASTER)
    return {
      label: 'Grandmaster',
      icon: getRankIcon('grandmaster'),
      color: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30',
    };
  if (elo >= RANK_THRESHOLDS.DIAMOND)
    return {
      label: 'Diamond',
      icon: getRankIcon('diamond'),
      color: 'text-primary bg-primary/10 border-primary/30',
    };
  if (elo >= RANK_THRESHOLDS.PLATINUM)
    return {
      label: 'Platinum',
      icon: getRankIcon('platinum'),
      color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30',
    };
  if (elo >= RANK_THRESHOLDS.GOLD)
    return {
      label: 'Gold',
      icon: getRankIcon('gold'),
      color: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
    };
  return {
    label: 'Silver',
    icon: getRankIcon('silver'),
    color: 'text-muted-copy bg-surface-hover border-border-soft',
  };
};
