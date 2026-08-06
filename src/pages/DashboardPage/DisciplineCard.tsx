import { Lock, BookOpen, PenTool, Headphones, Mic2, BookMarked, Languages, ArrowRight } from 'lucide-react';

import { Link } from 'react-router-dom';

import { DISCIPLINE_META } from '@/shared/constants/engineering-disciplines';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization';

interface DisciplineCardProps {
  discipline: string;
  isLocked: boolean;
}

const MODULE_BUTTONS: Array<{
  key: string;
  labelKey: TranslationKey;
  icon: typeof BookOpen;
  route: string;
  color: string;
}> = [
  { key: 'vocabulary', labelKey: 'nav.vocabulary', icon: BookMarked, route: '/vocabulary', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
  { key: 'grammar', labelKey: 'nav.grammar', icon: Languages, route: '/grammar', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
  { key: 'reading', labelKey: 'nav.reading', icon: BookOpen, route: '/reading', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
  { key: 'writing', labelKey: 'nav.writing', icon: PenTool, route: '/writing', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
  { key: 'listening', labelKey: 'nav.listening', icon: Headphones, route: '/listening', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20' },
  { key: 'speaking', labelKey: 'nav.speaking', icon: Mic2, route: '/speaking', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' },
];

const DISCIPLINE_EMOJI: Record<string, string> = {
  architecture: '🏛️',
  chemical: '⚗️',
  civil: '🏗️',
  electrical: '⚡',
  electronics: '🔌',
  hse: '🦺',
  industrial: '🏭',
  mechanical: '⚙️',
  mechatronics: '🤖',
  software: '💻',
};

export const DisciplineCard = ({ discipline, isLocked }: DisciplineCardProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  const meta = DISCIPLINE_META[discipline as keyof typeof DISCIPLINE_META];

  return (
    <div className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <span className="text-xl">{DISCIPLINE_EMOJI[discipline] ?? '🔧'}</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
              {translate('dashboard.myDiscipline') ?? 'My Discipline'}
            </p>
            <p className="text-sm font-bold text-foreground">
              {meta?.labelKey ? translate(meta.labelKey as TranslationKey) : discipline}
            </p>
          </div>
        </div>
        {isLocked && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-600 dark:text-emerald-400">
            <Lock className="h-3 w-3" />
            <span className="text-[10px] font-bold">{translate('dashboard.locked') ?? 'Locked'}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-border-soft">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
            General
          </span>
          <span className="rounded-md bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
            Engineering
          </span>
          <span className="rounded-md bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            {meta?.labelKey ? translate(meta.labelKey as TranslationKey) : discipline}
          </span>
        </div>
        <span className="ml-auto text-[10px] text-muted-copy font-medium">
          {((meta?.wordCount ?? 0) + 3400).toLocaleString()} {translate('dashboard.words') ?? 'words'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MODULE_BUTTONS.map((mod) => (
          <Link
            key={mod.key}
            to={mod.route}
            className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all hover:shadow-sm hover:scale-[1.02] ${mod.color}`}
          >
            <mod.icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold text-center leading-tight">
              {translate(mod.labelKey)}
            </span>
            <ArrowRight className="h-3 w-3 opacity-50" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DisciplineCard;