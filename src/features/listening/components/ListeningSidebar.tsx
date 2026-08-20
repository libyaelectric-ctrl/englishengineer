import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/layouts/sidebar/sidebar.config';
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
  const total = missions.length;
  const remaining = total - done;
  const durationMin = Math.round(timeSpentSeconds / 60);

  const config: SidebarConfig = {
    skill: 'listening',
    pathLabel: 'Listening Path',
    pathDescription: 'Engineering site audio and technical meeting comprehension.',
    currentLevel: `${done}/${total} Missions`,
    totalItems: total,
    stats: [
      {
        label: 'Remaining',
        value: `${remaining} missions`,
        color: remaining > 0 ? 'text-amber-500' : 'text-green-500',
      },
      { label: copy.duration, value: `${durationMin} min`, color: 'text-cyan-500' },
    ],
    progressBars: [
      { label: copy.progress, value: done, max: total, showPercent: true, color: 'primary' },
    ],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}
