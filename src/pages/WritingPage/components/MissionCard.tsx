import { Clock, CheckCircle2, RefreshCw, Play } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import {
  LevelAccessBadge,
  getContentAccessLabel,
  type CefrLevel,
} from '@/features/level-system';
import { WritingHelpers } from '@/features/writing';

interface MissionCardProps {
  mission: {
    id: string;
    title: string;
    description: string;
    cefrLevel: CefrLevel;
    difficulty: string;
    estimatedMinutes: number;
    discipline: string;
  };
  bestScore?: number;
  currentLevel: CefrLevel;
  onLaunch: (missionId: string) => void;
}

export const MissionCard = ({
  mission,
  bestScore,
  currentLevel,
  onLaunch,
}: MissionCardProps) => {
  const isCompleted = bestScore !== undefined;
  const difficultyColor = WritingHelpers.getDifficultyColor(mission.difficulty);

  return (
    <div
      id={`writing-card-${mission.id}`}
      className={`group relative rounded-xl border bg-surface p-5 transition-all duration-200 hover:-translate-y-px hover:border-border-hover hover:bg-surface-hover/30 hover:shadow-sm ${
        isCompleted ? 'border-emerald-500/20' : 'border-border-soft'
      }`}
    >
      <div className="flex flex-col h-full justify-between space-y-4">
        <div className="space-y-3">
          {/* Top Badge Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border ${WritingHelpers.getCefrBadgeStyles(mission.cefrLevel)}`}
            >
              {mission.cefrLevel}
            </span>
            <LevelAccessBadge
              label={getContentAccessLabel(mission.cefrLevel, currentLevel)}
            />
            <span
              className={`text-[10px] font-black font-mono px-2 py-0.5 rounded uppercase ${
                difficultyColor === 'rose'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : difficultyColor === 'amber'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {mission.difficulty}
            </span>
            <span className="text-[10px] font-mono text-muted-copy ml-auto flex items-center gap-1">
              <Clock className="h-3 w-3" /> {mission.estimatedMinutes}m
            </span>
          </div>

          {/* Title & Desc */}
          <div>
            <h4 className="text-base font-bold text-foreground group-hover:text-foreground transition-colors">
              {mission.title}
            </h4>
            <p className="text-xs text-muted-copy mt-1 line-clamp-2 leading-relaxed">
              {mission.description}
            </p>
          </div>
        </div>

        {/* Footer Row */}
        <div className="flex items-center justify-between pt-4 border-t border-border-soft">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono bg-surface-hover border border-border-soft text-muted-copy px-2 py-1 rounded">
              {mission.discipline}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Score: {bestScore}%</span>
              </div>
            ) : (
              <span className="text-[10px] font-bold font-mono text-muted-copy uppercase">
                Available
              </span>
            )}

            <Button
              onClick={() => onLaunch(mission.id)}
              className={`h-8 px-3 rounded-md font-bold text-xs flex items-center gap-1 ${
                isCompleted
                  ? 'border border-border-soft bg-surface text-foreground hover:bg-surface-hover'
                  : 'bg-primary hover:bg-primary-hover text-white font-black'
              }`}
            >
              {isCompleted ? (
                <RefreshCw className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3 fill-white" />
              )}
              <span>{isCompleted ? 'Retry' : 'Begin'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
