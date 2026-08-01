import { ArrowRight, BookMarked } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { useCallback, useEffect, useRef, useState } from 'react';

import { playSound } from '@/shared/utils/sound';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';

import type {
  VocabularyMenuState,
  VocabularyMenuStatus,
  VocabularyTerm,
} from '@/features/vocabulary';

import { LearnedCard } from './LearnedCard';
import { TAB_LABELS } from './VocabularyHeader';
import { WordCard } from './WordCard';

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
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleFlipCard = useCallback((termId: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(termId)) {
        next.delete(termId);
      } else {
        next.add(termId);
      }
      return next;
    });
    playSound('flip');
  }, []);

  const focusCard = useCallback(
    (index: number) => {
      if (wordSet.length === 0) return;
      const clamped = Math.max(0, Math.min(index, wordSet.length - 1));
      activeIndexRef.current = clamped;
      cardRefs.current[clamped]?.focus();
    },
    [wordSet.length]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        focusCard(activeIndexRef.current - 1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        focusCard(activeIndexRef.current + 1);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        const idx = activeIndexRef.current;
        if (idx >= 0 && idx < wordSet.length) {
          toggleFlipCard(wordSet[idx].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusCard, toggleFlipCard, wordSet]);

  useEffect(() => {
    setFlippedCards(new Set());
  }, [activeTab]);

  return (
    <SectionCard
      title={`${TAB_LABELS[activeTab]} set`}
      subtitle={`CEFR: ${vocabularyProfile.cefrBand}`}
      icon={BookMarked}
      headerActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCSV}
            className="rounded border border-border-soft bg-surface px-2.5 py-1 text-[10px] font-bold text-muted-copy hover:border-primary/40 hover:text-foreground transition-all cursor-pointer"
            title="Export deck for Anki"
          >
            📥 Anki CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded border border-border-soft bg-surface px-2.5 py-1 text-[10px] font-bold text-muted-copy hover:border-primary/40 hover:text-foreground transition-all cursor-pointer"
            title="Print PDF Pocket Field Guide"
          >
            📄 PDF Sheet
          </button>
          {activeTab === 'New' && (
            <p className="hidden md:block text-[10px] text-muted-copy font-medium">
              Click "I Know This" to move to Learned
            </p>
          )}
        </div>
      }
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
          No words currently have {activeTab.toLowerCase()} status. Select New to begin a ten-word
          set.
        </p>
      )}
      {wordSet.length > 0 && (
        <div className="space-y-5">
          <div
            className={`grid gap-4 ${activeTab === 'Learned' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6' : 'lg:grid-cols-2 xl:grid-cols-3'}`}
          >
            <AnimatePresence mode="popLayout">
              {wordSet.map((term, index) => (
                <motion.div
                  key={term.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  tabIndex={-1}
                  className={`outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl ${activeTab === 'Learned' ? '' : 'h-[430px]'}`}
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
                      isFlipped={flippedCards.has(term.id)}
                      onFlip={() => toggleFlipCard(term.id)}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex justify-end border-t border-border-soft pt-4 gap-2">
            {wordSet.length > 0 && (
              <Button variant="outline" className="rounded-[4px]" onClick={onExportCSV}>
                Export as CSV
              </Button>
            )}
            <Button variant="primary" className="rounded-[4px] gap-1.5" onClick={onLoadNextBatch}>
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
