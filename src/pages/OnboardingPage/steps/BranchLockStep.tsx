import {
  AlertTriangle,
  Bot,
  Building2,
  Code2,
  Cpu,
  Factory,
  FlaskConical,
  HardHat,
  Lock,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react';

import { useState } from 'react';

import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization';

import { ContentPreview } from './ContentPreview';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  FlaskConical,
  HardHat,
  Zap,
  Cpu,
  ShieldCheck,
  Factory,
  Wrench,
  Bot,
  Code2,
};

type BranchLockStepProps = {
  discipline: EngineeringDiscipline;
  setDiscipline: (d: EngineeringDiscipline) => void;
  branchLockConfirmations: number;
  setBranchLockConfirmations: (n: number) => void;
};

export const BranchLockStep = ({
  discipline,
  setDiscipline,
  branchLockConfirmations,
  setBranchLockConfirmations,
}: BranchLockStepProps) => {
  const { translate } = useLocalizationStore();
  const [phase, setPhase] = useState<'select' | 'confirm-1' | 'confirm-2' | 'locked'>(
    branchLockConfirmations >= 2 ? 'locked' : 'select'
  );

  const selectedMeta = DISCIPLINE_META[discipline];

  const handleConfirm = () => {
    const next = branchLockConfirmations + 1;
    setBranchLockConfirmations(next);
    if (next === 1) setPhase('confirm-1');
    else if (next >= 2) setPhase('locked');
  };

  const handleBack = () => {
    if (phase === 'confirm-1') {
      setPhase('select');
      setBranchLockConfirmations(0);
    }
  };

  if (phase === 'locked') {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
              {translate('onboarding.branchLocked') ?? 'Discipline Locked'}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              {selectedMeta?.labelKey
                ? translate(selectedMeta.labelKey as TranslationKey)
                : discipline}
              {' — '}
              {translate('onboarding.branchLockedDesc') ??
                'You can change this later only via support.'}
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white">
            {translate('onboarding.yourWordPool') ?? 'Your Word Pool'}
          </h3>
          <p className="mt-2 text-xs text-slate-500">
            {translate('onboarding.wordPoolFormula') ?? 'Your vocabulary will always be:'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-[var(--radius-card)] bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300">
              General
            </span>
            <span className="rounded-[var(--radius-card)] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
              Engineering
            </span>
            <span className="rounded-[var(--radius-card)] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {selectedMeta?.labelKey
                ? translate(selectedMeta.labelKey as TranslationKey)
                : discipline}
            </span>
          </div>
        </div>

        <ContentPreview discipline={discipline} />
      </section>
    );
  }

  if (phase === 'confirm-1') {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
              {translate('onboarding.lockWarning1') ?? 'This choice is permanent'}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {translate('onboarding.lockWarning1Desc') ??
                'You will not be able to change your discipline later. Your vocabulary pool will be built around this discipline.'}
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {translate('onboarding.selectedDiscipline') ?? 'Selected discipline:'}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {selectedMeta?.labelKey
              ? translate(selectedMeta.labelKey as TranslationKey)
              : discipline}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-[var(--radius-card)] border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-surface"
          >
            {translate('onboarding.back') ?? 'Back'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-[var(--radius-card)] bg-amber-600 hover:bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm"
          >
            {translate('onboarding.confirmLock') ?? 'I understand, lock it'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-medium">{translate('onboarding.selectDiscipline')}</h2>
      <p className="mt-2 text-sm text-muted-copy">{translate('onboarding.roleContext')}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {ENGINEERING_DISCIPLINES.map((id) => {
          const meta = DISCIPLINE_META[id];
          const IconComponent = ICON_MAP[meta.icon];
          const isSelected = discipline === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setDiscipline(id)}
              className={`flex items-start gap-3 rounded-[var(--radius-card)] border p-4 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border-soft bg-surface hover:border-border-hover hover:bg-surface-hover'
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-card)] ${
                  isSelected ? 'bg-primary/10 text-primary' : 'bg-surface-hover text-muted-copy'
                }`}
              >
                {IconComponent && <IconComponent className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}
                >
                  {translate(meta.labelKey as TranslationKey)}
                </p>
                <p className="mt-0.5 text-xs text-muted-copy">
                  {translate(meta.descriptionKey as TranslationKey)}
                </p>
                <p className="mt-1 text-[10px] font-medium text-muted-copy/70">
                  {meta.wordCount.toLocaleString()} terms
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
