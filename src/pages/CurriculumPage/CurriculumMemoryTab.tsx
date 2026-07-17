import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import {
  LearningMemorySummary,
  type UnifiedReviewItem,
  type ReviewPriorityItem,
} from '@/features/learning-intelligence';
import type { VocabularyMemorySummary, ProfileBadge } from '@/features/profile';
import type { GrammarProgressSummary } from '@/features/grammar';

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

  return (
    <SectionCard
      id="review"
      title="Learning Memory"
      subtitle="Everything you learn shapes what comes next"
      icon={BookOpen}
    >
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <LearningMemorySummary
          vocabulary={memory}
          grammar={grammarSummary}
          repeatedMistakes={repeatedMistakes}
          badges={badges}
        />
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#0047bb]">
                Unified Review Queue
              </p>
              <p className="mt-1 text-xs text-muted-copy font-medium">
                Focus on the most useful improvement first.
              </p>
            </div>
            <Link
              to="/progress/next-steps"
              className="text-xs font-bold uppercase tracking-wider text-[#0047bb] hover:underline cursor-pointer"
            >
              View plan
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {(unifiedReviewQueue.length > 0
              ? unifiedReviewQueue
              : reviewPriorities
            )
              .slice(0, 4)
              .map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm hover:bg-[#faf8ff] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge
                      label={
                        index === 0 ? 'Start here' : `Priority ${index + 1}`
                      }
                      tone={index === 0 ? 'warning' : 'neutral'}
                      className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider"
                    />
                    <span className="text-xs font-bold text-muted-copy">
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-copy font-medium">
                    {item.reason}
                  </p>
                  {'route' in item && (
                    <Button
                      variant="ghost"
                      className="mt-4 w-full h-9 inline-flex items-center justify-center rounded-[4px] border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] text-xs font-bold uppercase tracking-wider text-[#0047bb] cursor-pointer shadow-sm gap-1.5"
                      onClick={() =>
                        navigate((item as UnifiedReviewItem).route)
                      }
                    >
                      Practice now <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
