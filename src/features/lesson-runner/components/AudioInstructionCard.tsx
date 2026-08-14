import { useState } from 'react';

import { Radio, Volume2 } from 'lucide-react';

import { useLocalizationStore } from '@/features/localization';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

export interface AudioInstructionCardProps {
  term: VocabularyTerm;
  options: string[];
  onSelectOption: (selected: string) => void;
  disabled?: boolean;
}

export const AudioInstructionCard = ({
  term,
  options,
  onSelectOption,
  disabled = false,
}: AudioInstructionCardProps) => {
  const translate = useLocalizationStore((state) => state.translate);
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const speakTerm = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term.term);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelect = (option: string) => {
    if (disabled) return;
    setSelected(option);
    onSelectOption(option);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center font-sans">
      <div className="flex flex-col items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
          <Radio className="h-3.5 w-3.5" />
          {translate('lesson.card.audioTitle')}
        </span>
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
          {translate('lesson.card.audioHeading')}
        </h2>
      </div>

      <button
        type="button"
        onClick={speakTerm}
        aria-label={translate('lesson.card.audioPlay')}
        className={`group relative flex h-24 w-24 items-center justify-center rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 ${
          playing
            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-4 ring-emerald-500/30'
            : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-900/50'
        }`}
      >
        <Volume2 className={`h-10 w-10 ${playing ? 'animate-bounce' : ''}`} />
      </button>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option, idx) => {
          const isSelected = selected === option;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option)}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-400/50 font-bold'
                  : 'border-[var(--color-border-soft)] bg-[var(--surface)] text-[var(--foreground)] hover:border-emerald-400/50 hover:bg-emerald-500/5'
              } disabled:cursor-not-allowed`}
            >
              <span className="text-sm font-semibold">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};