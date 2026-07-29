import { useAuthStore } from '@/features/auth';
import { SkillEntryBrief } from '@/features/learning-orchestrator/SkillEntryBrief';
import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import { Section } from '@/layouts/sidebar/SidebarComponents';
import type { SidebarConfig } from '@/layouts/sidebar/sidebar.config';
import type { SkillName } from '@/features/profile/profile.types';

export function ProfileSidebar() {
  const { currentUser } = useAuthStore();
  const config: SidebarConfig = {
    header: <SkillEntryBrief skill={'profile' as SkillName} compact={true} />,
    skill: 'profile',
    pathLabel: 'Competency Index',
    pathDescription: 'Your role and readiness score.',
    currentLevel: 'Senior Engineer',
    stats: [
      { label: 'Name', value: currentUser?.displayName || 'User' },
      { label: 'Plan', value: 'Pro', color: 'text-amber-500' },
    ],
    progressBars: [
      { label: 'Readiness', value: 85, max: 100, color: '#3b82f6' },
    ],
    actions: [],
    custom: (
      <>
        <Section title="Security Logs">
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-foreground">
                  MacBook Pro - Istanbul
                </span>
                <span className="text-[10px] text-green-500">
                  Current Session
                </span>
              </div>
              <span className="text-[10px] text-muted-copy">Now</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-muted-copy">
                  iPhone 14 - Ankara
                </span>
              </div>
              <span className="text-[10px] text-muted-copy">2h ago</span>
            </div>
          </div>
        </Section>
      </>
    ),
  };

  return <SkillSidebar config={config} />;
}
