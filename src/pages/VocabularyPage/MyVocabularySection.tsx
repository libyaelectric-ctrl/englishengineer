import { BookMarked } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { VocabularyMenuService, MyVocabularyWord } from '@/features/vocabulary';
import { SectionCard } from '@/shared/components/SectionCard';

interface MyVocabularySectionProps {
  myVocabulary: MyVocabularyWord[];
  onUpdate: () => void;
}

const COL_COUNT = 3;

const WordCard = ({
  word,
  onArchive,
}: {
  word: MyVocabularyWord;
  onArchive: (id: string) => void;
}) => (
  <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-bold text-foreground">{word.term}</p>
        {word.turkishMeaning && (
          <p className="mt-1 text-xs text-muted-copy">{word.turkishMeaning}</p>
        )}
      </div>
      <button
        onClick={() => onArchive(word.id)}
        className="text-muted-copy hover:text-error transition-colors cursor-pointer"
        aria-label="Archive word"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      </button>
    </div>
  </div>
);

export const MyVocabularySection = ({
  myVocabulary,
  onUpdate,
}: MyVocabularySectionProps) => {
  const activeWords = myVocabulary.filter((word) => !word.archivedAt);

  const handleArchive = (id: string) => {
    VocabularyMenuService.archiveMyVocabulary(id);
    onUpdate();
  };

  const rowCount = Math.ceil(activeWords.length / COL_COUNT);

  return (
    <SectionCard
      title="My Vocabulary"
      subtitle="Custom terms saved by you"
      icon={BookMarked}
    >
      {activeWords.length === 0 ? (
        <p className="rounded-[4px] border border-dashed border-border-soft bg-surface/60 p-8 text-center text-xs text-muted-copy">
          Your custom vocabulary list is empty. Any custom terms you save will
          appear here.
        </p>
      ) : (
        <Virtuoso
          style={{ height: Math.min(rowCount * 100, 500) }}
          totalCount={rowCount}
          itemContent={(index) => {
            const startIdx = index * COL_COUNT;
            const rowWords = activeWords.slice(startIdx, startIdx + COL_COUNT);
            return (
              <div className="grid gap-4 pb-4 lg:grid-cols-2 xl:grid-cols-3">
                {rowWords.map((word) => (
                  <WordCard
                    key={word.id}
                    word={word}
                    onArchive={handleArchive}
                  />
                ))}
              </div>
            );
          }}
        />
      )}
    </SectionCard>
  );
};
