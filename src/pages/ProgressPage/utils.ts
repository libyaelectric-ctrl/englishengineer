import { useState, useEffect } from 'react';
import {
  BookMarked,
  Languages,
  BookOpen,
  PenTool,
  Headphones,
  MessageSquare,
} from 'lucide-react';

export const SKILLS = [
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    icon: BookMarked,
    color: 'from-blue-500 to-cyan-400',
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
export const MIN_ELO = 1000;
export const MAX_ELO = 5000;

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
  if (elo >= 4500)
    return {
      label: 'Grandmaster',
      icon: '👑',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    };
  if (elo >= 3500)
    return {
      label: 'Diamond',
      icon: '💎',
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    };
  if (elo >= 2500)
    return {
      label: 'Platinum',
      icon: '🏆',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    };
  if (elo >= 1500)
    return {
      label: 'Gold',
      icon: '🥇',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    };
  return {
    label: 'Silver',
    icon: '🥈',
    color: 'text-slate-600 bg-slate-50 border-slate-200',
  };
};

export const useAnimatedNumber = (value: number, duration: number = 1.5) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let startTime: number;
    const startValue = displayValue;
    const distance = value - startValue;
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = (currentTime - startTime) / (duration * 1000);
      const progress = Math.min(timeElapsed, 1);
      setDisplayValue(
        Math.floor(startValue + distance * easeOutQuart(progress))
      );
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayValue(value);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return displayValue;
};
