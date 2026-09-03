/**
 * HighSpeedRailwayPath – Option 1
 * Serpentine high-speed rail: A1→C2, zigzag rows, connected stops,
 * locomotive on active node, discipline icons as stop "brand" only.
 */
import {
  Bot,
  Building2,
  CheckCircle2,
  Code2,
  Cpu,
  Factory,
  FlaskConical,
  HardHat,
  Lock,
  ShieldCheck,
  Train,
  Wrench,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';

import React, { useMemo, useState } from 'react';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { useDirection } from '@/shared/hooks/useDirection';
import type { CefrLevel } from '@/shared/types/domain.types';

import { useLocalizationStore } from '@/features/localization';

import { getDisciplinePalette } from '../discipline-palette';
import type { LearningPath, PathLevel, PathStage } from '../learning-path.types';

export interface HighSpeedRailwayPathProps {
  path: LearningPath;
  onSelectLevel: (levelId: string) => void;
}

// ── Cycling discipline motifs (icon + accent color only) ─────────────────────
const MOTIFS: {
  discipline: EngineeringDiscipline;
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  { discipline: 'civil', icon: HardHat, color: '#EA580C', bg: '#EA580C22' },
  { discipline: 'mechanical', icon: Wrench, color: '#2563EB', bg: '#2563EB22' },
  { discipline: 'electrical', icon: Zap, color: '#CA8A04', bg: '#CA8A0422' },
  { discipline: 'software', icon: Code2, color: '#16A34A', bg: '#16A34A22' },
  { discipline: 'industrial', icon: Factory, color: '#DC2626', bg: '#DC262622' },
  { discipline: 'chemical', icon: FlaskConical, color: '#0D9488', bg: '#0D948822' },
  { discipline: 'electronics', icon: Cpu, color: '#7C3AED', bg: '#7C3AED22' },
  { discipline: 'mechatronics', icon: Bot, color: '#0891B2', bg: '#0891B222' },
  { discipline: 'architecture', icon: Building2, color: '#D97706', bg: '#D9770622' },
  { discipline: 'hse', icon: ShieldCheck, color: '#059669', bg: '#05966922' },
];

// CEFR band labels
const BAND_META: Record<CefrLevel, { label: string; speed: string }> = {
  A1: { label: 'Foundation', speed: '80 km/h' },
  A2: { label: 'Essentials', speed: '120 km/h' },
  B1: { label: 'Core', speed: '160 km/h' },
  B2: { label: 'Advanced Core', speed: '220 km/h' },
  C1: { label: 'Proficient', speed: '280 km/h' },
  C2: { label: 'Expert · Apex', speed: '350 km/h' },
};

// Node dimensions
const NODE_W = 80;
const NODE_H = 80;
const H_GAP = 20; // horizontal gap between nodes
const ROW_H = 140; // vertical height per row (node + label + connector)

export const HighSpeedRailwayPath: React.FC<HighSpeedRailwayPathProps> = React.memo(
  ({ path, onSelectLevel }) => {
    const translate = useLocalizationStore((s) => s.translate);
    const isRTL = useDirection();
    const [hovered, setHovered] = useState<string | null>(null);
    const palette = getDisciplinePalette(path.discipline);

    // Current train position
    const trainLevel = useMemo(() => {
      for (const stage of path.stages) {
        const ip = stage.levels.find((l) => l.status === 'in-progress');
        if (ip) return ip;
      }
      for (const stage of path.stages) {
        const av = stage.levels.find((l) => l.status === 'available');
        if (av) return av;
      }
      return path.stages[0]?.levels[0] ?? null;
    }, [path]);

    return (
      <div className="w-full space-y-0 select-none font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
        {path.stages.map((stage: PathStage, stageIdx: number) => {
          const meta = BAND_META[stage.cefrLevel] ?? BAND_META.A1;
          // Even stages: L→R, odd: R→L (flip for RTL)
          const ltr = isRTL ? stageIdx % 2 !== 0 : stageIdx % 2 === 0;
          const levels = ltr ? stage.levels : [...stage.levels].reverse();

          return (
            <div key={stage.id} className="relative">
              {/* ── Stage Band Header ── */}
              <div className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface px-5 py-3 shadow-sm mb-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow"
                  style={{ background: palette.primary }}
                >
                  {stage.cefrLevel}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      TRACK {String(stageIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-muted-copy">
                      {stage.cefrLevel} · {meta.label}
                    </span>
                    <span className="rounded bg-surface-hover border border-border-soft px-1.5 py-0.5 font-mono text-[9px] text-muted-copy">
                      ⚡ {meta.speed}
                    </span>
                  </div>
                  <p className="text-sm font-black text-foreground truncate">
                    {translate(stage.titleKey)}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold text-muted-copy">
                  {stage.masteredTerms}/{stage.totalTerms}{' '}
                  <span className="text-[10px]">{translate('learningpath.terms')}</span>
                </span>
              </div>

              {/* ── Rail + Station Nodes ── */}
              <div className="relative px-2 pb-2" style={{ minHeight: ROW_H }}>
                {/* Horizontal rail track behind nodes */}
                <div
                  className="absolute top-[40px] left-0 right-0 flex flex-col gap-1 pointer-events-none px-4"
                  style={{ transform: ltr ? undefined : 'scaleX(-1)' }}
                >
                  {/* Upper rail */}
                  <div className="h-[3px] w-full rounded-full bg-border-soft/80" />
                  {/* Sleepers */}
                  <div
                    className="h-4 w-full"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(to right, transparent, transparent 16px, var(--color-border-soft) 16px, var(--color-border-soft) 20px)',
                      opacity: 0.5,
                    }}
                  />
                  {/* Lower rail */}
                  <div className="h-[3px] w-full rounded-full bg-border-soft/80" />
                </div>

                {/* Nodes row */}
                <div
                  className={`relative z-10 flex flex-nowrap items-end gap-0 overflow-x-auto pb-2 scroll-fade-x ${ltr ? 'flex-row' : 'flex-row-reverse'}`}
                  style={{ gap: H_GAP }}
                >
                  {/* eslint-disable-next-line complexity -- large per-level node render */}
                  {levels.map((level: PathLevel, lvlIdx: number) => {
                    const globalIdx =
                      path.stages.slice(0, stageIdx).reduce((acc, s) => acc + s.levels.length, 0) +
                      lvlIdx;
                    const motif = MOTIFS[globalIdx % MOTIFS.length];
                    const MotifIcon = motif.icon;
                    const done = level.status === 'completed';
                    const active = level.status === 'in-progress';
                    const avail = level.status === 'available';
                    const locked = level.status === 'locked';
                    const hasTrain = trainLevel?.id === level.id;
                    const isHov = hovered === level.id;

                    // Connector line between nodes (except last)
                    const showConnector = lvlIdx < levels.length - 1;

                    return (
                      <div
                        key={level.id}
                        className="flex shrink-0 flex-col items-center"
                        style={{ width: NODE_W }}
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHovered(level.id)}
                        onMouseLeave={() => setHovered(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setHovered(level.id);
                          if (e.key === 'Escape') setHovered(null);
                        }}
                      >
                        {/* Train indicator above active node */}
                        {hasTrain && (
                          <motion.div
                            layoutId="train-indicator"
                            initial={{ y: -6, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mb-1 flex flex-col items-center"
                          >
                            <div
                              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black text-white shadow-lg"
                              style={{ background: palette.primary }}
                            >
                              <Train className="h-3 w-3 animate-pulse" />
                              <span>EXPRESS</span>
                            </div>
                            <div
                              className="h-1.5 w-1.5 rotate-45"
                              style={{ background: palette.primary }}
                            />
                          </motion.div>
                        )}

                        {/* Station node button */}
                        <button
                          type="button"
                          onClick={() => !locked && onSelectLevel(level.id)}
                          disabled={locked}
                          aria-label={`${level.cefrLevel} ${level.index + 1} - ${level.termCount} ${translate('learningpath.terms')} (${level.status})`}
                          style={{
                            width: NODE_W,
                            height: NODE_H,
                            borderColor: done
                              ? '#22c55e'
                              : active
                                ? palette.primary
                                : avail
                                  ? palette.primary + '80'
                                  : undefined,
                            boxShadow:
                              isHov && !locked ? `0 8px 24px -4px ${palette.primary}50` : undefined,
                          }}
                          className={`relative flex flex-col items-center justify-between rounded-2xl border-2 p-2 transition-all duration-200 ${
                            done
                              ? 'bg-emerald-500/10 cursor-pointer'
                              : active
                                ? 'cursor-pointer shadow-lg'
                                : avail
                                  ? 'bg-surface cursor-pointer hover:scale-105'
                                  : 'border-border-soft/50 bg-surface/40 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {/* Top: discipline icon badge */}
                          <div className="flex w-full items-center justify-between">
                            <span
                              className="flex h-5 w-5 items-center justify-center rounded"
                              style={{ background: motif.bg }}
                            >
                              <MotifIcon className="h-3 w-3" style={{ color: motif.color }} />
                            </span>
                            {/* 3-aspect signal */}
                            <span
                              className={`h-2 w-2 rounded-full ${
                                done
                                  ? 'bg-emerald-500'
                                  : active
                                    ? 'bg-amber-500 animate-ping'
                                    : avail
                                      ? 'bg-primary/70'
                                      : 'bg-border-soft'
                              }`}
                            />
                          </div>

                          {/* Center: locomotive / lock / number */}
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            {done ? (
                              <CheckCircle2 className="h-6 w-6 text-emerald-500 stroke-[2.5]" />
                            ) : locked ? (
                              <Lock className="h-5 w-5 text-muted-copy/60" />
                            ) : hasTrain ? (
                              <Train className="h-6 w-6" style={{ color: palette.primary }} />
                            ) : (
                              <span className="text-base font-black text-foreground leading-none">
                                {level.index + 1}
                              </span>
                            )}
                          </div>

                          {/* Bottom: XP */}
                          <span className="text-[9px] font-mono font-bold text-muted-copy">
                            +{level.xpReward} XP
                          </span>

                          {/* Pulsing ring when in-progress */}
                          {active && (
                            <span
                              className="absolute inset-0 rounded-2xl border-2 animate-ping opacity-30 pointer-events-none"
                              style={{ borderColor: palette.primary }}
                            />
                          )}
                        </button>

                        {/* Label below node */}
                        <div className="mt-1.5 text-center w-full px-0.5">
                          <span className="block text-[10px] font-bold text-foreground leading-tight truncate">
                            {level.cefrLevel} · {level.index + 1}
                          </span>
                          <span className="block text-[9px] text-muted-copy">
                            {level.termCount} {translate('learningpath.terms')}
                          </span>
                        </div>

                        {/* Inline connector to next node (visual only) */}
                        {showConnector && <div className="sr-only" aria-hidden />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Switchback connector between stages ── */}
              {stageIdx < path.stages.length - 1 && (
                <div
                  className={`flex items-center my-3 px-6 ${ltr ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-surface/80 px-4 py-2 text-[11px] font-bold text-primary shadow-sm"
                    style={{ transform: isRTL ? 'scaleX(-1)' : undefined }}
                  >
                    <Train className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Switch →{' '}
                      {translate(
                        `learningpath.band.${path.stages[stageIdx + 1].cefrLevel.toLowerCase()}`
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Apex Terminal ── */}
        <div className="mt-6 rounded-2xl border-2 border-primary/40 bg-surface/80 p-6 text-center shadow-xl">
          <div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ background: palette.primary }}
          >
            <Train className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-black text-foreground">
            {translate('learningpath.apexTerminal')}
          </h3>
          <p className="mt-1 text-xs text-muted-copy max-w-xs mx-auto">
            {translate('learningpath.apexDescription')}
          </p>
        </div>
      </div>
    );
  }
);

export default HighSpeedRailwayPath;
