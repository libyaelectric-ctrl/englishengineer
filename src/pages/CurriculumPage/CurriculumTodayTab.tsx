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
                className="h-44 animate-pulse rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff]"
              />
            ))
          : missions.map((mission, index) => (
              <article
                key={mission.id}
                className="flex min-h-44 flex-col rounded-[4px] border border-[#d9d9e3] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge
                    label={index === 0 ? 'Recommended' : mission.difficulty}
                    tone={index === 0 ? 'info' : 'neutral'}
                    className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider"
                  />
                  <span className="text-xs font-bold text-foreground font-mono">
                    {mission.cefrBand}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-foreground text-sm">
                  {mission.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-muted-copy font-medium">
                  {mission.reason}
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 w-full h-9 inline-flex items-center justify-center rounded-[4px] border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] text-xs font-bold uppercase tracking-wider text-[#0047bb] cursor-pointer shadow-sm gap-1.5"
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
