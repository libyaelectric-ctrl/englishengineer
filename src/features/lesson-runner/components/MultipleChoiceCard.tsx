import { Cpu } from 'lucide-react';

import { useState } from 'react';

import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

import { useLocalizationStore } from '@/features/localization';

export interface MultipleChoiceCardProps {
  term: VocabularyTerm;
  options: string[];
  onSelectOption: (selected: string) => void;
  disabled?: boolean;
}

export const MultipleChoiceCard = ({
  term,
  options,
  onSelectOption,
  disabled = false,
}: MultipleChoiceCardProps) => {
  const translate = useLocalizationStore((state) => state.translate);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (disabled) return;
    setSelected(option);
    onSelectOption(option);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center font-sans">
      <div className="flex flex-col items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
          <Cpu className="h-3 w-3 text-cyan-400" />
          {translate('lesson.card.mcTitle')}
        </span>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl drop-shadow">
          {term.term}
        </h2>
        {term.partOfSpeech && (
          <span className="rounded bg-slate-800/80 px-2 py-0.5 text-xs font-mono uppercase tracking-widest text-slate-400">
            [{term.partOfSpeech}]
          </span>
        )}
        <p className="mt-2 max-w-md text-xs font-medium text-slate-400">
          {translate('lesson.card.mcHeading')}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option, idx) => {
          const isSelected = selected === option;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option)}
              className={`group relative flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 ring-2 ring-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.02]'
                  : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white'
              } disabled:cursor-not-allowed`}
            >
              <span className="text-sm font-bold tracking-tight">{option}</span>
              <span
                className={`ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-mono font-black ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                    : 'border-slate-700 bg-slate-800 text-slate-400 group-hover:border-cyan-500 group-hover:text-cyan-300'
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
