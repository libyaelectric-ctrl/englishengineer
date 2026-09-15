import { FileText } from 'lucide-react';

import { useState } from 'react';

import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

import { useLocalizationStore } from '@/features/localization';

export interface RfiFillBlankCardProps {
  term: VocabularyTerm;
  options: string[];
  onSelectOption: (selected: string) => void;
  disabled?: boolean;
}

export const RfiFillBlankCard = ({
  term,
  options,
  onSelectOption,
  disabled = false,
}: RfiFillBlankCardProps) => {
  const translate = useLocalizationStore((state) => state.translate);
  const [selected, setSelected] = useState<string | null>(null);

  const rawExample = term.exampleSentence || term.definition || term.term;
  const escapedTerm = term.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = rawExample.split(new RegExp(`(${escapedTerm})`, 'gi'));

  const handleSelect = (option: string) => {
    if (disabled) return;
    setSelected(option);
    onSelectOption(option);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center font-sans">
      <div className="flex flex-col items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20">
          <FileText className="h-3.5 w-3.5" />
          {translate('lesson.card.rfiTitle')}
        </span>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {translate('lesson.card.rfiHeading')}
        </h2>
      </div>

      <div className="w-full rounded-2xl border border-primary/30 bg-surface p-6 text-left shadow-card backdrop-blur">
        <div className="mb-3 flex items-center justify-between border-b border-primary/20 pb-2 text-[10px] uppercase tracking-widest text-primary/80 font-mono">
          <span>{translate('lesson.card.rfiSheetId')}</span>
          <span>{translate('lesson.card.rfiSheetField')}</span>
        </div>
        <p className="text-base leading-relaxed text-foreground font-medium">
          {parts.map((part, idx) => {
            if (part.toLowerCase() === term.term.toLowerCase()) {
              return (
                <span
                  key={idx}
                  className="inline-block min-w-[5rem] rounded border border-dashed border-primary bg-primary/20 px-3 py-1 text-center font-extrabold text-primary shadow-inner"
                >
                  {selected || '________'}
                </span>
              );
            }
            return part;
          })}
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
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/20 text-primary ring-2 ring-primary/50 font-bold'
                  : 'border-border-soft bg-surface text-foreground hover:border-primary/50 hover:bg-primary/5'
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
