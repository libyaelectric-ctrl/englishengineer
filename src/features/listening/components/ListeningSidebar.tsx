import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import { createMissionSidebarConfig } from '@/layouts/sidebar/createMissionSidebarConfig';
import { useShallow } from 'zustand/shallow';

import { useListeningMissionsStore } from '@/features/listening';
import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';

export function ListeningSidebar() {
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const { missions, completedMissions, timeSpentSeconds } = useListeningMissionsStore(
    useShallow((s) => ({
      missions: s.missions,
      completedMissions: s.completedMissions,
      timeSpentSeconds: s.timeSpentSeconds,
    }))
  );
  const done = Object.keys(completedMissions).length;
  const durationMin = Math.round(timeSpentSeconds / 60);

  const config = createMissionSidebarConfig({
    skill: 'listening',
    pathLabel: 'Listening Path',
    pathDescription: 'Engineering site audio and technical meeting comprehension.',
    done,
    total: missions.length,
    secondStatLabel: copy.duration,
    secondStatValue: `${durationMin} min`,
    copy,
  });

  return <SkillSidebar config={config} />;
}
