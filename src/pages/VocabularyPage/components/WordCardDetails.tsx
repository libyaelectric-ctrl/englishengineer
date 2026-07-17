import { ChevronDown } from 'lucide-react';
import { repairVocabularyText, type VocabularyTerm } from '@/features/vocabulary';

interface WordCardDetailsProps {
  term: VocabularyTerm;
  showDetails: boolean;
  onToggle: () => void;
}

export const WordCardDetails = ({ term, showDetails, onToggle }: WordCardDetailsProps) => (
  <div className="mt-3 rounded-lg border border-border-soft bg-surface-hover p-3 text-xs text-muted-copy">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={showDetails}
      className="flex w-full items-center justify-between font-bold text-foreground"
    >
      Word details
      <ChevronDown
        className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
      />
    </button>
    {showDetails && (
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="font-bold">Part of speech</dt>
          <dd>{term.partOfSpeech}</dd>
        </div>
        <div>
          <dt className="font-bold">Content domain</dt>
          <dd>{term.contentDomain}</dd>
        </div>
        <div>
          <dt className="font-bold">Life context</dt>
          <dd>{term.lifeContext}</dd>
        </div>
        <div>
          <dt className="font-bold">Register</dt>
          <dd>{term.register}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-bold">Primary use case</dt>
          <dd>{term.primaryUseCase}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-bold">Grammar fits</dt>
          <dd>{term.grammarFits.join(', ') || 'Not specified'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-bold">Skill use</dt>
          <dd>{term.skillUse.join(', ')}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-bold">Common mistakes</dt>
          <dd>{repairVocabularyText(term.commonMistakes)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-bold">Related terms</dt>
          <dd>{term.relatedTerms.join(', ') || 'Not specified'}</dd>
        </div>
      </dl>
    )}
  </div>
);
