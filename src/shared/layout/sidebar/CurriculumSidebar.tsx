import { SkillSidebar } from './SkillSidebar';
import type { SidebarConfig } from './sidebar.config';

export function CurriculumSidebar() {
  const config: SidebarConfig = {
    skill: 'curriculum',
    pathLabel: 'Your Path',
    pathDescription: 'Track your learning journey across all skills.',
    tabs: [
      { label: "Today's Tasks", active: true },
      { label: 'This Week' },
      { label: 'Full Curriculum' },
      { label: 'Review Queue', badge: 0 },
    ],
    stats: [
      { label: 'Weekly Goal', value: '85%', color: 'text-green-500' },
      { label: 'Readiness', value: 'High' },
    ],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}