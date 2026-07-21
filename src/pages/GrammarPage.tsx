import { useGrammarPage } from './GrammarPage/hooks/useGrammarPage';
import { getModuleLabel } from './GrammarPage/GrammarPageHelpers';
import { GrammarHeader } from './GrammarPage/GrammarHeader';
import { GrammarLessonMap } from './GrammarPage/GrammarLessonMap';
import { GrammarLessonContent } from './GrammarPage/GrammarLessonContent';
import { GrammarNextStep } from './GrammarPage/GrammarNextStep';
import { GrammarReviewQueue } from './GrammarPage/GrammarReviewQueue';
import { useGrammarStore } from '@/features/grammar/store/grammar.store';
import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';
import { QUIZ_THRESHOLD as VOCAB_QUIZ_THRESHOLD } from '@/features/vocabulary/services/vocabulary.progress';

const getSelectedStatus = (
  progress: ReturnType<typeof useGrammarPage>['selectedProgress']
) => {
  if (!progress) return 'New' as const;
  if (progress.reviewStatus === 'Strong') return 'Mastered' as const;
  if (progress.correctUsages >= 3 && progress.strength >= 70)
    return 'Needs Reading/Writing' as const;
  return 'Practicing' as const;
};

const GRAMMAR_QUIZ_THRESHOLD = 36;

const GrammarPage = () => {
  const grammarStats = useGrammarStore((s) => s.stats);
  const vocabStats = useVocabularyStore((s) => s.stats);
  const grammarLearned = grammarStats.learned + grammarStats.mastered;
  const vocabLearned = vocabStats.learned + vocabStats.mastered;
  const canAccessWriting = grammarLearned >= GRAMMAR_QUIZ_THRESHOLD && vocabLearned >= VOCAB_QUIZ_THRESHOLD;
  const {
    level,
    rules,
    grammarPoolIds,
    query,
    setQuery,
    lessonStripRef,
    quizOpen,
    setQuizOpen,
    hintOpen,
    setHintOpen,
    quizAnswers,
    setQuizAnswers,
    levelCounts,
    totalGrammarLessons,
    selectedRule,
    selectedProgress,
    pathGroups,
    linkedVocabulary,
    nextLesson,
    reviewTargets,
    masteredCount,
    selectRule,
    scrollLessonStrip,
    recordUsage,
    quizItems,
  } = useGrammarPage();

  const selectedStatus = getSelectedStatus(selectedProgress);
  const selectedModule = selectedRule
    ? getModuleLabel(selectedRule.grammarCategory)
    : '';

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground">
      <GrammarHeader
        level={level}
        levelCounts={levelCounts}
        query={query}
        setQuery={setQuery}
      />

      {!canAccessWriting && (
        <div className="mx-4 rounded-[4px] border border-amber-300 bg-amber-50 p-3 text-xs text-amber-700">
          Learn 500 grammar rules and 500 vocabulary words to unlock Reading &amp; Writing modules.
        </div>
      )}

      <main className="mt-6 space-y-5">
        <GrammarLessonMap
          pathGroups={pathGroups}
          selectedRule={selectedRule}
          selectRule={selectRule}
          scrollLessonStrip={scrollLessonStrip}
          lessonStripRef={lessonStripRef as React.RefObject<HTMLDivElement>}
        />

        <section className="min-w-0 space-y-4">
          {selectedRule && selectedProgress ? (
            <GrammarLessonContent
              selectedRule={selectedRule}
              selectedProgress={selectedProgress}
              selectedStatus={selectedStatus}
              selectedModule={selectedModule}
              rules={rules}
              totalGrammarLessons={totalGrammarLessons}
              masteredCount={masteredCount}
              grammarPoolIds={grammarPoolIds}
              linkedVocabulary={linkedVocabulary}
              recordUsage={recordUsage}
              quizOpen={quizOpen}
              setQuizOpen={setQuizOpen}
              hintOpen={hintOpen}
              setHintOpen={setHintOpen}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              quizItems={quizItems}
            />
          ) : (
            <div className="rounded-[4px] border border-border-soft bg-surface p-6 text-center text-xs text-muted-copy">
              Select a grammar lesson to begin.
            </div>
          )}
        </section>

        {selectedRule && nextLesson && (
          <GrammarNextStep nextLesson={nextLesson} selectRule={selectRule} />
        )}

        {reviewTargets.length > 0 && (
          <GrammarReviewQueue
            reviewTargets={reviewTargets}
            selectRule={selectRule}
          />
        )}
      </main>
    </div>
  );
};

export default GrammarPage;
