import { BookMarked } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { VocabularyMenuService, MyVocabularyWord } from '@/features/vocabulary';
import { SectionCard } from '@/shared/components/SectionCard';

interface MyVocabularySectionProps {
  myVocabulary: MyVocabularyWord[];
  onUpdate: () => void;
}

const COL_COUNT = 3;

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string; emoji: string }
> = {
  new: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    label: 'New',
    emoji: '',
  },
  learned: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    label: 'Learned',
    emoji: '',
  },
  mastered: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    label: 'Mastered',
    emoji: '⭐',
  },
  struggling: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    label: 'Struggling',
    emoji: '🔴',
  },
};

const WordCard = ({
  word,
  status,
  onArchive,
}: {
  word: MyVocabularyWord;
  status?: string;
  onArchive: (id: string) => void;
}) => {
  const s = STATUS_STYLES[status || 'new'] || STATUS_STYLES.new;
  return (
    <div
      className={`rounded-[4px] border p-4 shadow-sm hover:shadow-md transition-all duration-300 ${status === 'struggling' ? 'border-red-300 dark:border-red-700' : 'border-border-soft bg-surface'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">{word.term}</p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${s.bg} ${s.text}`}
            >
              {s.emoji} {s.label}
            </span>
          </div>
          {word.turkishMeaning && (
            <p className="mt-1 text-xs text-muted-copy">
              {word.turkishMeaning}
            </p>
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
};

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
