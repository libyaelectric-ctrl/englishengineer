import { Headphones } from 'lucide-react';
import { type ListeningMission } from '@/features/listening/listening.types';
import {
  getContentAccessLabel,
  LevelAccessBadge,
  type CefrLevel,
} from '@/features/level-system';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { CATEGORIES } from '../hooks/useListeningPage';

export const MissionListTab = ({
  currentLevel,
  categoryFilter,
  setCategoryFilter,
  filteredMissions,
  selectMission,
  setWorkspaceOpen,
}: {
  currentLevel: CefrLevel;
  categoryFilter: (typeof CATEGORIES)[number];
  setCategoryFilter: (v: (typeof CATEGORIES)[number]) => void;
  filteredMissions: ListeningMission[];
  selectMission: (id: string) => void;
  setWorkspaceOpen: (v: boolean) => void;
}) => (
  <SectionCard
    title="Transcript Tasks"
    subtitle="Choose a level-safe task; the system recommendation remains changeable"
    icon={Headphones}
  >
    <div className="flex flex-wrap gap-2 mb-4">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => setCategoryFilter(cat)}
          className={`min-h-9 rounded-[4px] px-3.5 text-xs font-bold transition-all cursor-pointer border ${
            categoryFilter === cat
              ? 'bg-primary border-primary text-primary-foreground shadow-sm'
              : 'text-muted-copy border-border-soft bg-surface hover:bg-primary/5 hover:text-primary'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filteredMissions.map((mission) => (
        <article
          key={mission.id}
          className="group rounded-[4px] border border-border-soft bg-surface p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {mission.cefrLevel}
              </span>
              <LevelAccessBadge
                label={getContentAccessLabel(mission.cefrLevel, currentLevel)}
              />
            </div>
            <span className="text-xs text-muted-copy font-bold">
              {mission.estimatedMinutes} M
            </span>
          </div>
          <h2 className="mt-3 font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
            {mission.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-copy font-normal">
            {mission.description}
          </p>
          <Button
            className="mt-4 w-full rounded-[4px] font-bold uppercase tracking-wider text-[10px] cursor-pointer bg-primary hover:bg-primary-hover border border-primary h-10"
            onClick={() => {
              selectMission(mission.id);
              setWorkspaceOpen(true);
            }}
          >
            Open transcript task
          </Button>
        </article>
      ))}
    </div>
  </SectionCard>
);
