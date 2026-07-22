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
      <h3 className="text-xl font-bold text-foreground">
        {repairVocabularyText(term.term)}
      </h3>
      <p className="text-[10px] text-muted-copy uppercase tracking-wider font-mono font-semibold">
        Domain: {term.domain}
      </p>
      {showAnswer && (
        <p className="mt-1 font-bold text-[#0047bb]">
          {repairVocabularyText(term.turkishMeaning)}
        </p>
      )}
    </div>
    <div className="flex flex-wrap justify-end gap-1.5">
      <span className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 px-2 py-0.5 text-[9px] font-bold text-[#0047bb] uppercase tracking-wider">
        LVL-<span>{term.cefrLevel}</span>
      </span>
      <span className="rounded-[4px] border border-border-soft bg-[#f3f3fd] px-2 py-0.5 text-[9px] font-bold text-muted-copy uppercase tracking-wider">
        {status}
      </span>
      {progress?.isWeak && (
        <span className="rounded-[4px] border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700 uppercase tracking-wider">
          Weak
        </span>
      )}
      {progress?.isForgotten && (
        <span className="rounded-[4px] border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wider">
          Forgotten
        </span>
      )}
    </div>
  </div>
);
