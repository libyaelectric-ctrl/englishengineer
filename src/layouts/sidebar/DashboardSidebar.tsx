import { Bot, Globe, Target, Users, Zap } from 'lucide-react';
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

import { Action, Progress, Section, Stat } from './SidebarComponents';

export function DashboardSidebar() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const subscription = useBillingStore((state) => state.subscription);
  const learningState = useLearningStore(
    useShallow((s) => ({
      streak: s.streak,
      xp: s.xp,
      level: s.level,
      missions: s.missions,
    }))
  );

  const language = useLocalizationStore((s) => s.language);
  const copy = RIGHT_SIDEBAR_COPY[language] ?? RIGHT_SIDEBAR_COPY.en;
  const skillCopy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;

  const planName = subscription?.planId || 'free';
  const isFree = planName === 'free' || planName === 'junior';
  const userInitials = (currentUser?.displayName || 'Eng')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const totalMissions = learningState.missions.length;
  const completedMissions = learningState.missions.filter((m) => m.status === 'completed').length;
  const weeklyGoalProgress =
    totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
  const readinessLabel =
    learningState.level >= 80 ? skillCopy.high : learningState.level >= 50 ? 'Medium' : 'Low';

  return (
    <>
      <Section title={copy.aiCopilotPlan}>
        <div>
          <div className="flex justify-between text-xs text-muted-copy mb-1 font-medium">
            <span>{copy.monthlyAllowance}</span>
            <span className="font-bold text-primary">
              {isFree ? copy.dailyFree : copy.monthlyPro}
            </span>
          </div>
          <Progress value={isFree ? 33 : 10} max={100} color="var(--color-primary)" />
          <button
            onClick={() => navigate('/billing')}
            className="mt-3 w-full cursor-pointer rounded-[var(--radius-card)] bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all border border-primary/20"
          >
            {isFree ? copy.upgradeToPro : copy.manageSubscription}
          </button>
        </div>
      </Section>

      <Section title={copy.activeWorkspace}>
        <div className="flex items-center gap-2 py-1">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold ring-2 ring-surface">
              {userInitials}
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success" />
          </div>
          <div className="relative -ml-2">
            <div className="h-8 w-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface">
              AI
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success pulse-dot" />
          </div>
          <div className="ml-2 text-xs font-semibold text-foreground">
            {currentUser?.displayName || 'Engineer'} ({copy.active})
          </div>
        </div>
      </Section>

      <Section title={skillCopy.yourPath}>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-copy font-medium">Level {learningState.level}</span>
            <span className="font-bold text-primary">{learningState.xp} XP</span>
          </div>
          <Progress value={learningState.level} max={100} color="var(--color-primary)" />
          <div className="grid grid-cols-2 gap-2">
            <Stat
              label={skillCopy.weeklyGoal}
              value={`${weeklyGoalProgress}%`}
              color={weeklyGoalProgress >= 70 ? 'text-green-500' : 'text-amber-500'}
            />
            <Stat label={skillCopy.readiness} value={readinessLabel} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-copy">
            <span>🔥 {learningState.streak} day streak</span>
            <span>
              {completedMissions}/{totalMissions} missions
            </span>
          </div>
        </div>
      </Section>

      <Section title={copy.quickActions}>
        <div className="space-y-1.5">
          <Action
            icon={Zap}
            label={copy.commandPalette}
            onClick={() =>
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
            }
            variant="primary"
          />
          <Action
            icon={Globe}
            label={copy.instantTranslator}
            onClick={() => navigate('/translator')}
          />
          <Action icon={Target} label={copy.placementTest} onClick={() => navigate('/placement')} />
          <Action icon={Bot} label={copy.aiCopilotTools} onClick={() => navigate('/tools/ai')} />
          <Action icon={Users} label={copy.teamManagement} onClick={() => navigate('/team')} />
        </div>
      </Section>
    </>
  );
}
