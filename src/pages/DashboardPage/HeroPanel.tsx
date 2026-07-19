import React from 'react';
import { ArrowRight, Target } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { getCefrColor } from './getCefrColor';

interface HeroPanelProps {
  userName: string;
  greeting: string;
  summary: { averageScore: number; completionPercentage: number };
  competency: { text: string; color: string };
  primaryMission?: { route?: string; title?: string; reason?: string } | null;
  focusMeta: { label: string; route: string };
  focusSkill: { cefrBand: string };
  focusLessonNumber: number;
  onStartLesson: () => void;
}

export const HeroPanel = React.memo(
  ({
    userName,
    greeting,
    summary,
    competency,
    primaryMission,
    focusMeta,
    focusSkill,
    focusLessonNumber,
    onStartLesson,
  }: HeroPanelProps) => (
    <>
      <div className="rounded-[4px] border border-border-soft bg-surface/60 p-4 shadow-sm flex items-center justify-between animate-on-scroll">
        <div className="flex items-center gap-4 w-full">
          <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-[4px] bg-[#0047bb]/10 border border-[#0047bb]/25 text-[#0047bb] font-black text-xl shadow-sm">
            {summary.averageScore}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-1.5">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Engineering Readiness Score
                </h3>
                <p className="text-[10px] font-medium text-muted-copy">
                  Based on communication, technical vocabulary, and scenario
                  performance.
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-[10px] font-bold ${competency.color} flex items-center gap-1`}
                >
                  <Target className="w-3 h-3 text-[#0047bb]" />{' '}
                  {competency.text}
                </span>
              </div>
            </div>
            <div className="h-2 rounded-[4px] bg-surface-hover overflow-hidden border border-border-soft">
              <div
                className="h-full rounded-[4px] bg-[#0047bb] transition-all duration-1000 relative"
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
              <StatusBadge label="Starting level: A1 demo path" tone="info" />
              <StatusBadge label="Demo default" tone="neutral" />
              <StatusBadge label="Skills progress separately" tone="success" />
            </div>
            <p className="text-lg font-bold text-foreground mt-4">
              Good {greeting}, {userName}!
            </p>
            <h1 className="mt-5 text-xs font-bold text-[#0047bb] uppercase tracking-wider">
              EngVox Command Center
            </h1>
            <p className="mt-2 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              Your next step is clear.
            </p>
            <p className="mt-2 max-w-xl text-xs leading-5 text-muted-copy">
              Continue one lesson at a time. Every completed task updates your
              skill level, vocabulary memory, grammar path and review plan.
            </p>
          </div>
          <Button
            type="button"
            className="min-h-10 px-5 text-xs btn-press rounded-[4px] bg-[#0047bb] text-white hover:bg-[#0047bb]/90"
            onClick={onStartLesson}
          >
            Start today&apos;s lesson <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mt-6 rounded-[4px] border border-[#0047bb]/20 bg-[#0047bb]/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[#0047bb] uppercase tracking-wider">
                TODAY&apos;S FOCUS
              </p>
              <h2 className="mt-1 text-lg font-bold text-foreground">
                {primaryMission?.title ?? `${focusMeta.label} · Lesson 1`}
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-copy">
                {primaryMission?.reason ??
                  `Build your first reliable ${focusMeta.label} baseline.`}
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span
                className={`inline-flex items-center rounded-[4px] border px-2.5 py-1 text-sm font-bold ${getCefrColor(focusSkill.cefrBand)}`}
              >
                {focusSkill.cefrBand}
              </span>
              <p className="text-[10px] font-semibold text-muted-copy mt-1">
                Lesson {focusLessonNumber}
              </p>
            </div>
          </div>
        </div>

        <div
          data-testid="dashboard-summary-metrics"
          className="mt-6 grid grid-cols-3 gap-3"
        >
          <div
            data-testid="dashboard-summary-score"
            className="min-w-0 rounded-[4px] border border-border-soft bg-surface/60 p-4 shadow-sm"
          >
            <p className="text-[9px] font-bold text-muted-copy uppercase tracking-wider">
              COMPETENCY INDEX
            </p>
            <p className="mt-1 truncate text-lg font-bold text-[#0047bb] sm:text-xl">
              {summary.averageScore}%
            </p>
          </div>
          <div
            data-testid="dashboard-summary-elo"
            className="min-w-0 rounded-[4px] border border-border-soft bg-surface/60 p-4 shadow-sm"
          >
            <p className="text-[9px] font-bold text-muted-copy uppercase tracking-wider mb-1">
              TARGET LEVEL
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
            <p className="text-[9px] font-bold text-muted-copy uppercase tracking-wider">
              COMPLETION RATE
            </p>
            <p className="mt-1 truncate text-lg font-bold text-[#0047bb] sm:text-xl">
              {summary.completionPercentage}%
            </p>
          </div>
        </div>
      </header>
    </>
  )
);
HeroPanel.displayName = 'HeroPanel';
