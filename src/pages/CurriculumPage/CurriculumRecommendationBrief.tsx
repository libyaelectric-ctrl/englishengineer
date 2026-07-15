import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { GrammarProgressService } from '@/features/grammar';
import { ICON_MAP } from './curriculum-data';

interface Recommendation {
  targetCefr: string;
  estimatedMinutes: number;
  whyRecommended: string;
  lessonNumber: number;
  sharedLessonTitle: string;
  explanation: Record<string, string>;
  vocabularyFocus: { term: { id: string; term: string }; bucket: string }[];
  grammarFocus: { id: string; title: string; cefrLevel: string }[];
  expectedAnswerType: string;
  context: string;
  focusPriority: string;
}

interface SkillMeta {
  label: string;
  route: string | null;
  icon: string;
}

interface Props {
  selectedMeta: SkillMeta;
  recommendation: Recommendation | null;
  recommendationLoading: boolean;
}

export const CurriculumRecommendationBrief = ({
  selectedMeta,
  recommendation,
  recommendationLoading,
}: Props) => {
  const navigate = useNavigate();

  return (
    <SectionCard
      title={`${selectedMeta.label} Entry Brief`}
      subtitle="Review the recommendation before starting; manual changes are optional"
      icon={ICON_MAP[selectedMeta.icon] || ICON_MAP.BookOpen}
    >
      {recommendationLoading || !recommendation ? (
        <div className="h-72 animate-pulse rounded-xl bg-surface-hover" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card hoverEffect={false} className="p-4">
              <p className="text-[10px] font-medium uppercase text-muted-copy">
                Target CEFR
              </p>
              <p className="mt-1 text-xl font-medium text-foreground">
                {recommendation.targetCefr}
              </p>
            </Card>
            <Card hoverEffect={false} className="p-4">
              <p className="text-[10px] font-medium uppercase text-muted-copy">
                Safe / Stretch
              </p>
              <p className="mt-1 text-xl font-medium text-foreground">
                75% / 25%
              </p>
            </Card>
            <Card hoverEffect={false} className="p-4">
              <p className="text-[10px] font-medium uppercase text-muted-copy">
                Effort
              </p>
              <p className="mt-1 text-xl font-medium text-foreground">
                {recommendation.estimatedMinutes} min
              </p>
            </Card>
            <Card hoverEffect={false} className="p-4">
              <p className="text-[10px] font-medium uppercase text-muted-copy">
                AI required
              </p>
              <p className="mt-1 text-xl font-medium text-success">
                No
              </p>
            </Card>
          </div>

          <div className="rounded-xl border border-primary bg-surface-hover p-4">
            <p className="text-xs font-medium uppercase text-primary">
              Why recommended
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {recommendation.whyRecommended}
            </p>
          </div>

          <div className="rounded-xl border border-border-soft bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase text-muted-copy">
                Lesson {recommendation.lessonNumber}
              </p>
              <StatusBadge
                label={recommendation.sharedLessonTitle}
                tone="info"
              />
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {Object.values(recommendation.explanation).map((line) => (
                <p
                  key={line}
                  className="rounded-lg bg-surface-hover p-3 text-xs leading-5 text-muted-copy"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="font-medium text-foreground">
                Vocabulary focus
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendation.vocabularyFocus.length > 0 ? (
                  recommendation.vocabularyFocus.map(
                    ({ term, bucket }) => (
                      <span
                        key={term.id}
                        className="rounded-full border border-border-soft bg-surface-hover px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {term.term} · {bucket}
                      </span>
                    )
                  )
                ) : (
                  <span className="text-sm text-muted-copy">
                    No matching vocabulary for this manual domain.
                    Choose All to use the current-level database set.
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                Grammar focus
              </h3>
              <div className="mt-3 space-y-2">
                {recommendation.grammarFocus.length > 0 ? (
                  recommendation.grammarFocus.map((rule) => (
                    <p
                      key={rule.id}
                      className="rounded-lg border border-border-soft bg-surface-hover p-3 text-sm text-foreground"
                    >
                      {rule.title} · {rule.cefrLevel}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-copy">
                    No matching grammar rule for this manual domain.
                  </p>
                )}
              </div>
              {recommendation.grammarFocus.length > 0 && (
                <p className="mt-2 text-xs font-medium text-muted-copy">
                  Review state:{' '}
                  {
                    GrammarProgressService.get(
                      recommendation.grammarFocus[0].id
                    ).reviewStatus
                  }{' '}
                  ·{' '}
                  {
                    GrammarProgressService.get(
                      recommendation.grammarFocus[0].id
                    ).strength
                  }
                  % strength
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
            <p className="text-xs font-medium uppercase text-muted-copy">
              Expected answer
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {recommendation.expectedAnswerType}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-copy">
              {recommendation.context}
            </p>
            <p className="mt-2 text-xs font-medium uppercase text-primary">
              Weakest-area priority: {recommendation.focusPriority}
            </p>
          </div>

          {selectedMeta.route ? (
            <Button onClick={() => navigate(selectedMeta.route!)}>
              Open {selectedMeta.label} workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <p className="rounded-xl border border-warning bg-surface-hover p-4 text-sm text-foreground">
              Grammar selection is active in this hub. A dedicated
              Grammar task runner is not connected in this sprint.
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
};
