import {
  repairVocabularyText,
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
  progress,
}: WordCardHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 className="text-xl font-black text-foreground">
        {repairVocabularyText(term.term)}
      </h3>
      {showAnswer && (
        <p className="mt-1 font-semibold text-primary">
          {repairVocabularyText(term.turkishMeaning)}
        </p>
      )}
    </div>
    <div className="flex flex-wrap justify-end gap-1.5">
      <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-bold text-primary">
        {term.cefrLevel}
      </span>
      <span className="rounded-full border border-border-soft bg-surface-hover px-2 py-1 text-[10px] font-bold text-muted-copy">
        {status}
      </span>
      {progress?.isWeak && (
        <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">
          Weak
        </span>
      )}
      {progress?.isForgotten && (
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
          Forgotten
        </span>
      )}
    </div>
  </div>
);
