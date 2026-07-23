import { motion } from 'motion/react';
import {
  CEFR_LEVELS,
  MIN_ELO,
  MAX_ELO,
  getCEFRBand,
  getCEFRIndex,
  getRank,
  useAnimatedNumber,
} from './utils';

export const HeroBanner = ({
  totalElo,
  totalPercentage,
}: {
  totalElo: number;
  totalPercentage: number;
}) => {
  const animatedTotalElo = useAnimatedNumber(totalElo, 2.5);
  const totalCEFR = getCEFRBand(totalElo);
  const totalCEFRIdx = getCEFRIndex(totalCEFR);
  const rank = getRank(totalElo);
  const nextCEFR =
    CEFR_LEVELS[Math.min(totalCEFRIdx + 1, CEFR_LEVELS.length - 1)];
  const eloForNext = Math.floor(
    ((totalCEFRIdx + 1) / CEFR_LEVELS.length) * (MAX_ELO - MIN_ELO) + MIN_ELO
  );
  const eloNeeded = Math.max(0, eloForNext - totalElo);

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#0047bb]/25 bg-surface/80 p-5 shadow-sm">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-[#0047bb]/5 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg className="w-32 h-32 -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              className="stroke-[#d9d9e3] fill-none"
              strokeWidth="5"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              className="stroke-[#0047bb] fill-none"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 56}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{
                strokeDashoffset:
                  2 * Math.PI * 56 * (1 - totalPercentage / 100),
              }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground tabular-nums">
              {animatedTotalElo}
            </span>
            <span className="text-[10px] text-muted-copy font-bold uppercase">
              / 5000 ELO
            </span>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-2">
            <span
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-bold ${rank.color}`}
            >
              {rank.icon} {rank.label}
            </span>
            <span className="inline-flex items-center rounded-lg border border-[#0047bb]/25 bg-[#0047bb]/10 px-2.5 py-0.5 text-xs font-bold text-[#0047bb]">
              CEFR {totalCEFR}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              🎯 Target: C1 Senior Tech Lead / Offshore Pitch Ready
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            Engineering Mastery Level
          </h2>
          <p className="text-xs text-muted-copy leading-relaxed">
            {eloNeeded > 0
              ? `${eloNeeded} more Elo to reach ${nextCEFR}. Keep practicing!`
              : `Highest CEFR band reached. Maintain your excellence!`}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-copy">
              {totalCEFR}
            </span>
            <div className="flex-1 h-2 rounded-full bg-border-soft overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, ((totalElo - (totalCEFRIdx * 333 + MIN_ELO)) / 333) * 100)}%`,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-[#0047bb]"
              />
            </div>
            <span className="text-[10px] font-bold text-muted-copy">
              {nextCEFR}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] font-medium text-muted-copy">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Learning Velocity: <strong>+180 ELO/week</strong>
              </span>
            </span>
            <span className="font-bold text-[#0047bb]">
              ⏱️ Est. ~3.8 weeks to C1 Target
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
