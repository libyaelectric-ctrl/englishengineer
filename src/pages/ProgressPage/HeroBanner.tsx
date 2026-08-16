import { Target } from 'lucide-react';
import { motion } from 'motion/react';
import { MAX_ELO, MIN_ELO } from '@/shared/constants/elo.constants';
import { useLocalizationStore } from '@/features/localization';
import { CEFR_LEVELS, getCEFRBand, getCEFRIndex, getRank, useAnimatedNumber } from './utils';

export const HeroBanner = ({
  totalElo,
  totalPercentage,
}: {
  totalElo: number;
  totalPercentage: number;
}) => {
  const t = useLocalizationStore((s) => s.translate);
  const animatedTotalElo = useAnimatedNumber(totalElo, 2.5);
  const totalCEFR = getCEFRBand(totalElo);
  const totalCEFRIdx = getCEFRIndex(totalCEFR);
  const rank = getRank(totalElo);
  const nextCEFR = CEFR_LEVELS[Math.min(totalCEFRIdx + 1, CEFR_LEVELS.length - 1)];
  const eloForNext = Math.floor(
    ((totalCEFRIdx + 1) / CEFR_LEVELS.length) * (MAX_ELO - MIN_ELO) + MIN_ELO
  );
  const eloNeeded = Math.max(0, eloForNext - totalElo);
  const eloMessage =
    eloNeeded > 0
      ? t('progress.eloToNext').replace('{count}', String(eloNeeded)).replace('{level}', nextCEFR)
      : t('progress.maxBand');

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-primary/25 bg-surface/80 p-5 shadow-sm">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg className="w-32 h-32 -rotate-90">
            <circle cx="64" cy="64" r="56" className="stroke-[#d9d9e3] fill-none" strokeWidth="5" />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              className="stroke-primary fill-none"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 56}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 56 * (1 - totalPercentage / 100),
              }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground tabular-nums">
              {animatedTotalElo}
            </span>
            <span className="text-[10px] text-muted-copy font-bold uppercase">{t('progress.eloCaption')}</span>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-2">
            <span
              className={`inline-flex items-center gap-1 rounded-[var(--radius-card)] border px-2.5 py-0.5 text-xs font-bold ${rank.color}`}
            >
              <rank.icon className="h-3.5 w-3.5" aria-hidden="true" /> {rank.label}
            </span>
            <span className="inline-flex items-center rounded-[var(--radius-card)] border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              CEFR {totalCEFR}
            </span>
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-card)] border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Target className="h-3 w-3" aria-hidden="true" />
              {t('progress.targetBadge')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">{t('progress.masteryTitle')}</h2>
          <p className="text-xs text-muted-copy leading-relaxed">{eloMessage}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-copy">{totalCEFR}</span>
            <div className="flex-1 h-2 rounded-full bg-border-soft overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, ((totalElo - (totalCEFRIdx * 333 + MIN_ELO)) / 333) * 100)}%`,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <span className="text-[10px] font-bold text-muted-copy">{nextCEFR}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] font-medium text-muted-copy">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {t('progress.learningVelocity')} <strong>+180 {t('progress.velocityUnit')}</strong>
              </span>
            </span>
            <span className="font-bold text-primary">{t('progress.estTarget')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
