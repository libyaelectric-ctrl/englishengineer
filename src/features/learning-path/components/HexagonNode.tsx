import { Lock } from 'lucide-react';

import { STATUS_COLORS } from '../discipline-palette';
import type { PathLevel } from '../learning-path.types';

export interface HexagonNodeProps {
  level: PathLevel;
  onSelect: (levelId: string) => void;
}

const HEXAGON_PATH = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

/** Engineering-drawing style hexagon node for a single path level. */
export const HexagonNode = ({ level, onSelect }: HexagonNodeProps) => {
  const locked = level.status === 'locked';
  const color = STATUS_COLORS[level.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(level.id)}
      disabled={locked}
      aria-label={`${level.cefrLevel} ${level.index + 1} — ${level.termCount} terms (${level.status})`}
      title={`${level.cefrLevel} ${level.index + 1} — ${level.termCount} terms (${level.status})`}
      className="group relative flex h-14 w-14 items-center justify-center transition-transform hover:scale-110 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
      style={{
        clipPath: HEXAGON_PATH,
        backgroundColor: color,
        filter: locked ? 'grayscale(0.6)' : undefined,
      }}
    >
      {locked ? (
        <Lock className="h-5 w-5 text-white/80" />
      ) : (
        <span className="text-lg font-extrabold text-white drop-shadow-sm">
          {level.index + 1}
        </span>
      )}
      {level.masteryRatio > 0 && level.status !== 'completed' && (
        <span className="absolute inset-x-2 top-1 h-0.5 rounded-full bg-white/70" />
      )}
    </button>
  );
};