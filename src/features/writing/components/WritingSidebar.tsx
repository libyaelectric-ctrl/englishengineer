import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/layouts/sidebar/sidebar.config';
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
  const total = missions.length;
  const remaining = total - done;

  const config: SidebarConfig = {
    skill: 'writing',
    pathLabel: 'Writing Path',
    pathDescription: 'Technical writing, RFI responses and engineering documentation.',
    currentLevel: `${done}/${total} Missions`,
    totalItems: total,
    stats: [
      {
        label: 'Remaining',
        value: `${remaining} missions`,
        color: remaining > 0 ? 'text-amber-500' : 'text-green-500',
      },
      { label: 'Auto Fixes', value: `${autoFixesUsed}`, color: 'text-cyan-500' },
    ],
    progressBars: [
      { label: copy.progress, value: done, max: total, showPercent: true, color: 'primary' },
    ],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}
