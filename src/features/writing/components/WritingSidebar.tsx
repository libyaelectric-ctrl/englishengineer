import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import { createMissionSidebarConfig } from '@/layouts/sidebar/createMissionSidebarConfig';
import { useShallow } from 'zustand/shallow';

import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';
import { useWritingStore } from '@/features/writing';

export function WritingSidebar() {
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const { missions, completedMissions, autoFixesUsed } = useWritingStore(
    useShallow((s) => ({
      missions: s.missions,
      completedMissions: s.completedMissions,
      autoFixesUsed: s.autoFixesUsed,
    }))
  );
  const done = Object.keys(completedMissions).length;

  const config = createMissionSidebarConfig({
    skill: 'writing',
    pathLabel: 'Writing Path',
    pathDescription: 'Technical writing, RFI responses and engineering documentation.',
    done,
    total: missions.length,
    secondStatLabel: 'Auto Fixes',
    secondStatValue: `${autoFixesUsed}`,
    copy,
  });

  return <SkillSidebar config={config} />;
}
