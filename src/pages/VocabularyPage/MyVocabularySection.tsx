import { BookMarked } from 'lucide-react';
import { VocabularyMenuService, MyVocabularyWord } from '@/features/vocabulary';
import { SectionCard } from '@/shared/components/SectionCard';

interface MyVocabularySectionProps {
  myVocabulary: MyVocabularyWord[];
  onUpdate: () => void;
}

export const MyVocabularySection = ({
  myVocabulary,
  onUpdate,
}: MyVocabularySectionProps) => {
  const activeWords = myVocabulary.filter((word) => !word.archivedAt);

  return (
    <SectionCard
      title="My Vocabulary"
      subtitle={`5,000 canonical + ${activeWords.length} active custom word(s)`}
      icon={BookMarked}
    >
      <p className="mb-4 text-xs font-bold text-foreground0">
        Manual add only · AI Assist Coming Soon
      </p>
      {activeWords.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-soft bg-surface-hover p-8 text-center text-sm text-muted-copy">
          Search for a missing term to add it manually. AI Assist is coming
          soon.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {activeWords.map((word) => (
            <div
              key={word.id}
              className="rounded-xl border border-border-soft bg-surface p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{word.term}</p>
                  {word.turkishMeaning && (
                    <p className="mt-1 text-xs text-muted-copy">{word.turkishMeaning}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    VocabularyMenuService.archiveMyVocabulary(word.id);
                    onUpdate();
                  }}
                  className="text-muted-copy hover:text-error transition-colors"
                  aria-label="Archive word"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};
