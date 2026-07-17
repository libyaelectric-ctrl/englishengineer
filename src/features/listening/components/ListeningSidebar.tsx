import { useListeningStore } from '@/features/listening';
import { SkillEntryBrief } from '@/features/learning-orchestrator/SkillEntryBrief';
import { SkillSidebar } from '@/shared/layout/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/shared/layout/sidebar/sidebar.config';

const log = (_page: string, _action: string, _details: string) => {};

export function ListeningSidebar() {
  const { missions } = useListeningStore();
  const config: SidebarConfig = {
    header: <SkillEntryBrief skill="listening" compact={true} />,
    skill: 'listening',
    pathLabel: 'Listening Tasks',
    pathDescription:
      'Listen to professional scenarios and improve comprehension.',
    totalItems: missions.length,
    tabs: missions.slice(0, 5).map((m) => ({
      label: m.title,
      active: m.id === missions[0]?.id,
      badge: m.cefrLevel,
      onClick: () => log('/listening', 'select', m.title),
    })),
    stats: [
      { label: 'Site Meetings', value: '—' },
      { label: 'Technical Briefings', value: '—' },
    ],
    actions: [],
  };

  return <SkillSidebar config={config} />;
}
