import { Flame, TrendingUp, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

import { useLearningStore } from '@/core/learning/learning.store';

export function ProgressVisualizer() {
  const xp = useLearningStore((s) => s.xp);
  const streak = useLearningStore((s) => s.streak);
  const level = useLearningStore((s) => s.level);
  const coins = useLearningStore((s) => s.coins);

  return (
    <div className="flex items-center gap-4 bg-card border rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-amber-500">
        <Flame size={18} />
        <span className="font-bold text-sm">{streak}</span>
        <span className="text-xs text-muted-foreground">Streak</span>
      </div>
      <div className="w-px h-6 bg-border-soft" />
      <div className="flex items-center gap-2 text-emerald-500">
        <TrendingUp size={18} />
        <motion.span
          key={xp}
          initial={{ scale: 1.3, color: '#16a34a' }}
          animate={{ scale: 1, color: 'inherit' }}
          transition={{ duration: 0.3 }}
          className="font-bold text-sm"
        >
          {xp}
        </motion.span>
        <span className="text-xs text-muted-foreground">XP</span>
      </div>
      <div className="w-px h-6 bg-border-soft" />
      <div className="flex items-center gap-2 text-violet-500">
        <Trophy size={18} />
        <span className="font-bold text-sm">{level}</span>
        <span className="text-xs text-muted-foreground">Seviye</span>
      </div>
      <div className="w-px h-6 bg-border-soft" />
      <div className="text-xs text-yellow-500 font-semibold">{coins} 🪙</div>
    </div>
  );
}
