import React from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface HeartsDisplayProps {
  onRefillClick?: () => void;
  showText?: boolean;
}

export const HeartsDisplay: React.FC<HeartsDisplayProps> = ({ onRefillClick, showText = true }) => {
  const { hearts, maxHearts, refillHearts } = useGameStore();

  const handleRefill = () => {
    refillHearts();
    if (onRefillClick) onRefillClick();
  };

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1.5 border border-rose-500/20 shadow-sm">
      <Heart className={`h-5 w-5 text-rose-500 fill-rose-500 ${hearts === 0 ? 'animate-pulse' : ''}`} />
      <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
        {hearts} / {maxHearts}
      </span>
      {hearts === 0 && (
        <button
          onClick={handleRefill}
          title="Canları Doldur"
          className="ml-1 flex items-center gap-1 rounded-full bg-rose-500 text-white px-2 py-0.5 text-xs font-bold hover:bg-rose-600 transition-colors shadow"
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          {showText && <span>Yenile</span>}
        </button>
      )}
    </div>
  );
};
