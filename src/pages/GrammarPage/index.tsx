import { PageContainer } from '@/shared/components/PageContainer';

import { useGrammarStore } from '@/features/grammar';

import { GrammarEnhancementPanel } from './GrammarEnhancementPanel';
import { GrammarHeader } from './GrammarHeader';
import { GrammarLessonContent } from './GrammarLessonContent';
import { GrammarNextStep } from './GrammarNextStep';
import { getModuleLabel } from './GrammarPageHelpers';
import { GrammarReviewQueue } from './GrammarReviewQueue';
import { useGrammarPage } from './hooks/useGrammarPage';

const getSelectedStatus = (progress: ReturnType<typeof useGrammarPage>['selectedProgress']) => {
  if (!progress) return 'New' as const;
  if (progress.reviewStatus === 'Strong') return 'Mastered' as const;
  if (progress.correctUsages >= 3 && progress.strength >= 70)
    return 'Needs Reading/Writing' as const;
  return 'Practicing' as const;
};

const GrammarPage = () => {
  const grammarStats = useGrammarStore((s) => s.stats);
  const grammarLearned = grammarStats.learned + grammarStats.mastered;
  const grammarStruggling = grammarStats.struggling;
  const {
    level,
    rules,
    grammarPoolIds,
    query,
    setQuery,
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
    linkedVocabulary,
    nextLesson,
    reviewTargets,
    masteredCount,
    rulesWithProgress,
    selectRule,
    startQuickQuiz,
    recordUsage,
    quizItems,
  } = useGrammarPage();

  const selectedStatus = getSelectedStatus(selectedProgress);
  const selectedModule = selectedRule ? getModuleLabel(selectedRule.grammarCategory) : '';

  return (
    <PageContainer className="space-y-6 min-h-screen bg-background pb-16 text-foreground">
      <GrammarHeader
        level={level}
        levelCounts={levelCounts}
        query={query}
        setQuery={setQuery}
        grammarLearned={grammarLearned}
        grammarStruggling={grammarStruggling}
        onOpenQuiz={() => setQuizOpen(true)}
        onQuickQuiz={startQuickQuiz}
        onOpenStrugglingQuiz={() => {}}
      />

      <main className="mt-6 space-y-5">
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
          <GrammarReviewQueue reviewTargets={reviewTargets} selectRule={selectRule} />
        )}

        {selectedRule && selectedProgress && (
          <GrammarEnhancementPanel
            selectedRule={selectedRule}
            selectedProgress={selectedProgress}
            rules={rules}
            rulesWithProgress={rulesWithProgress}
            query={query}
            setQuery={setQuery}
            selectRule={selectRule}
            recordUsage={recordUsage}
          />
        )}
      </main>
    </PageContainer>
  );
};

export default GrammarPage;
