import { SkillEntryBrief } from '@/features/learning-orchestrator/SkillEntryBrief';
import { SkillSidebar } from '@/shared/layout/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/shared/layout/sidebar/sidebar.config';
import type { SkillName } from '@/features/profile/profile.types';

export function ToolsSidebar() {
  const config: SidebarConfig = {
    header: <SkillEntryBrief skill={'tools' as SkillName} compact={true} />,
    skill: 'tools',
    pathLabel: 'Tools',
    pathDescription: 'Access your engineering tools.',
    tabs: ['Work Tools', 'Quick Tools', 'AI Copilot'].map((t) => ({
      label: t,
    })),
    stats: [],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}
