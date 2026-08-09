import { BookMarked } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';

import { SectionCard } from '@/shared/components/SectionCard';
import { getIcon } from '@/shared/icons/registry';

import { useLocalizationStore } from '@/features/localization';
import { MyVocabularyWord, VocabularyMenuService } from '@/features/vocabulary';
import { useTermMeaningResolver } from '@/features/vocabulary/services/translation/vocabulary-translation.hook';

interface MyVocabularySectionProps {
  myVocabulary: MyVocabularyWord[];
  onUpdate: () => void;
}

const COL_COUNT = 3;

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; Icon: LucideIcon }> =
  {
    new: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      label: 'New',
      Icon: getIcon('circle') ?? BookMarked,
    },
    learned: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      label: 'Learned',
      Icon: getIcon('check-circle') ?? BookMarked,
    },
    mastered: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      label: 'Mastered',
      Icon: getIcon('star') ?? BookMarked,
    },
    struggling: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      label: 'Struggling',
      Icon: getIcon('alert-circle') ?? BookMarked,
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
  const ArchiveIcon = getIcon('archive') ?? BookMarked;
  const language = useLocalizationStore((state) => state.language);
  const resolveMeaning = useTermMeaningResolver(language);
  const meaning = resolveMeaning(word.term, { turkishMeaning: word.turkishMeaning });
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
              <s.Icon className="h-3 w-3" aria-hidden="true" />
              {s.label}
            </span>
          </div>
          {meaning && <p className="mt-1 text-xs text-muted-copy">{meaning}</p>}
        </div>
        <button
          onClick={() => onArchive(word.id)}
          className="text-muted-copy hover:text-error transition-colors cursor-pointer"
          aria-label="Archive word"
        >
          <ArchiveIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export const MyVocabularySection = ({ myVocabulary, onUpdate }: MyVocabularySectionProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  const activeWords = myVocabulary.filter((word) => !word.archivedAt);

  const handleArchive = (id: string) => {
    VocabularyMenuService.archiveMyVocabulary(id);
    onUpdate();
  };

  const rowCount = Math.ceil(activeWords.length / COL_COUNT);

  return (
    <SectionCard
      title={translate('vocabulary.myVocabulary')}
      subtitle={translate('vocabulary.myVocabularyDesc')}
      icon={BookMarked}
    >
      {activeWords.length === 0 ? (
        <p className="rounded-[4px] border border-dashed border-border-soft bg-surface/60 p-8 text-center text-xs text-muted-copy">
          {translate('vocabulary.myVocabularyEmpty')}
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
                  <WordCard key={word.id} word={word} onArchive={handleArchive} />
                ))}
              </div>
            );
          }}
        />
      )}
    </SectionCard>
  );
};
