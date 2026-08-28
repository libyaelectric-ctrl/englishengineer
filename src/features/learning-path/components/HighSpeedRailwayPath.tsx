import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Code2,
  Cpu,
  Factory,
  Flame,
  FlaskConical,
  GitFork,
  HardHat,
  Lock,
  Radio,
  ShieldCheck,
  Sparkles,
  Train,
  Wrench,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';

import React, { useMemo, useState } from 'react';

import {
  DISCIPLINE_META,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import { useDirection } from '@/shared/hooks/useDirection';
import type { CefrLevel } from '@/shared/types/domain.types';

import { useLocalizationStore } from '@/features/localization';

import { getDisciplinePalette } from '../discipline-palette';
import type { LearningPath, PathLevel, PathStage } from '../learning-path.types';

export interface HighSpeedRailwayPathProps {
  path: LearningPath;
  onSelectLevel: (levelId: string) => void;
}

// ── 10 Discipline Thematic Motifs on Railway Stops ──────────────────────────
interface DisciplineStopMotif {
  discipline: EngineeringDiscipline;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const DISCIPLINE_STOP_MOTIFS: DisciplineStopMotif[] = [
  {
    discipline: 'civil',
    label: 'Civil Site',
    sublabel: 'Foundations & Structural',
    icon: HardHat,
    color: '#EA580C',
    bgColor: 'rgba(234, 88, 12, 0.12)',
    borderColor: 'rgba(234, 88, 12, 0.35)',
  },
  {
    discipline: 'mechanical',
    label: 'Mechanical Bay',
    sublabel: 'Hydraulics & Drive Systems',
    icon: Wrench,
    color: '#2563EB',
    bgColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: 'rgba(37, 99, 235, 0.35)',
  },
  {
    discipline: 'electrical',
    label: 'Electrical Substation',
    sublabel: 'HV Grid & Power Feed',
    icon: Zap,
    color: '#CA8A04',
    bgColor: 'rgba(202, 138, 4, 0.12)',
    borderColor: 'rgba(202, 138, 4, 0.35)',
  },
  {
    discipline: 'software',
    label: 'Software Node',
    sublabel: 'Telemetry & Control Logic',
    icon: Code2,
    color: '#16A34A',
    bgColor: 'rgba(22, 163, 74, 0.12)',
    borderColor: 'rgba(22, 163, 74, 0.35)',
  },
  {
    discipline: 'industrial',
    label: 'Industrial Plant',
    sublabel: 'Assembly & Operations',
    icon: Factory,
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.12)',
    borderColor: 'rgba(220, 38, 38, 0.35)',
  },
  {
    discipline: 'chemical',
    label: 'Chemical Process',
    sublabel: 'Piping & Synthesis',
    icon: FlaskConical,
    color: '#0D9488',
    bgColor: 'rgba(13, 148, 136, 0.12)',
    borderColor: 'rgba(13, 148, 136, 0.35)',
  },
  {
    discipline: 'electronics',
    label: 'Electronics Hub',
    sublabel: 'PCB Circuits & Sensors',
    icon: Cpu,
    color: '#7C3AED',
    bgColor: 'rgba(124, 58, 237, 0.12)',
    borderColor: 'rgba(124, 58, 237, 0.35)',
  },
  {
    discipline: 'mechatronics',
    label: 'Robotics Station',
    sublabel: 'Actuators & Automation',
    icon: Bot,
    color: '#0891B2',
    bgColor: 'rgba(8, 145, 178, 0.12)',
    borderColor: 'rgba(8, 145, 178, 0.35)',
  },
  {
    discipline: 'architecture',
    label: 'Architecture Studio',
    sublabel: 'BIM & Space Engineering',
    icon: Building2,
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.12)',
    borderColor: 'rgba(217, 119, 6, 0.35)',
  },
  {
    discipline: 'hse',
    label: 'HSE Safety Gate',
    sublabel: 'Zero Hazard & Compliance',
    icon: ShieldCheck,
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.12)',
    borderColor: 'rgba(5, 150, 105, 0.35)',
  },
];

// ── CEFR Central Terminal Metadata ──────────────────────────────────────────
const CEFR_TERMINALS: Record<
  CefrLevel,
  { name: string; tag: string; trackBadge: string; signalSpeed: string }
