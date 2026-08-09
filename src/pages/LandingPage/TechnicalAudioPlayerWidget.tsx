import { Play, Volume2 } from 'lucide-react';

import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';

const AUDIO_SAMPLE_TERMS = [
  { term: 'Extension of Time (EOT)', accent: 'UK (RP)', category: 'FIDIC Cl. 8.4' },
  { term: 'Reinforced Concrete Slump', accent: 'US (GenAm)', category: 'ASTM C143' },
  { term: 'HVAC Static Pressure Loss', accent: 'UK (RP)', category: 'ASHRAE 90.1' },
];

export const TechnicalAudioPlayerWidget = () => {
  const translate = useLocalizationStore((s) => s.translate);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (idx: number) => {
    setActiveIdx(idx);
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-primary/25 bg-surface/90 backdrop-blur-md p-4 shadow-xl space-y-3 relative light-sweep-container overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
          <Volume2 className="h-4 w-4 text-primary animate-pulse" />{' '}
          {translate('landing.audioPlayerTitle')}
        </span>
        <span className="text-[10px] font-bold text-muted-copy">
          {translate('landing.audioPlayerSubtitle')}
        </span>
      </div>

      <div className="space-y-2">
        {AUDIO_SAMPLE_TERMS.map((t, idx) => (
          <div
            key={t.term}
            role="button"
            tabIndex={0}
            onClick={() => handlePlay(idx)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.currentTarget.click();
              }
            }}
            className={`flex items-center justify-between rounded-[var(--radius-card)] border p-2.5 transition cursor-pointer ${
              activeIdx === idx && isPlaying
                ? 'border-emerald-500/40 bg-emerald-500/10 shadow-sm'
                : 'border-border-soft bg-background/80 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Play"
                className={`flex h-7 w-7 items-center justify-center rounded-[var(--radius-card)] transition ${
                  activeIdx === idx && isPlaying
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
              <div>
                <div className="text-xs font-bold text-foreground">{t.term}</div>
                <div className="text-[9px] text-muted-copy font-mono">{t.category}</div>
              </div>
            </div>
            <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary font-mono">
              {t.accent}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
