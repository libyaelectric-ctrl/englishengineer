import { ChevronDown } from 'lucide-react';
import {
  repairVocabularyText,
  type VocabularyTerm,
} from '@/features/vocabulary';
import { SentencePanel } from './SentencePanel';

interface WordCardDetailsProps {
  term: VocabularyTerm;
  showDetails: boolean;
  onToggle: () => void;
}

export const WordCardDetails = ({
  term,
  showDetails,
  onToggle,
}: WordCardDetailsProps) => {
  return (
    <div className="mt-3 rounded-[4px] border border-border-soft bg-surface/60 p-3 text-xs text-muted-copy shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={showDetails}
        className="flex w-full items-center justify-between font-sans font-bold uppercase tracking-wider text-[10px] text-foreground cursor-pointer"
      >
        Word details
        <ChevronDown
          className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
        />
      </button>
      {showDetails && (
        <>
          <dl className="mt-3 grid gap-2">
            <div>
              <dt className="font-bold">Common mistakes</dt>
              <dd>{repairVocabularyText(term.commonMistakes)}</dd>
            </div>
            <div>
              <dt className="font-bold">Related terms</dt>
              <dd>{term.relatedTerms.join(', ') || 'Not specified'}</dd>
            </div>
          </dl>
          <SentencePanel
            word={term.term}
            partOfSpeech={term.partOfSpeech}
            meaning={term.turkishMeaning}
          />
        </>
      )}
    </div>
  );
};
