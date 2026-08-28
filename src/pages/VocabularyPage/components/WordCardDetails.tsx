import { ChevronDown } from 'lucide-react';
import { Volume2 } from 'lucide-react';

import { useLearningLanguage } from '@/features/profile/use-learning-language';
import {
  PronunciationService,
  type VocabularyTerm,
  repairVocabularyText,
} from '@/features/vocabulary';
import { useTermMeaningResolver } from '@/features/vocabulary/services/translation/vocabulary-translation.hook';

import { SentencePanel } from './SentencePanel';

interface WordCardDetailsProps {
  term: VocabularyTerm;
  showDetails: boolean;
  onToggle: () => void;
}

export const WordCardDetails = ({ term, showDetails, onToggle }: WordCardDetailsProps) => {
  const resolveMeaning = useTermMeaningResolver(useLearningLanguage());
  const meaning = resolveMeaning(term.term, term);

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
          {/* Meaning in selected language */}
          <div className="mt-4 mb-3 flex items-center justify-between">
            <p className="text-xl font-bold text-foreground">{repairVocabularyText(meaning)}</p>
            <button
              type="button"
              onClick={() => PronunciationService.speak(meaning)}
              className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-border-soft bg-surface text-muted-copy hover:bg-surface-hover hover:text-foreground cursor-pointer"
              aria-label="Listen to translation"
              title="Listen to translation"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          {/* Common mistakes and related terms */}
          <dl className="grid gap-2">
            <div>
              <dt className="font-bold">Common mistakes</dt>
              <dd>{repairVocabularyText(term.commonMistakes)}</dd>
            </div>
            <div>
              <dt className="font-bold">Related terms</dt>
              <dd>{term.relatedTerms.join(', ') || 'Not specified'}</dd>
            </div>
          </dl>

          {/* Example sentences */}
          <SentencePanel word={term.term} partOfSpeech={term.partOfSpeech} meaning={meaning} />
        </>
      )}
    </div>
  );
};
