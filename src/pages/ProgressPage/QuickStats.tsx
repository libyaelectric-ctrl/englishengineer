import { motion } from 'motion/react';
import { Target, TrendingUp, Zap, Clock, Layers } from 'lucide-react';

export const QuickStats = ({
  totalElo,
  highestSkillLabel,
  peakElo,
  sessionsCount,
  knowledgePoolSize,
}: {
  totalElo: number;
  highestSkillLabel: string;
  peakElo: number;
  sessionsCount: number;
  knowledgePoolSize: number;
}) => {
  const stats = [
    { icon: Target, label: 'Avg Elo', value: totalElo, color: 'text-primary' },
    {
      icon: TrendingUp,
      label: 'Best',
      value: highestSkillLabel,
      color: 'text-emerald-600',
    },
    { icon: Zap, label: 'Peak', value: peakElo, color: 'text-amber-600' },
    {
      icon: Clock,
      label: 'Sessions',
      value: sessionsCount,
      color: 'text-rose-600',
    },
    {
      icon: Layers,
      label: 'Knowledge Pool',
      value: knowledgePoolSize,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08 }}
          className="rounded-xl border border-border-soft bg-surface p-3 shadow-sm"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <stat.icon className="h-3 w-3 text-muted-copy" />
            <span className="text-[10px] uppercase tracking-wider text-muted-copy font-semibold">
              {stat.label}
            </span>
          </div>
          <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
};
