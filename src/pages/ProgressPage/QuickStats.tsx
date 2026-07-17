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
    {
      icon: Target,
      label: 'Avg Elo',
      value: totalElo,
      color: 'text-[#0047bb]',
    },
    {
      icon: TrendingUp,
      label: 'Best',
      value: highestSkillLabel,
      color: 'text-success',
    },
    { icon: Zap, label: 'Peak', value: peakElo, color: 'text-warning' },
    {
      icon: Clock,
      label: 'Sessions',
      value: sessionsCount,
      color: 'text-error',
    },
    {
      icon: Layers,
      label: 'Knowledge Pool',
      value: knowledgePoolSize,
      color: 'text-[#0047bb]',
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
          className="rounded-[4px] border border-[#d9d9e3] bg-white p-3 shadow-sm"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <stat.icon className="h-3 w-3 text-muted-copy" />
            <span className="text-[10px] uppercase tracking-wider text-muted-copy font-bold">
              {stat.label}
            </span>
          </div>
          <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
};
