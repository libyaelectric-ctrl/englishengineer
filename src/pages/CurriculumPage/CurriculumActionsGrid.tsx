import { useNavigate } from 'react-router-dom';
import type { SkillName, DailyMission, SkillProfile, VocabularyMemorySummary } from '@/features/profile';

interface Props {
  primaryMission: DailyMission | undefined;
  weakestSkill: string;
  currentSkillProfile: SkillProfile;
  memory: VocabularyMemorySummary;
  setSelectedSkill: (skill: SkillName) => void;
}

export const CurriculumActionsGrid = ({
  primaryMission,
  weakestSkill,
  currentSkillProfile,
  memory,
  setSelectedSkill,
}: Props) => {
  const navigate = useNavigate();

  return (
    <section
      className="grid gap-3 md:grid-cols-3"
      aria-label="Learning actions"
    >
      {[
        {
          label: 'Continue Learning',
          value: primaryMission?.title ?? 'Build your first task',
          detail: primaryMission
            ? `${primaryMission.estimatedMinutes} min`
            : 'Ready at A1',
          action: () => navigate(primaryMission?.route ?? '/reading'),
        },
        {
          label: "Today's Best Task",
          value: primaryMission?.reason ?? 'Start with a current-level task',
          detail: primaryMission?.cefrBand ?? currentSkillProfile.cefrBand,
          action: () => navigate(primaryMission?.route ?? '/reading'),
        },
        {
          label: 'Improve Next',
          value: weakestSkill[0].toUpperCase() + weakestSkill.slice(1),
          detail: `${currentSkillProfile.cefrBand} · independent skill priority`,
          action: () => setSelectedSkill(weakestSkill as SkillName),
        },
        {
          label: 'Due Review',
          value: `${memory.dueToday} items`,
          detail:
            memory.weakWords > 0
              ? `${memory.weakWords} weak words`
              : 'Queue is current',
          action: () => navigate('/vocabulary'),
        },
      ].map((item, index) => (
        <button
          key={item.label}
          type="button"
          onClick={item.action}
          className={`min-h-32 rounded-xl border p-4 text-left transition-all hover:-translate-y-px hover:border-primary hover:bg-surface-hover ${
            index === 0
              ? 'border-primary bg-surface-hover'
              : 'border-border-soft bg-surface'
          }`}
        >
          <span className="text-[10px] font-medium uppercase text-muted-copy">
            {item.label}
          </span>
          <span className="mt-2 block line-clamp-2 text-sm font-medium text-foreground">
            {item.value}
          </span>
          <span className="mt-2 block text-xs text-muted-copy">
            {item.detail}
          </span>
        </button>
      ))}
    </section>
  );
};
