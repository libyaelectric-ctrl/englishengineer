import {
  BookMarked,
  BookOpen,
  Headphones,
  Languages,
  Mic2,
  PenTool,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import type { SkillName, SkillProfile } from './profile.types';

const SKILL_META: Record<
  SkillName,
  { label: string; action: string; icon: typeof BookOpen }
> = {
  reading: { label: 'Reading', action: 'Practice reading', icon: BookOpen },
  writing: { label: 'Writing', action: 'Practice writing', icon: PenTool },
  listening: {
    label: 'Listening',
    action: 'Practice listening',
    icon: Headphones,
  },
  speaking: { label: 'Speaking', action: 'Practice speaking', icon: Mic2 },
  vocabulary: {
    label: 'Vocabulary',
    action: 'Review vocabulary',
    icon: BookMarked,
  },
  grammar: { label: 'Grammar', action: 'Practice grammar', icon: Languages },
};

export const SkillCockpitCard = ({
  profile,
  onAction,
  compact = false,
  lessonNumber,
}: {
  profile: SkillProfile;
  onAction?: () => void;
  compact?: boolean;
  lessonNumber?: number;
}) => {
  const meta = SKILL_META[profile.skill];
  const Icon = meta.icon;
  const TrendIcon =
    profile.trend === 'improving'
      ? TrendingUp
      : profile.trend === 'declining'
        ? TrendingDown
        : Minus;

  return (
    <article className="rounded-card border border-border-soft bg-surface p-4 transition-all duration-150 hover:-translate-y-px hover:border-border-hover hover:bg-surface-hover/20 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-[8px] border border-border-soft bg-surface-hover/50 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">{meta.label}</h3>
            <p className="mt-0.5 text-[10px] font-semibold text-muted-copy">
              {lessonNumber
                ? `Lesson ${lessonNumber}`
                : 'Current learning path'}
            </p>
          </div>
        </div>
        <span className="text-lg font-bold text-foreground">
          {profile.cefrBand}
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar value={profile.progressToNextBand} color="cyan" />
        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-semibold text-muted-copy">
          <span>{profile.progressToNextBand}% to next band</span>
          <span className="inline-flex items-center gap-1 capitalize">
            <TrendIcon className="h-3.5 w-3.5" />
            {profile.trend.replaceAll('-', ' ')}
          </span>
        </div>
      </div>

      {!compact && (
        <Button
          type="button"
          variant="ghost"
          className="mt-4 w-full justify-between text-xs min-h-8"
          onClick={onAction}
        >
          {meta.action}
          <span aria-hidden="true">→</span>
        </Button>
      )}
    </article>
  );
};
