import { Section } from '@/layouts/sidebar/SidebarComponents';
import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/layouts/sidebar/sidebar.config';
import { Monitor, Smartphone } from 'lucide-react';

import { useAuthStore } from '@/features/auth';
import { SkillEntryBrief } from '@/features/learning-orchestrator';
import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';
import type { SkillName } from '@/features/profile/profile.types';

/** Map CEFR target levels to a readiness score (0-100). */
const LEVEL_READINESS: Record<string, number> = {
  A1: 15,
  A2: 30,
  B1: 50,
  B2: 70,
  C1: 85,
  C2: 95,
};

/** Detect device type from user agent (simplified). */
function getDeviceLabel(): string {
  const ua = navigator?.userAgent ?? '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iPhone';
  if (/Android/i.test(ua)) return 'Android Device';
  if (/Macintosh|Mac OS/i.test(ua)) return 'MacBook';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Linux/i.test(ua)) return 'Linux Device';
  return 'Desktop';
}

export function ProfileSidebar() {
  const { currentUser } = useAuthStore();
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;

  const roleLabel = currentUser?.role || copy.seniorEngineer;
  const readinessScore = currentUser?.targetLevel
    ? (LEVEL_READINESS[currentUser.targetLevel.toUpperCase()] ?? 50)
    : 50;
  const location = currentUser?.location || '';
  const deviceLabel = getDeviceLabel();
  const sessionLabel = location ? `${deviceLabel} - ${location}` : deviceLabel;

  const config: SidebarConfig = {
    header: <SkillEntryBrief skill={'profile' as SkillName} compact={true} />,
    skill: 'profile',
    pathLabel: copy.competencyIndex,
    pathDescription: copy.profileDesc,
    currentLevel: roleLabel,
    stats: [
      { label: copy.name, value: currentUser?.displayName || copy.email || copy.name },
      { label: copy.plan, value: roleLabel, color: 'text-amber-500' },
    ],
    progressBars: [{ label: copy.readiness, value: readinessScore, max: 100, color: '#3b82f6' }],
    actions: [],
    custom: (
      <>
        <Section title={copy.securityLogs}>
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-500/10">
                <Monitor className="h-3.5 w-3.5 text-green-500" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-[11px] font-medium text-foreground">{sessionLabel}</span>
                <span className="text-[10px] text-green-500">{copy.currentSession}</span>
              </div>
              <span className="text-[10px] text-muted-copy">{copy.now}</span>
            </div>
            {currentUser?.createdAt && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted-copy/10">
                  <Smartphone className="h-3.5 w-3.5 text-muted-copy" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-[11px] font-medium text-muted-copy">
                    {copy.memberSince}
                  </span>
                  <span className="text-[10px] text-muted-copy">
                    {new Date(currentUser.createdAt).toLocaleDateString(
                      language === 'tr' ? 'tr-TR' : 'en-US',
                      { year: 'numeric', month: 'short' }
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Section>
      </>
    ),
  };

  return <SkillSidebar config={config} />;
}
