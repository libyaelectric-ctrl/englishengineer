import { Heart } from 'lucide-react';

import { MAX_HEARTS } from '@/core/learning/learning.hearts';

interface HeartsDisplayProps {
  hearts: number;
  /** Milliseconds until hearts refill, or 0 if not depleted. */
  msUntilRefill?: number;
}

const formatCountdown = (ms: number): string => {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}s ${minutes}dk` : `${minutes}dk`;
};

export const HeartsDisplay = ({ hearts, msUntilRefill = 0 }: HeartsDisplayProps) => {
  const isOutOfHearts = hearts <= 0;

  return (
    <div
      className="flex items-center gap-1.5"
      role="status"
      aria-label={`${hearts} / ${MAX_HEARTS} can`}
    >
      {Array.from({ length: MAX_HEARTS }, (_, i) => (
        <Heart
          key={i}
          className={
            i < hearts
              ? 'h-5 w-5 fill-rose-500 text-rose-500'
              : 'h-5 w-5 fill-transparent text-muted-copy/30'
          }
        />
      ))}
      {isOutOfHearts && msUntilRefill > 0 && (
        <span className="ml-1 text-[11px] font-semibold text-muted-copy">
          {formatCountdown(msUntilRefill)}
        </span>
      )}
    </div>
  );
};
