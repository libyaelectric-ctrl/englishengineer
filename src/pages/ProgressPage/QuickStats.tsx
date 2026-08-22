import {
  AlertTriangle,
  BookOpen,
  Brain,
  Clock,
  Layers,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { useCountUp } from '@/shared/hooks/useCountUp';

/** Animated numeric stat that counts up from 0 */
const AnimatedStatValue = ({ value, color }: { value: number; color: string }) => {
  const prefersReduced = useReducedMotion();
  const animated = useCountUp(value, prefersReduced ? 0 : 900);
  return <p className={`text-base font-bold ${color} tabular-nums`}>{animated}</p>;
};

export const QuickStats = ({
  totalElo,
  highestSkillLabel,
  peakElo,
  sessionsCount,
  knowledgePoolSize,
  grammarMastered,
  grammarErrors,
  advancedRules,
}: {
  totalElo: number;
  highestSkillLabel: string;
  peakElo: number;
  sessionsCount: number;
  knowledgePoolSize: number;
  grammarMastered?: number;
  grammarErrors?: number;
  advancedRules?: number;
}) => {
  const prefersReduced = useReducedMotion();
  const stats = [
    {
      icon: Target,
      label: 'Avg Elo',
      numericValue: totalElo,
      color: 'text-primary',
    },
    {
      icon: TrendingUp,
      label: 'Best',
      displayValue: highestSkillLabel,
      color: 'text-success',
    },
    { icon: Zap, label: 'Peak', numericValue: peakElo, color: 'text-warning' },
    {
      icon: Clock,
      label: 'Sessions',
      numericValue: sessionsCount,
      color: 'text-error',
    },
    {
      icon: Layers,
      label: 'Knowledge Pool',
      numericValue: knowledgePoolSize,
      color: 'text-primary',
    },
    ...(grammarMastered !== undefined
      ? [
          {
            icon: BookOpen,
            label: 'Grammar Mastered',
            numericValue: grammarMastered,
            color: 'text-emerald-600',
          },
        ]
      : []),
    {
      icon: AlertTriangle,
      label: 'Grammar Errors',
      numericValue: grammarErrors ?? 0,
      color: 'text-amber-600',
    },
    ...(advancedRules !== undefined && advancedRules > 0
      ? [
          {
            icon: Brain,
            label: 'Advanced Rules',
            numericValue: advancedRules,
            color: 'text-violet-600',
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={prefersReduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 0.3 + i * 0.08 }}
          className="rounded-[4px] border border-border-soft bg-surface p-3 shadow-sm"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <stat.icon className="h-3 w-3 text-muted-copy" />
            <span className="text-[10px] uppercase tracking-wider text-muted-copy font-bold">
              {stat.label}
            </span>
          </div>
          {'numericValue' in stat && stat.numericValue !== undefined ? (
            <AnimatedStatValue value={stat.numericValue} color={stat.color} />
          ) : (
            <p className={`text-base font-bold ${stat.color}`}>{stat.displayValue}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
};
