import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

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
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
          {translate('lesson.card.mcTitle')}
        </span>
        <h2 className="text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
          {term.term}
        </h2>
        {term.partOfSpeech && (
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-copy)]">
            [{term.partOfSpeech}]
          </span>
        )}
        <p className="mt-2 max-w-md text-sm text-[var(--color-muted-copy)]">
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
              className={`group relative flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300 ring-2 ring-amber-500/50'
                  : 'border-[var(--color-border-soft)] bg-[var(--surface)] text-[var(--foreground)] hover:border-amber-500/50 hover:bg-amber-500/5'
              } disabled:cursor-not-allowed`}
            >
              <span className="text-sm font-semibold">{option}</span>
              <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-current/20 text-xs font-mono font-bold opacity-60">
                {String.fromCharCode(65 + idx)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};