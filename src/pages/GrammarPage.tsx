import { useGrammarPage } from './GrammarPage/hooks/useGrammarPage';
import { getModuleLabel } from './GrammarPage/GrammarPageHelpers';
import { GrammarHeader } from './GrammarPage/GrammarHeader';
import { GrammarLessonMap } from './GrammarPage/GrammarLessonMap';
import { GrammarLessonContent } from './GrammarPage/GrammarLessonContent';
import { GrammarNextStep } from './GrammarPage/GrammarNextStep';
import { GrammarReviewQueue } from './GrammarPage/GrammarReviewQueue';

const getSelectedStatus = (
  progress: ReturnType<typeof useGrammarPage>['selectedProgress']
) => {
  if (!progress) return 'New' as const;
  if (progress.reviewStatus === 'Strong') return 'Mastered' as const;
  if (progress.correctUsages >= 3 && progress.strength >= 70)
    return 'Needs Reading/Writing' as const;
  return 'Practicing' as const;
};

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

  const selectedStatus = getSelectedStatus(selectedProgress);
  const selectedModule = selectedRule
    ? getModuleLabel(selectedRule.grammarCategory)
    : '';

  return (
    <div className="min-h-screen bg-[#faf8ff] pb-16 text-foreground">
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
            <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-6 text-center text-xs text-muted-copy">
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
