import { Clock } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import {
  LevelContentFilter,
  type ContentLevelFilter,
  type CefrLevel,
} from '@/features/level-system';
import { MissionCard } from './MissionCard';

interface MissionListTabProps {
  levelFilter: ContentLevelFilter;
  currentLevel: CefrLevel;
  setLevelFilter: (filter: ContentLevelFilter) => void;
  finishedCount: number;
  writingHistory: Array<{ date: string; wordCount: number; score: number }>;
  visibleMissions: Array<{
    id: string;
    title: string;
    description: string;
    cefrLevel: CefrLevel;
    difficulty: string;
    estimatedMinutes: number;
    discipline: string;
  }>;
  completedMissions: Record<string, number>;
  resetAllWritingProgress: () => void;
  handleLaunchMission: (missionId: string) => void;
}

export const MissionListTab = ({
  levelFilter,
  currentLevel,
  setLevelFilter,
  finishedCount,
  writingHistory,
  visibleMissions,
  completedMissions,
  resetAllWritingProgress,
  handleLaunchMission,
}: MissionListTabProps) => {
  return (
    <div className="space-y-6">
      <LevelContentFilter
        value={levelFilter}
        currentLevel={currentLevel}
        onChange={setLevelFilter}
      />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-foreground tracking-tight">
            Technical Mission Library
          </h3>
          <p className="text-xs text-muted-copy mt-0.5 font-medium">
            Select a professional drafting scenario to begin technical revision
            assessment
          </p>
        </div>
        {finishedCount > 0 && (
          <Button
            variant="outline"
            onClick={resetAllWritingProgress}
            className="text-xs h-9 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
          >
            Reset Progress
          </Button>
        )}
      </div>

      {writingHistory.length > 0 && (
        <SectionCard
          title="Recent Writing History"
          subtitle="Last 5 submissions"
          icon={Clock}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-soft">
                  <th className="py-2 text-left font-medium text-muted-copy">
                    Date
                  </th>
                  <th className="py-2 text-left font-medium text-muted-copy">
                    Word Count
                  </th>
                  <th className="py-2 text-left font-medium text-muted-copy">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {writingHistory.map((entry, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-soft last:border-0"
                  >
                    <td className="py-2 text-foreground">{entry.date}</td>
                    <td className="py-2 text-foreground">{entry.wordCount}</td>
                    <td className="py-2 text-foreground">
                      {entry.score > 0 ? `${entry.score}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleMissions.map((m) => (
          <MissionCard
            key={m.id}
            mission={m}
            bestScore={completedMissions[m.id]}
            currentLevel={currentLevel}
            onLaunch={handleLaunchMission}
          />
        ))}
        {visibleMissions.length === 0 && (
          <div className="col-span-full rounded-xl border border-border-soft bg-surface-hover p-6 text-sm text-muted-copy">
            No current-level content yet. No Writing missions are available for
            this filter.
          </div>
        )}
      </div>
    </div>
  );
};
