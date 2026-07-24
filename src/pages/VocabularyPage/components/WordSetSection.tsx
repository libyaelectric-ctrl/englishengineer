import { motion, AnimatePresence } from 'motion/react';
import { BookMarked, ArrowRight } from 'lucide-react';
import type {
  VocabularyTerm,
  VocabularyMenuStatus,
  VocabularyMenuState,
} from '@/features/vocabulary';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { WordCard } from './WordCard';
import { LearnedCard } from './LearnedCard';
import { TAB_LABELS } from './VocabularyHeader';

interface WordSetSectionProps {
  activeTab: VocabularyMenuStatus;
  vocabularyProfile: { cefrBand: string };
  loadError: string | null;
  terms: VocabularyTerm[];
  wordSet: VocabularyTerm[];
  mode: 'Quiz' | 'Review' | 'View';
  menuState: VocabularyMenuState;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
  onLearn: (term: VocabularyTerm) => void;
  onExportCSV: () => void;
  onLoadNextBatch: () => void;
}

export function WordSetSection({
  activeTab,
  vocabularyProfile,
  loadError,
  terms,
  wordSet,
  mode,
  menuState,
  onReview,
  onLearn,
  onExportCSV,
  onLoadNextBatch,
}: WordSetSectionProps) {
  return (
    <SectionCard
      title={`${TAB_LABELS[activeTab]} 15-word set`}
      subtitle={`CEFR: ${vocabularyProfile.cefrBand}`}
      icon={BookMarked}
      headerActions={null}
    >
      {loadError && (
        <p className="rounded-[4px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {loadError}
        </p>
      )}
      {!loadError && terms.length === 0 && (
        <p className="text-sm text-foreground0">Loading canonical words...</p>
      )}
      {terms.length > 0 && wordSet.length === 0 && (
        <p className="rounded-[4px] border border-dashed border-border-soft bg-surface/60 p-8 text-center text-sm text-muted-copy">
          No words currently have {activeTab.toLowerCase()} status. Select New
          to begin a ten-word set.
        </p>
      )}
      {wordSet.length > 0 && (
        <div className="space-y-5">
          <div className={`grid gap-4 ${activeTab === 'Learned' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6' : 'lg:grid-cols-2 xl:grid-cols-3'}`}>
            <AnimatePresence mode="popLayout">
              {wordSet.map((term, index) => (
                <motion.div
                  key={term.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'Learned' ? (
                    <LearnedCard term={term} index={index} />
                  ) : (
                    <WordCard
                      term={term}
                      progress={menuState.progress[term.id]}
                      mode={mode}
                      onReview={onReview}
                      onLearn={onLearn}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex justify-end border-t border-border-soft pt-4 gap-2">
            {wordSet.length > 0 && (
              <Button
                variant="outline"
                className="rounded-[4px]"
                onClick={onExportCSV}
              >
                Export as CSV
              </Button>
            )}
            <Button
              variant="primary"
              className="rounded-[4px] gap-1.5"
              onClick={onLoadNextBatch}
            >
              Next 15-word batch
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
