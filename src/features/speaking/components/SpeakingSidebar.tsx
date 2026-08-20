import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/layouts/sidebar/sidebar.config';
import { useShallow } from 'zustand/shallow';

import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';
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
  const total = missions.length;
  const remaining = total - done;
  const recordingMin = Math.round(recordingSeconds / 60);

  const config: SidebarConfig = {
    skill: 'speaking',
    pathLabel: 'Speaking Path',
    pathDescription: 'Roleplay simulations and defense scenario practice.',
    currentLevel: `${done}/${total} Missions`,
    totalItems: total,
    stats: [
      {
        label: 'Remaining',
        value: `${remaining} missions`,
        color: remaining > 0 ? 'text-amber-500' : 'text-green-500',
      },
      { label: 'Recording', value: `${recordingMin} min`, color: 'text-cyan-500' },
    ],
    progressBars: [
      { label: copy.progress, value: done, max: total, showPercent: true, color: 'primary' },
    ],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}
