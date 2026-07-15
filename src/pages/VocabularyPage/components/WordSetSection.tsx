import { motion, AnimatePresence } from 'motion/react';
import { BookMarked } from 'lucide-react';
import type {
  VocabularyTerm,
  VocabularyMenuStatus,
  VocabularyMenuState,
  VocabularySearchFilters,
} from '@/features/vocabulary';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { WordCard } from './WordCard';
import { TAB_LABELS } from './VocabularyHeader';

interface WordSetSectionProps {
  activeTab: VocabularyMenuStatus;
  vocabularyProfile: { cefrBand: string };
  learningDomain: string;
  filterOptions: (field: keyof VocabularySearchFilters) => string[];
  loadError: string | null;
  terms: VocabularyTerm[];
  wordSet: VocabularyTerm[];
  mode: 'Quiz' | 'Review' | 'View';
  menuState: VocabularyMenuState;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
  onLearn: (term: VocabularyTerm) => void;
  onDomainChange: (domain: string) => void;
  onExportCSV: () => void;
  onLoadNextBatch: () => void;
}

export function WordSetSection({
  activeTab,
  vocabularyProfile,
  learningDomain,
  filterOptions,
  loadError,
  terms,
  wordSet,
  mode,
  menuState,
  onReview,
  onLearn,
  onDomainChange,
  onExportCSV,
  onLoadNextBatch,
}: WordSetSectionProps) {
  return (
    <SectionCard
      title={`${TAB_LABELS[activeTab]} 9-word set`}
      subtitle={`Selected by ${vocabularyProfile.cefrBand}, vocabulary skill use, memory state, and canonical order`}
      icon={BookMarked}
      headerActions={
        <div className="flex flex-wrap items-center gap-1">
          <select
            aria-label="Learning set domain"
            value={learningDomain}
            onChange={(event) => onDomainChange(event.target.value)}
            className="min-h-8 rounded-lg border border-border-soft bg-surface px-2 text-xs font-semibold text-foreground"
          >
            {filterOptions('domain').map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      }
    >
      {loadError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {loadError}
        </p>
      )}
      {!loadError && terms.length === 0 && (
        <p className="text-sm text-foreground0">Loading canonical words...</p>
      )}
      {terms.length > 0 && wordSet.length === 0 && (
        <p className="rounded-xl border border-dashed border-border-soft bg-surface-hover p-8 text-center text-sm text-muted-copy">
          No words currently have {activeTab.toLowerCase()} status. Select New
          to begin a ten-word set.
        </p>
      )}
      {wordSet.length > 0 && (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {wordSet.map((term) => (
                <motion.div
                  key={term.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <WordCard
                    term={term}
                    progress={menuState.progress[term.id]}
                    mode={mode}
                    onReview={onReview}
                    onLearn={onLearn}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex justify-end border-t border-border-soft pt-4 gap-2">
            {wordSet.length > 0 && (
              <Button variant="outline" onClick={onExportCSV}>
                Export as CSV
              </Button>
            )}
            <Button variant="outline" onClick={onLoadNextBatch}>
              Next 9-word batch
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
