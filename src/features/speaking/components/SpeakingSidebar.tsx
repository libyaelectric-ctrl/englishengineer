import { useSpeakingStore } from '@/features/speaking';
import { SkillEntryBrief } from '@/features/learning-orchestrator/SkillEntryBrief';
import { SkillSidebar } from '@/shared/layout/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/shared/layout/sidebar/sidebar.config';

const log = (_page: string, _action: string, _details: string) => {};

export function SpeakingSidebar() {
  const { missions } = useSpeakingStore();
  const config: SidebarConfig = {
    header: <SkillEntryBrief skill="speaking" compact={true} />,
    skill: 'speaking',
    pathLabel: 'Speaking Scenarios',
    pathDescription: 'Practice speaking in professional engineering contexts.',
    totalItems: missions.length,
    tabs: missions.slice(0, 6).map((m) => ({
      label: m.title,
      active: m.id === missions[0]?.id,
      badge: m.cefrLevel,
      onClick: () => log('/speaking', 'select', m.title),
    })),
    stats: [
      { label: 'Average', value: '0' },
      { label: 'Best', value: '0' },
      { label: 'Practice', value: '0 min' },
    ],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}
