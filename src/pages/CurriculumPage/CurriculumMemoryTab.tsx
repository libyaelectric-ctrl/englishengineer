import { ArrowRight, BarChart3, BookOpen, History, Verified } from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';

import type { GrammarProgressSummary } from '@/features/grammar';
import {
  LearningMemorySummary,
  type ReviewPriorityItem,
  type UnifiedReviewItem,
} from '@/features/learning-intelligence';
import { useLocalizationStore } from '@/features/localization';
import type { ProfileBadge, VocabularyMemorySummary } from '@/features/profile';

interface Props {
  memory: VocabularyMemorySummary;
  grammarSummary: GrammarProgressSummary;
  repeatedMistakes: number;
  badges: ProfileBadge[];
  unifiedReviewQueue: UnifiedReviewItem[];
  reviewPriorities: ReviewPriorityItem[];
}

export const CurriculumMemoryTab = ({
  memory,
  grammarSummary,
  repeatedMistakes,
  badges,
  unifiedReviewQueue,
  reviewPriorities,
}: Props) => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((s) => s.translate);

  return (
    <SectionCard
      id="review"
      title={translate('curriculum.learningMemory')}
      subtitle={translate('curriculum.learningMemoryDesc')}
      icon={BookOpen}
    >
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)] font-sans relative">
        {/* Technical background Grid for OS feel */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:16px_16px]" />

        <div className="space-y-4 relative z-10">
          <LearningMemorySummary
            vocabulary={memory}
            grammar={grammarSummary}
            repeatedMistakes={repeatedMistakes}
            badges={badges}
          />

          {/* diagnostic mini dashboard */}
          <div className="rounded-[4px] border border-border-soft bg-surface-hover p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {translate('curriculum.knowledgeDiagnostics')}
              </span>
            </div>
            <div className="space-y-2 text-[10px] font-bold text-muted-copy uppercase tracking-wider">
              <div className="flex justify-between border-b border-border-soft pb-1.5">
                <span>{translate('curriculum.memoryRetention')}</span>
                <span className="text-primary">88% {translate('curriculum.stable')}</span>
              </div>
              <div className="flex justify-between border-b border-border-soft pb-1.5">
                <span>{translate('curriculum.activeQueue')}</span>
                <span className="text-warning">
                  {unifiedReviewQueue.length} {translate('curriculum.tasksDue')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{translate('curriculum.syncStatus')}</span>
                <span className="text-success">{translate('curriculum.dbCompliant')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {translate('curriculum.unifiedReviewQueue')}
              </p>
              <p className="mt-1 text-xs text-muted-copy font-medium">
                {translate('curriculum.unifiedReviewDesc')}
              </p>
            </div>
            <Link
              to="/progress/next-steps"
              className="text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
            >
              {translate('curriculum.viewPlan')}
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(unifiedReviewQueue.length > 0 ? unifiedReviewQueue : reviewPriorities)
              .slice(0, 4)
              .map((item, index) => {
                const isFirst = index === 0;
                const memIdStr = `MEM-01.0${index + 1}`;
                return (
                  <div
                    key={item.id}
                    className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between min-h-[170px]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-muted-copy uppercase tracking-widest">
                          {memIdStr}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isFirst ? (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                          ) : (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-success" />
                          )}
                          <span className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                            {isFirst
                              ? translate('curriculum.recallDue')
                              : translate('curriculum.mastered')}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-xs font-bold text-foreground leading-snug">
                        {item.label}
                      </p>

                      {/* Secondary information block */}
                      <div className="mt-2.5 p-2 rounded-[4px] bg-surface-hover border border-border-soft/45 flex items-start gap-1.5">
                        {isFirst ? (
                          <History className="h-3 w-3 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <Verified className="h-3 w-3 text-success shrink-0 mt-0.5" />
                        )}
                        <p className="text-[10px] leading-relaxed text-muted-copy font-medium">
                          {item.reason}
                        </p>
                      </div>
                    </div>

                    {'route' in item && (
                      <Button
                        variant="ghost"
                        className="mt-4 w-full h-8 inline-flex items-center justify-center rounded-[4px] border border-border-soft bg-surface hover:bg-surface-hover text-[10px] font-bold uppercase tracking-wider text-primary cursor-pointer shadow-sm gap-1.5"
                        onClick={() => navigate((item as UnifiedReviewItem).route)}
                      >
                        {translate('curriculum.practiceNow')} <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
