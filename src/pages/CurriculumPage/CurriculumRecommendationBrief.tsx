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
        <div className="h-72 animate-pulse rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff]" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              hoverEffect={false}
              className="p-4 rounded-[4px] border border-[#d9d9e3] bg-white shadow-sm flex flex-col justify-between"
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                Target CEFR
              </p>
              <p className="mt-1.5 text-lg font-bold text-foreground font-mono">
                {recommendation.targetCefr}
              </p>
            </Card>
            <Card
              hoverEffect={false}
              className="p-4 rounded-[4px] border border-[#d9d9e3] bg-white shadow-sm flex flex-col justify-between"
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                Safe / Stretch
              </p>
              <p className="mt-1.5 text-lg font-bold text-foreground font-mono">
                75% / 25%
              </p>
            </Card>
            <Card
              hoverEffect={false}
              className="p-4 rounded-[4px] border border-[#d9d9e3] bg-white shadow-sm flex flex-col justify-between"
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                Effort
              </p>
              <p className="mt-1.5 text-lg font-bold text-foreground font-mono">
                {recommendation.estimatedMinutes} min
              </p>
            </Card>
            <Card
              hoverEffect={false}
              className="p-4 rounded-[4px] border border-[#d9d9e3] bg-white shadow-sm flex flex-col justify-between"
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                AI required
              </p>
              <p className="mt-1.5 text-lg font-bold text-success font-mono">
                No
              </p>
            </Card>
          </div>

          <div className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-4 shadow-sm animate-in fade-in duration-300">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#0047bb]">
              Why recommended
            </p>
            <p className="mt-2 text-xs leading-5 text-foreground font-medium">
              {recommendation.whyRecommended}
            </p>
          </div>

          <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d9d9e3] pb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                Lesson {recommendation.lessonNumber}
              </p>
              <StatusBadge
                label={recommendation.sharedLessonTitle}
                tone="info"
                className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider"
              />
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {Object.values(recommendation.explanation).map((line) => (
                <p
                  key={line}
                  className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-3 text-xs leading-5 text-muted-copy font-medium shadow-sm"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Vocabulary focus
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendation.vocabularyFocus.length > 0 ? (
                  recommendation.vocabularyFocus.map(({ term, bucket }) => (
                    <span
                      key={term.id}
                      className="rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm"
                    >
                      {term.term} · {bucket}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-copy font-medium">
                    No matching vocabulary for this manual domain. Choose All to
                    use the current-level database set.
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Grammar focus
              </h3>
              <div className="mt-3 space-y-2">
                {recommendation.grammarFocus.length > 0 ? (
                  recommendation.grammarFocus.map((rule) => (
                    <p
                      key={rule.id}
                      className="rounded-[4px] border border-[#d9d9e3] bg-white p-3 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm"
                    >
                      {rule.title} · {rule.cefrLevel}
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-muted-copy font-medium">
                    No matching grammar rule for this manual domain.
                  </p>
                )}
              </div>
              {recommendation.grammarFocus.length > 0 && (
                <p className="mt-2 text-[10px] font-bold text-muted-copy uppercase tracking-wider">
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

          <div className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
              Expected answer
            </p>
            <p className="mt-2 text-xs font-bold text-foreground">
              {recommendation.expectedAnswerType}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-copy font-medium">
              {recommendation.context}
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#0047bb]">
              Weakest-area priority: {recommendation.focusPriority}
            </p>
          </div>

          {selectedMeta.route ? (
            <Button
              className="w-full bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-white font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm min-h-9 flex items-center justify-center gap-1.5"
              onClick={() => navigate(selectedMeta.route!)}
            >
              Open {selectedMeta.label} workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <p className="rounded-[4px] border border-warning/30 bg-warning/5 p-4 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm">
              Grammar selection is active in this hub. A dedicated Grammar task
              runner is not connected in this sprint.
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
};
