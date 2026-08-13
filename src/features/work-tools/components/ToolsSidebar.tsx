import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/layouts/sidebar/sidebar.config';

import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';
import { SkillEntryBrief } from '@/features/learning-orchestrator';
import type { SkillName } from '@/features/profile/profile.types';

export function ToolsSidebar() {
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const config: SidebarConfig = {
    header: <SkillEntryBrief skill={'tools' as SkillName} compact={true} />,
    skill: 'tools',
    pathLabel: copy.tools,
    pathDescription: copy.accessTools,
    tabs: [copy.workTools, copy.quickTools, copy.aiCopilot].map((label) => ({
      label,
    })),
    stats: [],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}
