import {
  Bot,
  Building2,
  CheckCircle2,
  Code2,
  Cpu,
  Factory,
  Flame,
  FlaskConical,
  HardHat,
  Lock,
  Mountain,
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
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import { useDirection } from '@/shared/hooks/useDirection';
import type { CefrLevel } from '@/shared/types/domain.types';

import { useLocalizationStore } from '@/features/localization';

import { DISCIPLINE_PALETTES, getDisciplinePalette } from '../discipline-palette';
import type { LearningPath, PathLevel, PathStage } from '../learning-path.types';

export interface MountainRailwayPathProps {
  path: LearningPath;
  onSelectLevel: (levelId: string) => void;
  onDisciplineChange?: (discipline: EngineeringDiscipline) => void;
  selectedDiscipline?: EngineeringDiscipline;
}

// ── 10 Discipline Thematic Landmark Mapping Across Mountain Elevation ───
interface StageMountainMeta {
  cefrLevel: CefrLevel;
  elevationMeters: string;
  stationCode: string;
  landmarkKey: string;
  landmarkEn: string;
  primaryDisciplines: EngineeringDiscipline[];
  gradientTheme: string;
  icon: React.ElementType;
}

const STAGE_MOUNTAIN_DATA: Record<CefrLevel, StageMountainMeta> = {
  A1: {
    cefrLevel: 'A1',
    elevationMeters: '0m – 500m',
    stationCode: 'STN-A1-BASE',
    landmarkKey: 'learningpath.station.a1',
    landmarkEn: 'Valley Groundwork & Site Survey Base',
    primaryDisciplines: ['civil', 'hse'],
    gradientTheme: 'from-amber-600/20 via-orange-600/10 to-stone-900/40',
    icon: HardHat,
  },
  A2: {
    cefrLevel: 'A2',
    elevationMeters: '500m – 1,400m',
    stationCode: 'STN-A2-PLANT',
    landmarkKey: 'learningpath.station.a2',
    landmarkEn: 'Foothills Industrial Fabrication & Assembly Hub',
    primaryDisciplines: ['mechanical', 'industrial'],
    gradientTheme: 'from-blue-600/20 via-cyan-600/10 to-slate-900/40',
    icon: Factory,
  },
  B1: {
    cefrLevel: 'B1',
    elevationMeters: '1,400m – 2,500m',
    stationCode: 'STN-B1-GRID',
    landmarkKey: 'learningpath.station.b1',
    landmarkEn: 'High-Plateau Hydro-Electric & Circuit Telemetry Station',
    primaryDisciplines: ['electrical', 'electronics'],
    gradientTheme: 'from-yellow-600/20 via-amber-600/10 to-zinc-900/40',
    icon: Zap,
  },
  B2: {
    cefrLevel: 'B2',
    elevationMeters: '2,500m – 3,500m',
    landmarkKey: 'learningpath.station.b2',
    stationCode: 'STN-B2-CYBER',
    landmarkEn: 'Automation Ridge & SCADA Robotics Citadel',
    primaryDisciplines: ['mechatronics', 'software'],
    gradientTheme: 'from-emerald-600/20 via-teal-600/10 to-slate-900/40',
    icon: Bot,
  },
  C1: {
    cefrLevel: 'C1',
    elevationMeters: '3,500m – 4,400m',
    stationCode: 'STN-C1-SYNTH',
    landmarkKey: 'learningpath.station.c1',
    landmarkEn: 'Synthesis Peak & Bioclimatic Structural Dome',
    primaryDisciplines: ['chemical', 'architecture'],
    gradientTheme: 'from-violet-600/20 via-purple-600/10 to-slate-900/40',
    icon: FlaskConical,
  },
  C2: {
    cefrLevel: 'C2',
    elevationMeters: '4,400m – 5,000m',
    stationCode: 'STN-C2-APEX',
    landmarkKey: 'learningpath.station.c2',
    landmarkEn: 'Chief Engineer Apex Command Summit',
    primaryDisciplines: ['civil', 'mechanical', 'electrical', 'software', 'industrial'],
    gradientTheme: 'from-amber-500/30 via-yellow-500/20 to-stone-900/50',
    icon: Mountain,
  },
};

const DISCIPLINE_ICONS: Record<EngineeringDiscipline, React.ElementType> = {
  architecture: Building2,
  chemical: FlaskConical,
  civil: HardHat,
  electrical: Zap,
  electronics: Cpu,
  hse: ShieldCheck,
  industrial: Factory,
  mechanical: Wrench,
  mechatronics: Bot,
  software: Code2,
};

export const MountainRailwayPath: React.FC<MountainRailwayPathProps> = ({
  path,
  onSelectLevel,
  onDisciplineChange,
  selectedDiscipline,
}) => {
  const translate = useLocalizationStore((state) => state.translate);
  const isRTL = useDirection();
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const activeDiscipline = selectedDiscipline || path.discipline;
  const palette = getDisciplinePalette(activeDiscipline);

  // Find user's active train location (first in-progress or available level)
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

  // Elevation progression calculation
  const totalMasteredRatio = path.totalTerms > 0 ? path.masteredTerms / path.totalTerms : 0;
  const currentAltitude = Math.round(totalMasteredRatio * 5000);

  return (
    <div className="w-full space-y-8 select-none" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── TOPOGRAPHIC HUD: ALTITUDE & DISCIPLINE BAR ──────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface/90 backdrop-blur-md p-5 shadow-lg">
        {/* Ambient Topo Mesh Background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${palette.primary} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          {/* Elevation HUD */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
              <Mountain className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-copy">
                  {translate('learningpath.elevation') || 'Ascent Elevation'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Radio className="h-2.5 w-2.5 animate-ping" />
                  COG-RAIL ACTIVE
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                  {currentAltitude.toLocaleString()} m
                </span>
                <span className="text-xs font-semibold text-muted-copy">/ 5,000 m Summit</span>
              </div>
            </div>
          </div>

          {/* Locomotive Status Capsule */}
          {currentActiveLevel && (
            <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-background/80 px-4 py-2.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Train className="h-4 w-4 animate-bounce" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                  Train Location
                </p>
                <p className="text-xs font-black text-foreground">
                  {currentActiveLevel.cefrLevel} · Level {currentActiveLevel.index + 1}
                </p>
              </div>
            </div>
          )}

          {/* Quick Stats: Mastery & Career Points */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{Math.round(totalMasteredRatio * 100)}% Mastered</span>
            </div>
            <div className="h-4 w-px bg-border-soft" />
            <div className="flex items-center gap-1.5 text-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{path.totalTerms} Total Terms</span>
            </div>
          </div>
        </div>

        {/* ── 10 ENGINEERING DISCIPLINES SWITCHER STRIP ── */}
        <div className="mt-5 border-t border-border-soft/70 pt-4">
          <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-muted-copy">
            <span>Engineering Discipline Rail Track:</span>
            <span className="text-primary font-bold">
              {translate(DISCIPLINE_META[activeDiscipline].labelKey)}
            </span>
          </div>

          <div className="scrollbar-thin flex gap-1.5 overflow-x-auto pb-1">
            {ENGINEERING_DISCIPLINES.map((disc) => {
              const meta = DISCIPLINE_META[disc];
              const IconComp = DISCIPLINE_ICONS[disc];
              const isSelected = disc === activeDiscipline;
              const discPalette = DISCIPLINE_PALETTES[disc];

              return (
                <button
                  key={disc}
                  type="button"
                  onClick={() => onDisciplineChange?.(disc)}
                  className={`group relative flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary text-white shadow-md'
                      : 'border-border-soft bg-surface text-muted-copy hover:border-primary/40 hover:text-foreground hover:bg-surface-hover'
                  }`}
                  style={{
                    borderColor: isSelected ? discPalette.primary : undefined,
                    backgroundColor: isSelected ? discPalette.primary : undefined,
                  }}
                  title={translate(meta.labelKey)}
                >
                  <IconComp className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{translate(meta.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── THE MOUNTAIN COGWHEEL RAILROAD TRACK ────────────────────────── */}
      <div className="relative space-y-12">
        {path.stages.map((stage: PathStage, stageIdx: number) => {
          const mountainData = STAGE_MOUNTAIN_DATA[stage.cefrLevel] || STAGE_MOUNTAIN_DATA.A1;
          const LandmarkIcon = mountainData.icon;
          const isEvenRow = stageIdx % 2 === 0;
          // Determine row flow: In LTR: Even is Left->Right, Odd is Right->Left.
          // In RTL: Even is Right->Left, Odd is Left->Right.
          const isLeftToRight = isRTL ? !isEvenRow : isEvenRow;

          return (
            <div key={stage.id} className="relative">
              {/* ── STAGE MOUNTAIN HEADER CARD ── */}
              <div
                className={`relative overflow-hidden rounded-2xl border border-border-soft bg-gradient-to-r ${mountainData.gradientTheme} p-5 shadow-md`}
              >
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface/80 border border-border-soft shadow-sm text-foreground">
                      <LandmarkIcon className="h-5.5 w-5.5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
                          {stage.cefrLevel} BAND
                        </span>
                        <span className="font-mono text-[10px] font-bold text-muted-copy">
                          {mountainData.stationCode}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-copy">
                          · {mountainData.elevationMeters}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-black text-foreground">
                        {translate(stage.titleKey)} — {mountainData.landmarkEn}
                      </h3>
                    </div>
                  </div>

                  {/* Discipline synergy tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {mountainData.primaryDisciplines.map((d) => {
                      const DiscIcon = DISCIPLINE_ICONS[d];
                      return (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1 rounded-full border border-border-soft/60 bg-surface/70 px-2.5 py-1 text-[10px] font-bold text-foreground"
                        >
                          <DiscIcon className="h-3 w-3 text-primary" />
                          <span className="capitalize">{d}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── RAILWAY TRACK & WAYPOINT STATIONS CONTAINER ── */}
              <div className="relative mt-6 px-4 sm:px-8">
                {/* Visual Railway Track Bed (Traversler / Sleepers & Rails) */}
                <div className="absolute inset-x-4 sm:inset-x-8 top-1/2 -translate-y-1/2 h-8 pointer-events-none flex items-center">
                  {/* Ballast Stone Bed */}
                  <div className="absolute inset-0 rounded-full bg-border-soft/30 -z-10" />

                  {/* Double Steel Rails */}
                  <div className="absolute top-1.5 inset-x-0 h-0.5 bg-border-soft dark:bg-border-soft/80" />
                  <div className="absolute bottom-1.5 inset-x-0 h-0.5 bg-border-soft dark:bg-border-soft/80" />

                  {/* Wooden / Steel Sleepers (Traversler) */}
                  <div
                    className="w-full h-full flex justify-between px-2"
                    style={{
                      backgroundImage: `repeating-linear-gradient(to right, transparent, transparent 16px, var(--color-border-soft) 16px, var(--color-border-soft) 20px)`,
                      opacity: 0.6,
                    }}
                  />
                </div>

                {/* Level Waypoint Station Nodes */}
                <div
                  className={`relative z-10 flex items-center gap-4 sm:gap-8 overflow-x-auto py-6 ${
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

                    return (
                      <div
                        key={level.id}
                        className="relative flex flex-col items-center shrink-0"
                        onMouseEnter={() => setHoveredLevel(level.id)}
                        onMouseLeave={() => setHoveredLevel(null)}
                      >
                        {/* Interactive Train / Locomotive Positioning */}
                        {hasTrain && (
                          <motion.div
                            layoutId="railway-locomotive"
                            initial={{ scale: 0.8, y: -8 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                            className="absolute -top-11 z-30 flex flex-col items-center"
                          >
                            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-[9px] font-black text-white shadow-lg shadow-orange-500/30">
                              <Train className="h-3 w-3 animate-pulse" />
                              <span>CURRENT TRAIN</span>
                            </div>
                            <div className="h-2 w-2 rotate-45 bg-orange-500 -mt-1" />
                          </motion.div>
                        )}

                        {/* Station Waypoint Node Button */}
                        <button
                          type="button"
                          onClick={() => onSelectLevel(level.id)}
                          disabled={isLocked}
                          className={`group relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                            isCompleted
                              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-md hover:scale-110 hover:border-emerald-400'
                              : isInProgress
                                ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/20 hover:scale-110'
                                : isAvailable
                                  ? 'border-primary bg-surface text-primary hover:bg-primary hover:text-white hover:scale-110 shadow-md'
                                  : 'border-border-soft/60 bg-surface/50 text-muted-copy cursor-not-allowed opacity-60'
                          }`}
                          style={{
                            borderColor: isInProgress ? palette.primary : undefined,
                            boxShadow: isHovered
                              ? `0 10px 25px -5px ${palette.primary}40`
                              : undefined,
                          }}
                        >
                          {/* Station Core Display */}
                          {isCompleted ? (
                            <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
                          ) : isLocked ? (
                            <Lock className="h-6 w-6" />
                          ) : (
                            <div className="text-center">
                              <span className="block text-lg font-black leading-none">
                                {lvlIdx + 1}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-tight">
                                {level.cefrLevel}
                              </span>
                            </div>
                          )}

                          {/* Pulsing signal halo when in progress */}
                          {isInProgress && (
                            <span className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-ping opacity-30 pointer-events-none" />
                          )}
                        </button>

                        {/* Station Label & Mastery Badge */}
                        <div className="mt-2 text-center">
                          <span className="block text-[11px] font-extrabold text-foreground">
                            Stop {lvlIdx + 1}
                          </span>
                          <span className="block text-[9px] font-semibold text-muted-copy">
                            {level.termCount} {translate('learningpath.terms')} · +{level.xpReward}{' '}
                            XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── RAILWAY MOUNTAIN SWITCHBACK CONNECTOR (Between Stages) ── */}
              {stageIdx < path.stages.length - 1 && (
                <div
                  className={`flex items-center my-4 px-8 ${
                    isLeftToRight ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className="relative flex items-center gap-2 rounded-xl border border-dashed border-border-soft bg-surface/60 px-4 py-2 text-xs font-bold text-muted-copy"
                    style={{ transform: isRTL ? 'scaleX(-1)' : undefined }}
                  >
                    <Train className="h-4 w-4 text-primary" />
                    <span>Mountain Switchback Rail Loop ➔</span>
                    <span className="font-mono text-[10px] text-primary">
                      Ascending to {path.stages[stageIdx + 1].cefrLevel}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── SUMMIT APEX CITADEL FINALE ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-surface p-8 text-center shadow-2xl">
        <div className="relative z-10 mx-auto max-w-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/30">
            <Mountain className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            5,000m Chief Engineer Apex Citadel
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-copy sm:text-sm">
            All 10 engineering disciplines converge at the C2 Master Summit. Real international site
            leadership, technical negotiation, and cross-border engineering fluency.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
            <span className="rounded-full bg-surface border border-border-soft px-4 py-1.5 shadow-sm text-foreground">
              🏆 Verified C2 Engineer Seal
            </span>
            <span className="rounded-full bg-surface border border-border-soft px-4 py-1.5 shadow-sm text-foreground">
              ⚡ 10 Disciplines Unified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MountainRailwayPath;
