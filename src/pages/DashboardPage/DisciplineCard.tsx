import { Lock, BookOpen, PenTool, Headphones, Mic2, BookMarked, Languages, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

import { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';

import { DISCIPLINE_META } from '@/shared/constants/engineering-disciplines';
import { VocabularyRepository } from '@/shared/services/vocabulary.repository';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization';

interface DisciplineCardProps {
  discipline: string;
  isLocked: boolean;
  isLoading?: boolean;
}

interface DisciplineCardState {
  wordCount: number;
  hasContent: boolean;
  error: boolean;
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

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-surface-hover ${className}`} />
);

const DisciplineCardSkeleton = () => (
  <div className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm space-y-4" aria-busy="true" aria-label="Loading discipline card">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-4 w-28" />
        </div>
      </div>
      <SkeletonBlock className="h-5 w-16 rounded-full" />
    </div>
    <SkeletonBlock className="h-12 w-full rounded-lg" />
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBlock key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

const DisciplineCardError = ({ onRetry }: { onRetry: () => void }) => {
  const translate = useLocalizationStore((s) => s.translate);
  return (
    <div className="rounded-xl border border-error/20 bg-error/5 p-5 shadow-sm" role="alert">
      <div className="flex items-center gap-3 text-error">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold">{translate('dashboard.disciplineError') ?? 'Unable to load discipline'}</p>
          <p className="text-[10px] text-error/70 mt-0.5">{translate('dashboard.disciplineErrorDesc') ?? 'Please try again'}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1 rounded-lg border border-error/30 bg-surface px-3 py-1.5 text-[10px] font-bold text-error hover:bg-error/10 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          {translate('dashboard.retry') ?? 'Retry'}
        </button>
      </div>
    </div>
  );
};

const DisciplineCardEmpty = ({ disciplineLabel }: { disciplineLabel: string }) => {
  const translate = useLocalizationStore((s) => s.translate);
  return (
    <div className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
          <BookOpen className="h-5 w-5 text-muted-copy" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
            {translate('dashboard.myDiscipline') ?? 'My Discipline'}
          </p>
          <p className="text-sm font-bold text-foreground">{disciplineLabel}</p>
        </div>
      </div>
      <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-4 text-center">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
          {translate('dashboard.noContentYet') ?? 'No content yet for this discipline'}
        </p>
        <Link
          to="/vocabulary"
          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white transition-colors"
        >
          {translate('dashboard.goToGeneral') ?? 'Go to General Words'}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export const DisciplineCard = ({ discipline, isLocked, isLoading = false }: DisciplineCardProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  const meta = DISCIPLINE_META[discipline as keyof typeof DISCIPLINE_META];
  const [state, setState] = useState<DisciplineCardState>({ wordCount: 0, hasContent: true, error: false });

  const loadDisciplineData = async () => {
    try {
      setState((s) => ({ ...s, error: false }));
      const terms = await VocabularyRepository.getVocabularyByDomain(discipline);
      setState({
        wordCount: terms.length,
        hasContent: terms.length > 0,
        error: false,
      });
    } catch {
      setState((s) => ({ ...s, error: true }));
    }
  };

  useEffect(() => {
    if (!isLoading && discipline) {
      loadDisciplineData();
    }
  }, [discipline, isLoading]);

  if (isLoading) return <DisciplineCardSkeleton />;
  if (state.error) return <DisciplineCardError onRetry={loadDisciplineData} />;
  if (!state.hasContent && discipline !== 'general') {
    return <DisciplineCardEmpty disciplineLabel={meta?.labelKey ? translate(meta.labelKey as TranslationKey) : discipline} />;
  }

  const totalWords = (meta?.wordCount ?? 0) + 3400;
  const progressPercent = state.wordCount > 0 ? Math.min(100, Math.round((state.wordCount / totalWords) * 100)) : 0;

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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
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
          <span className="text-[10px] text-muted-copy font-medium">
            {totalWords.toLocaleString()} {translate('dashboard.words') ?? 'words'}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden border border-border-soft">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[9px] text-muted-copy">
          {progressPercent}% {translate('dashboard.loaded') ?? 'loaded'} ({state.wordCount.toLocaleString()} {translate('dashboard.terms') ?? 'terms'})
        </p>
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