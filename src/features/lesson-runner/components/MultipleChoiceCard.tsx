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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-primary shadow-card">
          <Cpu className="h-3 w-3 text-primary" />
          {translate('lesson.card.mcTitle')}
        </span>
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {term.term}
        </h2>
        {term.partOfSpeech && (
          <span className="rounded bg-surface-hover px-2 py-0.5 text-xs font-mono uppercase tracking-widest text-muted-copy">
            [{term.partOfSpeech}]
          </span>
        )}
        <p className="mt-2 max-w-md text-xs font-medium text-muted-copy">
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
                  ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/60 shadow-pop scale-[1.02]'
                  : 'border-border-soft bg-surface text-foreground hover:border-primary/50 hover:bg-surface-hover'
              } disabled:cursor-not-allowed`}
            >
              <span className="text-sm font-bold tracking-tight">{option}</span>
              <span
                className={`ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-mono font-black ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border-soft bg-surface-hover text-muted-copy group-hover:border-primary group-hover:text-primary'
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
