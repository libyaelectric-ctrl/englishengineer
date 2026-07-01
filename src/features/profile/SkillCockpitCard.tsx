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
    <article className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-px hover:border-sky-200 hover:bg-sky-50/30 hover:shadow-[0_12px_32px_rgba(59,113,143,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-[12px] border border-sky-100 bg-sky-50 p-2.5 text-sky-700">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-950">{meta.label}</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              {lessonNumber
                ? `Lesson ${lessonNumber}`
                : 'Current learning path'}
            </p>
          </div>
        </div>
        <span className="text-2xl font-black text-slate-950">
          {profile.cefrBand}
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar value={profile.progressToNextBand} color="cyan" />
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500">
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
          className="mt-4 w-full justify-between"
          onClick={onAction}
        >
          {meta.action}
          <span aria-hidden="true">→</span>
        </Button>
      )}
    </article>
  );
};
