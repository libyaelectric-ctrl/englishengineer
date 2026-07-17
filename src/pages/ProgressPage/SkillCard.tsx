import { motion } from 'motion/react';
import {
  CEFR_LEVELS,
  MAX_ELO,
  getCEFRBand,
  getCEFRIndex,
  useAnimatedNumber,
} from './utils';

export const SkillCard = ({
  skill,
  elo,
  index,
}: {
  skill: (typeof import('./utils').SKILLS)[0];
  elo: number;
  index: number;
}) => {
  const displayElo = useAnimatedNumber(elo, 2);
  const percentage = Math.min(100, (elo / MAX_ELO) * 100);
  const cefr = getCEFRBand(elo);
  const Icon = skill.icon;
  const cefrIdx = getCEFRIndex(cefr);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group rounded-[4px] border border-[#d9d9e3] bg-white p-4 hover:border-[#0047bb]/30 transition-all shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#d9d9e3] ${skill.bgLight} ${skill.textDark}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">{skill.label}</h4>
            <p className="text-[10px] text-muted-copy font-bold mt-0.5 uppercase tracking-wider">
              {cefr}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-foreground tabular-nums">
            {displayElo}
          </div>
        </div>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-[4px] bg-[#d9d9e3]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1.5,
            delay: index * 0.08 + 0.2,
            ease: 'easeOut',
          }}
          className="absolute inset-y-0 left-0 bg-[#0047bb] rounded-[4px]"
        />
      </div>
      <div className="flex gap-0.5 mt-2">
        {CEFR_LEVELS.map((level, i) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-[4px] transition-colors duration-300 ${
              i <= cefrIdx ? 'bg-[#0047bb]' : 'bg-[#d9d9e3]'
            }`}
            title={level}
          />
        ))}
      </div>
    </motion.div>
  );
};