> = {
  A1: {
    name: 'Foundation Grand Central',
    tag: 'Platform 01 · Essential Baseline',
    trackBadge: 'TRACK 01',
    signalSpeed: '80 km/h',
  },
  A2: {
    name: 'Operational Junction',
    tag: 'Platform 02 · Functional Core',
    trackBadge: 'TRACK 02',
    signalSpeed: '120 km/h',
  },
  B1: {
    name: 'Intermediate Express Terminal',
    tag: 'Platform 03 · Autonomous Engineering',
    trackBadge: 'TRACK 03',
    signalSpeed: '160 km/h',
  },
  B2: {
    name: 'Advanced Technical Hub',
    tag: 'Platform 04 · Professional Command',
    trackBadge: 'TRACK 04',
    signalSpeed: '220 km/h',
  },
  C1: {
    name: 'Proficiency Interchange',
    tag: 'Platform 05 · Lead Project Synthesis',
    trackBadge: 'TRACK 05',
    signalSpeed: '280 km/h',
  },
  C2: {
    name: 'Chief Engineer Apex Terminal',
    tag: 'Platform 06 · International Mastery',
    trackBadge: 'TRACK 06 APEX',
    signalSpeed: '350 km/h Express',
  },
};

export const HighSpeedRailwayPath: React.FC<HighSpeedRailwayPathProps> = ({
  path,
  onSelectLevel,
}) => {
  const translate = useLocalizationStore((state) => state.translate);
  const isRTL = useDirection();
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const palette = getDisciplinePalette(path.discipline);

  // Active locomotive position
  const currentActiveLevel = useMemo(() => {
    for (const stage of path.stages) {
      const inProg = stage.levels.find((lvl) => lvl.status === 'in-progress');
      if (inProg) return inProg;
    }
    for (const stage of path.stages) {
      const avail = stage.levels.find((lvl) => lvl.status === 'available');
      if (avail) return avail;
    }
    return path.stages[0]?.levels[0] || null;
  }, [path]);

  const totalMasteredRatio = path.totalTerms > 0 ? path.masteredTerms / path.totalTerms : 0;

  // Flattened counter for cycling the 10 engineering motifs sequentially across stops
  let globalStopCounter = 0;

  return (
    <div className="w-full space-y-10 select-none font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── HIGH-SPEED RAIL DISPATCH DASHBOARD (HUD) ────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface/90 backdrop-blur-md p-5 shadow-lg">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 15px, var(--color-border-soft) 15px, var(--color-border-soft) 16px)`,
          }}
        />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          {/* Dispatch Line Header */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/30">
              <Train className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  HIGH-SPEED CORRIDOR A1 ➔ C2
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Radio className="h-2.5 w-2.5 animate-ping" />
                  LINE CLEAR · SIGNALS OPERATIONAL
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Engineering Express Route · {translate(DISCIPLINE_META[path.discipline].labelKey)}
              </h2>
            </div>
          </div>

          {/* Active Train Status */}
          {currentActiveLevel && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow">
                <Train className="h-4.5 w-4.5 animate-bounce" />
              </div>
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Locomotive Dispatch
                </span>
                <p className="text-xs font-black text-foreground">
                  {currentActiveLevel.cefrLevel} · Stop {currentActiveLevel.index + 1}
                </p>
              </div>
            </div>
          )}

          {/* Line Progress Metrics */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{Math.round(totalMasteredRatio * 100)}% Route Completed</span>
            </div>
            <div className="h-4 w-px bg-border-soft" />
            <div className="flex items-center gap-1.5 text-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{path.totalTerms} Specialized Terms</span>
            </div>
          </div>
        </div>

        {/* 10 Disciplines Integrated Badge Strip */}
        <div className="mt-4 border-t border-border-soft/70 pt-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-muted-copy">
            Integrated Engineering Station Motifs Across All Stops:
          </p>
          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
            {DISCIPLINE_STOP_MOTIFS.map((motif) => {
              const MotifIcon = motif.icon;
              return (
                <div
                  key={motif.discipline}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold shadow-2xs"
                  style={{
                    backgroundColor: motif.bgColor,
                    borderColor: motif.borderColor,
                    color: motif.color,
                  }}
                >
                  <MotifIcon className="h-3.5 w-3.5" />
                  <span>{motif.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── THE SNAKING CONTINUOUS HIGH-SPEED RAIL CORRIDOR ─────────────── */}
      <div className="relative space-y-10">
        {path.stages.map((stage: PathStage, stageIdx: number) => {
          const terminal = CEFR_TERMINALS[stage.cefrLevel] || CEFR_TERMINALS.A1;
          const isEvenRow = stageIdx % 2 === 0;
          // Row Flow Direction: In LTR, Even = Left->Right, Odd = Right->Left.
          // In RTL, Even = Right->Left, Odd = Left->Right.
          const isLeftToRight = isRTL ? !isEvenRow : isEvenRow;

          return (
            <div key={stage.id} className="relative">
              {/* ── CENTRAL STATION BANNER (Platform Header) ── */}
              <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface p-5 shadow-sm">
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-sm">
                      {stage.cefrLevel}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary">
                          {terminal.trackBadge}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-copy">
                          {terminal.tag}
                        </span>
                        <span className="rounded bg-surface-hover border border-border-soft px-1.5 py-0.2 text-[9px] font-mono text-muted-copy">
                          ⚡ {terminal.signalSpeed}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-black text-foreground">
                        {translate(stage.titleKey)} — {terminal.name}
                      </h3>
                    </div>
                  </div>

                  {/* Stage Progress & Term Count */}
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="rounded-lg bg-surface-hover border border-border-soft px-3 py-1 text-muted-copy">
                      {stage.masteredTerms} / {stage.totalTerms} {translate('learningpath.terms')}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        stage.isCurrent
                          ? 'bg-amber-500 animate-ping'
                          : stage.masteredTerms >= stage.totalTerms && stage.totalTerms > 0
                            ? 'bg-emerald-500'
                            : 'bg-muted-copy/40'
                      }`}
                      title={stage.isCurrent ? 'Current Active Line' : 'Line Status'}
                    />
                  </div>
                </div>
              </div>

              {/* ── RAILWAY TRACK & STATIONS LAYER ── */}
              <div className="relative mt-6 px-4 sm:px-8">
                {/* 1. Track Ballast & Rails */}
                <div className="absolute inset-x-4 sm:inset-x-8 top-1/2 -translate-y-1/2 h-10 pointer-events-none flex items-center">
                  {/* Ballast Layer */}
                  <div className="absolute inset-0 rounded-full bg-border-soft/40 -z-10" />

                  {/* Double Heavy Steel Rails */}
                  <div className="absolute top-2 inset-x-0 h-1 bg-border-hover dark:bg-border-soft shadow-inner" />
                  <div className="absolute bottom-2 inset-x-0 h-1 bg-border-hover dark:bg-border-soft shadow-inner" />

                  {/* Wooden / Concrete Sleepers Pattern */}
                  <div
                    className="w-full h-full flex justify-between px-2"
                    style={{
                      backgroundImage: `repeating-linear-gradient(to right, transparent, transparent 18px, var(--color-border-soft) 18px, var(--color-border-soft) 22px)`,
                      opacity: 0.7,
                    }}
                  />
                </div>

                {/* 2. Level Stations (Ordered with Discipline Motifs) */}
                <div
                  className={`relative z-10 flex items-center gap-6 sm:gap-10 overflow-x-auto py-8 ${
                    isLeftToRight ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {stage.levels.map((level: PathLevel, lvlIdx: number) => {
                    const isCompleted = level.status === 'completed';
                    const isInProgress = level.status === 'in-progress';
                    const isLocked = level.status === 'locked';
                    const isAvailable = level.status === 'available';
                    const hasTrain = currentActiveLevel?.id === level.id;
                    const isHovered = hoveredLevel === level.id;

                    // Assign a discipline motif cycling across stops
                    const motif =
                      DISCIPLINE_STOP_MOTIFS[globalStopCounter % DISCIPLINE_STOP_MOTIFS.length];
                    globalStopCounter += 1;
                    const MotifIcon = motif.icon;

                    return (
                      <div
                        key={level.id}
                        className="relative flex flex-col items-center shrink-0"
                        onMouseEnter={() => setHoveredLevel(level.id)}
                        onMouseLeave={() => setHoveredLevel(null)}
                      >
                        {/* 🚆 Interactive High-Speed Train Positioned on Active Stop */}
                        {hasTrain && (
                          <motion.div
                            layoutId="highspeed-bullet-train"
                            initial={{ scale: 0.8, y: -10 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                            className="absolute -top-12 z-30 flex flex-col items-center"
                          >
                            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-primary px-3 py-1 text-[10px] font-black text-white shadow-xl shadow-primary/40 border border-white/20">
                              <Train className="h-3.5 w-3.5 animate-pulse text-yellow-300" />
                              <span>CURRENT EXPRESS</span>
                            </div>
                            <div className="h-2 w-2 rotate-45 bg-primary -mt-1" />
                          </motion.div>
                        )}

                        {/* Station Node Button */}
                        <button
                          type="button"
                          onClick={() => onSelectLevel(level.id)}
                          disabled={isLocked}
                          className={`group relative flex h-20 w-24 flex-col items-center justify-between rounded-2xl border-2 p-2.5 transition-all duration-300 cursor-pointer ${
                            isCompleted
                              ? 'border-emerald-500 bg-surface shadow-md hover:scale-105 hover:border-emerald-400'
                              : isInProgress
                                ? 'border-amber-500 bg-surface shadow-xl shadow-amber-500/25 hover:scale-105'
                                : isAvailable
                                  ? 'border-primary/80 bg-surface shadow-md hover:scale-105 hover:border-primary hover:bg-primary/5'
                                  : 'border-border-soft/60 bg-surface/40 text-muted-copy cursor-not-allowed opacity-50'
                          }`}
                          style={{
                            boxShadow: isHovered
                              ? `0 12px 30px -5px ${palette.primary}35`
                              : undefined,
                          }}
                        >
                          {/* Top Signal Indicator */}
                          <div className="flex w-full items-center justify-between">
                            <span
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tight"
                              style={{
                                backgroundColor: motif.bgColor,
                                color: motif.color,
                              }}
                            >
                              <MotifIcon className="h-2.5 w-2.5" />
                              <span>{motif.discipline.slice(0, 4)}</span>
                            </span>

                            {/* 3-Aspect Railway Signal Light */}
                            <span
                              className={`h-2.5 w-2.5 rounded-full shadow-xs ${
                                isCompleted
                                  ? 'bg-emerald-500 shadow-emerald-500/60'
                                  : isInProgress
                                    ? 'bg-amber-500 animate-ping'
                                    : isAvailable
                                      ? 'bg-primary'
                                      : 'bg-border-soft'
                              }`}
                            />
                          </div>

                          {/* Station Core Node Content */}
                          <div className="flex items-center justify-center my-0.5">
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-emerald-500 stroke-[2.5]" />
                            ) : isLocked ? (
                              <Lock className="h-5 w-5 text-muted-copy" />
                            ) : (
                              <div className="text-center">
                                <span className="block text-base font-black leading-none text-foreground">
                                  {lvlIdx + 1}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bottom Reward / Term Tag */}
                          <span className="text-[9px] font-mono font-bold text-muted-copy">
                            +{level.xpReward} XP
                          </span>

                          {/* Pulsing Aura if In-Progress */}
                          {isInProgress && (
                            <span className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-ping opacity-30 pointer-events-none" />
                          )}
                        </button>

                        {/* Station Name & Discipline Touchpoint Subtitle */}
                        <div className="mt-2 text-center max-w-[6.5rem]">
                          <span className="block text-[11px] font-extrabold text-foreground leading-tight truncate">
                            {motif.label}
                          </span>
                          <span className="block text-[9px] font-medium text-muted-copy truncate">
                            {level.termCount} {translate('learningpath.terms')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── INDUSTRIAL SWITCH TRACK LOOP (Makas Hattı) ── */}
              {stageIdx < path.stages.length - 1 && (
                <div
                  className={`flex items-center my-5 px-8 ${
                    isLeftToRight ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className="relative flex items-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-surface/80 px-5 py-2.5 text-xs font-bold text-foreground shadow-sm"
                    style={{ transform: isRTL ? 'scaleX(-1)' : undefined }}
                  >
                    <GitFork className="h-4 w-4 text-primary" />
                    <span>Railway Switch Track ➔</span>
                    <span className="font-mono text-[11px] text-primary">
                      Switching to {path.stages[stageIdx + 1].cefrLevel} Line
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── APEX TERMINAL C2 FINALE ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-surface p-8 text-center shadow-xl">
        <div className="relative z-10 mx-auto max-w-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/30">
            <Train className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            C2 Chief Engineer Grand Central Terminal
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-copy sm:text-sm">
            You have traversed all 10 engineering discipline corridors from A1 ground foundations to
            C2 mastery. Prepared for cross-border site operations, project negotiations, and senior
            executive communication.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
            <span className="rounded-full bg-surface border border-border-soft px-4 py-1.5 shadow-sm text-foreground">
              🏆 Verified High-Speed C2 Accreditation
            </span>
            <span className="rounded-full bg-surface border border-border-soft px-4 py-1.5 shadow-sm text-foreground">
              ⚡ 10 Disciplines Mastered
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighSpeedRailwayPath;
