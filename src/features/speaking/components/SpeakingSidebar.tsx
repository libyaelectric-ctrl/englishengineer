import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import { createMissionSidebarConfig } from '@/layouts/sidebar/createMissionSidebarConfig';
import { useShallow } from 'zustand/shallow';

import { SIDEBAR_SKILL_COPY } from '@/shared/localization/translations/rightsidebar.translations';

import { useLocalizationStore } from '@/features/localization';
import { useSpeakingStore } from '@/features/speaking';

export function SpeakingSidebar() {
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const { missions, completedMissions, recordingSeconds } = useSpeakingStore(
    useShallow((s) => ({
      missions: s.missions,
      completedMissions: s.completedMissions,
      recordingSeconds: s.recordingSeconds,
    }))
  );
  const done = Object.keys(completedMissions).length;
  const recordingMin = Math.round(recordingSeconds / 60);

  const config = createMissionSidebarConfig({
    skill: 'speaking',
    pathLabel: 'Speaking Path',
    pathDescription: 'Roleplay simulations and defense scenario practice.',
    done,
    total: missions.length,
    secondStatLabel: 'Recording',
    secondStatValue: `${recordingMin} min`,
    copy,
  });

  return <SkillSidebar config={config} />;
}
