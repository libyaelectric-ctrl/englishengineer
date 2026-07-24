import { Volume2 } from 'lucide-react';
import {
  repairVocabularyText,
  PronunciationService,
  type VocabularyMenuProgress,
  type VocabularyTerm,
} from '@/features/vocabulary';

interface WordCardHeaderProps {
  term: VocabularyTerm;
  showAnswer: boolean;
  status: string;
  progress?: VocabularyMenuProgress;
}

export const WordCardHeader = ({
  term,
  showAnswer,
  status,
}: WordCardHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 className="text-xl font-bold text-foreground">
        {repairVocabularyText(term.term)}
      </h3>
      {showAnswer && (
        <p className="mt-1 font-bold text-[#0047bb]">
          {repairVocabularyText(term.turkishMeaning)}
        </p>
      )}
    </div>
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <span className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 px-2 py-0.5 text-[9px] font-bold text-[#0047bb] uppercase tracking-wider">
        LVL-<span>{term.cefrLevel}</span>
      </span>
      {status !== 'new' && (
        <span className="rounded-[4px] border border-border-soft bg-[#f3f3fd] px-2 py-0.5 text-[9px] font-bold text-muted-copy uppercase tracking-wider">
          {status}
        </span>
      )}
      <button
        type="button"
        onClick={() => PronunciationService.speak(term.term)}
        className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-border-soft bg-surface text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer"
        aria-label={`Listen to ${term.term}`}
        title="Listen to pronunciation"
      >
        <Volume2 className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
);
