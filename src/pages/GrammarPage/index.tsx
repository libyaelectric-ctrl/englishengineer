import { Flame, Layers, ShieldCheck, Zap } from 'lucide-react';

import { useMemo } from 'react';

import { PageContainer } from '@/shared/components/PageContainer';
import {
  type PipelineStation,
  UniversalCyberPipeline,
} from '@/shared/components/UniversalCyberPipeline';

import { useGrammarStore } from '@/features/grammar';
import { useLocalizationStore } from '@/features/localization';

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
  const translate = useLocalizationStore((s) => s.translate);
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
    recordUsage,
    quizItems,
  } = useGrammarPage();

  const selectedStatus = getSelectedStatus(selectedProgress);
  const selectedModule = selectedRule ? getModuleLabel(selectedRule.grammarCategory) : '';

  const grammarStations: PipelineStation[] = useMemo(() => {
    if (!rulesWithProgress || !rulesWithProgress.length) return [];
    return rulesWithProgress.map((item, idx) => ({
      id: item.rule.id,
      levelBadge: `G${idx + 1}`,
      title: item.rule.title,
      subtitle: `${getModuleLabel(item.rule.grammarCategory)} · ${(item.rule.explanation || item.rule.definition || '').slice(0, 35)}...`,
      status:
        item.progress?.reviewStatus === 'Strong'
          ? 'completed'
          : item.rule.id === selectedRule?.id
            ? 'in-progress'
            : 'available',
      progressRatio: Math.min(1, Math.max(0.2, (item.progress?.strength ?? 40) / 100)),
      totalItems: 10,
      completedItems: item.progress?.correctUsages ?? 0,
      onAction: () => setQuizOpen(true),
    }));
  }, [rulesWithProgress, selectedRule, setQuizOpen]);

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
        onOpenStrugglingQuiz={() => {}}
      />

      {/* Cyber Telemetry Grammar Energy Pipeline */}
      {grammarStations.length > 0 && (
        <UniversalCyberPipeline
          title={translate('pipeline.grammar.title')}
          subtitle={translate('pipeline.grammar.subtitle')}
          badgeText={`CEFR: ${level}`}
          icon={Layers}
          stations={grammarStations}
          activeStationId={selectedRule?.id}
          onSelectStation={(id) => selectRule(id)}
          translate={translate}
          metrics={[
            {
              icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
              label: translate('pipeline.metric.total'),
              value: totalGrammarLessons,
            },
            {
              icon: <Zap className="h-4 w-4 text-amber-400" />,
              label: translate('pipeline.metric.activeLevel'),
              value: level,
            },
            {
              icon: <Flame className="h-4 w-4 text-orange-400" />,
              label: translate('pipeline.metric.streak'),
              value: grammarStats.newCount,
            },
          ]}
        />
      )}

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
