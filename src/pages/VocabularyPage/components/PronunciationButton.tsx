import { Loader2, Volume2 } from 'lucide-react';

import { useState } from 'react';

import { logger } from '@/shared/logger';

import { PronunciationService } from '@/features/vocabulary';

interface PronunciationButtonProps {
  word: string;
  className?: string;
}

export function PronunciationButton({ word, className = '' }: PronunciationButtonProps) {
  const [playing, setPlaying] = useState(false);
  const phonetic = PronunciationService.getPhonetic(word);

  const handlePronounce = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      await PronunciationService.speak(word);
    } catch (e) {
      logger.w('[PRONUNCIATION] TTS failed', e);
    } finally {
      setPlaying(false);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handlePronounce}
        disabled={playing}
        className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-border-soft bg-surface text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer disabled:opacity-50"
        aria-label={`Pronounce ${word}`}
      >
        {playing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
      </button>
      {phonetic && <span className="text-[10px] font-mono text-muted-copy">{phonetic}</span>}
    </div>
  );
}
