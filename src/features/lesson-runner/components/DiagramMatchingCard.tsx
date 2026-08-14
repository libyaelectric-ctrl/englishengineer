import { useState } from 'react';

import { Cpu } from 'lucide-react';

import { useLocalizationStore } from '@/features/localization';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

export interface DiagramMatchingCardProps {
  term: VocabularyTerm;
  options: string[];
  onSelectOption: (selected: string) => void;
  disabled?: boolean;
}

export const DiagramMatchingCard = ({
  term,
  options,
  onSelectOption,
  disabled = false,
}: DiagramMatchingCardProps) => {
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
        <span className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-400 border border-purple-500/20">
          <Cpu className="h-3.5 w-3.5" />
          {translate('lesson.card.diagramTitle')}
        </span>
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
          {translate('lesson.card.diagramHeading')}
        </h2>
      </div>

      <div className="flex w-full flex-col items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-950/20 p-6 backdrop-blur">
        <span className="font-mono text-xs uppercase tracking-widest text-purple-400">
          {translate('lesson.card.diagramSpecItem')}
        </span>
        <span className="text-3xl font-black tracking-tight text-purple-200">{term.term}</span>
        {term.definition && (
          <p className="mt-2 max-w-md text-xs italic text-purple-300/80">"{term.definition}"</p>
        )}
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
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-purple-400 bg-purple-500/20 text-purple-200 ring-2 ring-purple-400/50 font-bold'
                  : 'border-[var(--color-border-soft)] bg-[var(--surface)] text-[var(--foreground)] hover:border-purple-400/50 hover:bg-purple-500/5'
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