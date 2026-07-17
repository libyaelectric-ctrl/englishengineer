import { useGrammarPage } from './GrammarPage/hooks/useGrammarPage';
import { getModuleLabel } from './GrammarPage/GrammarPageHelpers';
import { GrammarHeader } from './GrammarPage/GrammarHeader';
import { GrammarLessonMap } from './GrammarPage/GrammarLessonMap';
import { GrammarLessonContent } from './GrammarPage/GrammarLessonContent';
import { GrammarNextStep } from './GrammarPage/GrammarNextStep';
import { GrammarReviewQueue } from './GrammarPage/GrammarReviewQueue';

const GrammarPage = () => {
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

  const selectedStatus = selectedProgress
    ? selectedProgress.reviewStatus === 'Strong'
      ? ('Mastered' as const)
      : selectedProgress.correctUsages >= 3 && selectedProgress.strength >= 70
        ? ('Needs Reading/Writing' as const)
        : ('Practicing' as const)
    : ('New' as const);
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
            <div className="rounded-lg border border-border-soft bg-surface p-6 text-center text-xs text-muted-copy">
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
