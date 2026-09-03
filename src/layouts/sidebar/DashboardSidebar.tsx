import { useShallow } from 'zustand/shallow';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';
import { useLocalizationStore } from '@/features/localization';
import {
  RIGHT_SIDEBAR_COPY,
  SIDEBAR_SKILL_COPY,
} from '@/features/localization/translations/rightsidebar.translations';

import { Progress, Section, Stat } from './SidebarComponents';
import {
  ActionsSection,
  PlanSection,
  WorkspaceSection,
} from './components/DashboardSidebarSections';

export function DashboardSidebar() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const subscription = useBillingStore((s) => s.subscription);
  const lState = useLearningStore(
    useShallow((s) => ({ streak: s.streak, xp: s.xp, level: s.level, missions: s.missions }))
  );
  const language = useLocalizationStore((s) => s.language);
  const copy = RIGHT_SIDEBAR_COPY[language] ?? RIGHT_SIDEBAR_COPY.en;
  const sCopy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const isFree = (subscription?.planId || 'free') === 'free' || subscription?.planId === 'junior';
  const totalM = lState.missions.length;
  const compM = lState.missions.filter((m) => m.status === 'completed').length;

  const planCopy = {
    upgrade: copy.upgrade,
    freePlan: copy.freePlan,
    proPlan: copy.proPlan,
    enterprisePlan: copy.enterprisePlan,
    betaNotice: copy.betaNotice,
  };

  return (
    <>
      <PlanSection copy={planCopy} isFree={isFree} navigate={navigate} />
      <WorkspaceSection
        userInitials={(currentUser?.displayName || 'Eng')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()}
        displayName={currentUser?.displayName || 'Engineer'}
      />
      <Section title={sCopy.yourPath}>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium">Level {lState.level}</span>
            <span className="font-bold text-primary">{lState.xp} XP</span>
          </div>
          <Progress value={lState.level} max={100} color="var(--color-primary)" />
          <div className="grid grid-cols-2 gap-2">
            <Stat
              label={sCopy.weeklyGoal}
              value={`${totalM > 0 ? Math.round((compM / totalM) * 100) : 0}%`}
              color={compM / totalM >= 0.7 ? 'text-green-500' : 'text-amber-500'}
            />
            <Stat
              label={sCopy.readiness}
              value={lState.level >= 80 ? sCopy.high : lState.level >= 50 ? 'Medium' : 'Low'}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-copy">
            <span>🔥 {lState.streak} day streak</span>
            <span>
              {compM}/{totalM} missions
            </span>
          </div>
        </div>
      </Section>
      <ActionsSection navigate={navigate} />
    </>
  );
}
