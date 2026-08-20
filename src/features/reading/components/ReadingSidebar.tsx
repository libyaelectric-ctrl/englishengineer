import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/layouts/sidebar/sidebar.config';
import { useShallow } from 'zustand/shallow';

import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';
import { useReadingStore } from '@/features/reading';

export function ReadingSidebar() {
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const { missions, completedMissions, clickedVocab } = useReadingStore(
    useShallow((s) => ({
      missions: s.missions,
      completedMissions: s.completedMissions,
      clickedVocab: s.clickedVocab,
    }))
  );
  const done = Object.keys(completedMissions).length;
  const total = missions.length;
  const remaining = total - done;
  const uniqueVocab = new Set(clickedVocab).size;

  const config: SidebarConfig = {
    skill: 'reading',
    pathLabel: 'Reading Path',
    pathDescription: 'Engineering documentation and technical reading comprehension.',
    currentLevel: `${done}/${total} Missions`,
    totalItems: total,
    stats: [
      {
        label: copy.read,
        value: `${remaining} remaining`,
        color: remaining > 0 ? 'text-amber-500' : 'text-green-500',
      },
      { label: 'Vocab Clicked', value: `${uniqueVocab} terms`, color: 'text-cyan-500' },
    ],
    progressBars: [
      { label: copy.progress, value: done, max: total, showPercent: true, color: 'primary' },
    ],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}
