import { ArrowRight, Target, Wrench } from 'lucide-react';

import React from 'react';

import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';

import { useLocalizationStore } from '@/features/localization';

import { getCefrColor } from './getCefrColor';

interface HeroPanelProps {
  userName: string;
  summary: { averageScore: number; completionPercentage: number };
  competency: { text: string; color: string };
  primaryMission?: { route?: string; title?: string; reason?: string } | null;
  focusMeta: { label: string; route: string };
  focusSkill: { cefrBand: string };
  focusLessonNumber: number;
  onStartLesson: () => void;
  disciplineLabel: string;
  disciplineWordCount: number;
}

export const HeroPanel = React.memo(
  ({
    userName,
    summary,
    competency,
    primaryMission,
    focusMeta,
    focusSkill,
    focusLessonNumber,
    onStartLesson,
    disciplineLabel,
    disciplineWordCount,
  }: HeroPanelProps) => {
    const translate = useLocalizationStore((s) => s.translate);
    const hour = new Date().getHours();
    const greetingKey =
      hour < 12
        ? 'dashboard.goodMorning'
        : hour < 18
          ? 'dashboard.goodAfternoon'
          : 'dashboard.goodEvening';

    return (
      <>
        <div className="rounded-[4px] border border-border-soft bg-surface/60 p-4 shadow-sm flex items-center justify-between animate-on-scroll">
          <div className="flex items-center gap-4 w-full">
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-[4px] bg-primary/10 border border-primary/25 text-primary font-black text-xl shadow-sm">
              {summary.averageScore}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1.5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {translate('dashboard.readinessScore')}
                  </h3>
                  <p className="text-[10px] font-medium text-muted-copy">
                    {translate('dashboard.readinessDesc')}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold ${competency.color} flex items-center gap-1`}
                  >
                    <Target className="w-3 h-3 text-primary" /> {competency.text}
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-[4px] bg-surface-hover overflow-hidden border border-border-soft">
                <div
                  className="h-full rounded-[4px] bg-primary transition-all duration-1000 relative"
                  style={{ width: `${summary.averageScore}%` }}
                >
                  <div className="absolute inset-0 bg-surface/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <header className="premium-panel overflow-hidden p-6 sm:p-8 bg-surface-hover bg-[linear-gradient(to_right,#8080800b_1px,transparent_1px),linear-gradient(to_bottom,#8080800b_1px,transparent_1px)] bg-[size:24px_24px] border border-border-soft rounded-[4px] shadow-sm hover:shadow-md transition-all duration-300 animate-on-scroll">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <StatusBadge label={translate('dashboard.startingLevel')} tone="info" />
                <StatusBadge label={translate('dashboard.demoDefault')} tone="neutral" />
                <StatusBadge
                  label={translate('dashboard.skillsProgressSeparately')}
                  tone="success"
                />
              </div>
              <p className="text-lg font-bold text-foreground mt-4">
                {translate(greetingKey)}, {userName}!
              </p>
              <h1 className="mt-5 text-xs font-bold text-primary uppercase tracking-wider">
                {translate('dashboard.commandCenter')}
              </h1>
              <p className="mt-2 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                {translate('dashboard.nextStepClear')}
              </p>
              <p className="mt-2 max-w-xl text-xs leading-5 text-muted-copy">
                {translate('dashboard.continueLesson')}
              </p>
            </div>
            <Button
              type="button"
              className="min-h-10 px-5 text-xs btn-press rounded-[4px] bg-primary text-white hover:bg-primary/90"
              onClick={onStartLesson}
            >
              {translate('dashboard.startLesson')} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-6 rounded-[4px] border border-primary/20 bg-primary/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {translate('dashboard.todaysFocus')}
                </p>
                <h2 className="mt-1 text-lg font-bold text-foreground">
                  {primaryMission?.title ??
                    `${focusMeta.label} · ${translate('dashboard.lesson')} 1`}
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-copy">
                  {primaryMission?.reason ?? `${translate('dashboard.continueLesson')}`}
                </p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <span
                  className={`inline-flex items-center rounded-[4px] border px-2.5 py-1 text-sm font-bold ${getCefrColor(focusSkill.cefrBand)}`}
                >
                  {focusSkill.cefrBand}
                </span>
                <p className="text-[10px] font-semibold text-muted-copy mt-1">
                  {translate('dashboard.lesson')} {focusLessonNumber}
                </p>
              </div>
            </div>
          </div>

          <div data-testid="dashboard-summary-metrics" className="mt-6 grid grid-cols-3 gap-3">
            <div
              data-testid="dashboard-summary-score"
              className="min-w-0 rounded-[4px] border border-border-soft bg-surface/60 p-4 shadow-sm"
            >
              <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                {translate('dashboard.competencyIndex')}
              </p>
              <p className="mt-1 truncate text-lg font-bold text-primary sm:text-xl">
                {summary.averageScore}%
              </p>
            </div>
            <div
              data-testid="dashboard-summary-elo"
              className="min-w-0 rounded-[4px] border border-border-soft bg-surface/60 p-4 shadow-sm"
            >
              <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider mb-1">
                {translate('dashboard.targetLevel')}
              </p>
              <span
                className={`mt-1 inline-flex items-center rounded-[4px] border px-2 py-0.5 text-xs font-bold ${getCefrColor(focusSkill.cefrBand)}`}
              >
                {focusSkill.cefrBand}
              </span>
            </div>
            <div
              data-testid="dashboard-summary-done"
              className="min-w-0 rounded-[4px] border border-border-soft bg-surface/60 p-4 shadow-sm"
            >
              <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                {translate('dashboard.completionRate')}
              </p>
              <p className="mt-1 truncate text-lg font-bold text-primary sm:text-xl">
                {summary.completionPercentage}%
              </p>
            </div>
          </div>

          {/* Discipline Badge */}
          <div className="mt-4 flex items-center gap-2 rounded-[4px] border border-border-soft bg-surface/60 px-3 py-2">
            <span className="rounded-[4px] border border-border-soft bg-surface-hover p-1 text-primary">
              <Wrench className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-foreground">{disciplineLabel}</span>
            <span className="text-[10px] text-muted-copy">
              — {disciplineWordCount.toLocaleString()} {translate('dashboard.wordsCount')}
            </span>
          </div>
        </header>
      </>
    );
  }
);
HeroPanel.displayName = 'HeroPanel';
