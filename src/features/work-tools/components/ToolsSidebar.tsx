import { SkillSidebar } from '@/shared/layout/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/shared/layout/sidebar/sidebar.config';

export function ToolsSidebar() {
  const config: SidebarConfig = {
    skill: 'tools',
    pathLabel: 'Tools',
    pathDescription: 'Access your engineering tools.',
    tabs: ['Work Tools', 'Quick Tools', 'AI Copilot'].map((t) => ({ label: t })),
    stats: [],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}