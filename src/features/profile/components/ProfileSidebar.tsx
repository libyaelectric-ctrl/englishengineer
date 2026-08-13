import { Section } from '@/layouts/sidebar/SidebarComponents';
import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/layouts/sidebar/sidebar.config';

import { useAuthStore } from '@/features/auth';
import { interpolate } from '@/features/localization/interpolate';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';
import { useLocalizationStore } from '@/features/localization';
import { SkillEntryBrief } from '@/features/learning-orchestrator';
import type { SkillName } from '@/features/profile/profile.types';

export function ProfileSidebar() {
  const { currentUser } = useAuthStore();
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const config: SidebarConfig = {
    header: <SkillEntryBrief skill={'profile' as SkillName} compact={true} />,
    skill: 'profile',
    pathLabel: copy.competencyIndex,
    pathDescription: copy.profileDesc,
    currentLevel: copy.seniorEngineer,
    stats: [
      { label: copy.name, value: currentUser?.displayName || copy.name },
      { label: copy.plan, value: 'senior', color: 'text-amber-500' },
    ],
    progressBars: [{ label: copy.readiness, value: 85, max: 100, color: '#3b82f6' }],
    actions: [],
    custom: (
      <>
        <Section title={copy.securityLogs}>
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-foreground">
                  MacBook Pro - Istanbul
                </span>
                <span className="text-[10px] text-green-500">{copy.currentSession}</span>
              </div>
              <span className="text-[10px] text-muted-copy">{copy.now}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-muted-copy">iPhone 14 - Ankara</span>
              </div>
              <span className="text-[10px] text-muted-copy">{interpolate(copy.hoursAgo, { n: 2 })}</span>
            </div>
          </div>
        </Section>
      </>
    ),
  };

  return <SkillSidebar config={config} />;
}
