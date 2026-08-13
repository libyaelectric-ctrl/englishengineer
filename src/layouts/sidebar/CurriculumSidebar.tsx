import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';
import { SkillSidebar } from './SkillSidebar';
import type { SidebarConfig } from './sidebar.config';

export function CurriculumSidebar() {
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const config: SidebarConfig = {
    skill: 'curriculum',
    pathLabel: copy.yourPath,
    pathDescription: copy.trackJourney,
    tabs: [
      { label: copy.todayTasks, active: true },
      { label: copy.thisWeek },
      { label: copy.fullCurriculum },
      { label: copy.reviewQueue, badge: 0 },
    ],
    stats: [
      { label: copy.weeklyGoal, value: '85%', color: 'text-green-500' },
      { label: copy.readiness, value: copy.high },
    ],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}
