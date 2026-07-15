import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import type { DailyMission } from '@/features/profile';

interface Props {
  isLoading: boolean;
  missions: DailyMission[];
}

export const CurriculumTodayTab = ({ isLoading, missions }: Props) => {
  const navigate = useNavigate();

  return (
    <SectionCard
      id="today"
      title="Recommended Today"
      subtitle="Chosen from independent skill progress, vocabulary memory, current-level databases, and weaknesses"
      icon={Sparkles}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {isLoading
          ? [0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-xl border border-border-soft bg-surface-hover"
              />
            ))
          : missions.map((mission, index) => (
              <article
                key={mission.id}
                className="flex min-h-44 flex-col rounded-xl border border-border-soft bg-surface p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge
                    label={index === 0 ? 'Recommended' : mission.difficulty}
                    tone={index === 0 ? 'info' : 'neutral'}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {mission.cefrBand}
                  </span>
                </div>
                <h3 className="mt-4 font-medium text-foreground">
                  {mission.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-copy">
                  {mission.reason}
                </p>
                <Button
                  variant="ghost"
                  className="mt-3 justify-start px-0"
                  onClick={() => navigate(mission.route)}
                >
                  Review recommendation <ArrowRight className="h-4 w-4" />
                </Button>
              </article>
            ))}
      </div>
    </SectionCard>
  );
};
