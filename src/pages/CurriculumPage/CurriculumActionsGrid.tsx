import { useNavigate } from 'react-router-dom';

import { useLocalizationStore } from '@/features/localization';
import type {
  DailyMission,
  SkillName,
  SkillProfile,
  VocabularyMemorySummary,
} from '@/features/profile';

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
  const translate = useLocalizationStore((s) => s.translate);

  return (
    <section
      className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Learning actions"
    >
      {[
        {
          label: translate('curriculum.continueLearning'),
          value: primaryMission?.title ?? translate('curriculum.buildFirstTask'),
          detail: primaryMission
            ? `${primaryMission.estimatedMinutes} min`
            : translate('curriculum.readyAtA1'),
          action: () => navigate(primaryMission?.route ?? '/reading'),
        },
        {
          label: translate('curriculum.todaysBestTask'),
          value: primaryMission?.reason ?? translate('curriculum.startCurrentLevel'),
          detail: primaryMission?.cefrBand ?? currentSkillProfile.cefrBand,
          action: () => navigate(primaryMission?.route ?? '/reading'),
        },
        {
          label: translate('curriculum.improveNext'),
          value: weakestSkill[0].toUpperCase() + weakestSkill.slice(1),
          detail: `${currentSkillProfile.cefrBand} · ${translate('curriculum.independentSkillPriority')}`,
          action: () => setSelectedSkill(weakestSkill as SkillName),
        },
        {
          label: translate('curriculum.dueReview'),
          value: `${memory.dueToday} ${translate('curriculum.items')}`,
          detail:
            memory.weakWords > 0
              ? `${memory.weakWords} ${translate('curriculum.weakWords')}`
              : translate('curriculum.queueCurrent'),
          action: () => navigate('/vocabulary'),
        },
      ].map((item, index) => (
        <button
          key={item.label}
          type="button"
          onClick={item.action}
          className={`min-h-32 rounded-[4px] border p-4 text-left transition-all hover:border-primary hover:bg-primary/5 shadow-sm cursor-pointer ${
            index === 0 ? 'border-primary/40 bg-primary/5' : 'border-border-soft bg-surface'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
            {item.label}
          </span>
          <span className="mt-2 block line-clamp-2 text-sm font-bold text-foreground">
            {item.value}
          </span>
          <span className="mt-2 block text-xs text-muted-copy font-medium">{item.detail}</span>
        </button>
      ))}
    </section>
  );
};
