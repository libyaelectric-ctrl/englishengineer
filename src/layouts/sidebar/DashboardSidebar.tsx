import { Bot, Globe, Target, Users, Zap } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';
import { useLocalizationStore } from '@/features/localization';
import { RIGHT_SIDEBAR_COPY } from '@/features/localization/translations/rightsidebar.translations';

import { Action, Progress, Section } from './SidebarComponents';

export function DashboardSidebar() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const subscription = useBillingStore((state) => state.subscription);

  const language = useLocalizationStore((s) => s.language);
  const copy = RIGHT_SIDEBAR_COPY[language] ?? RIGHT_SIDEBAR_COPY.en;

  const planName = subscription?.planId || 'junior';
  const isFree = planName === 'junior';
  const userInitials = (currentUser?.displayName || 'Eng')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

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
          <Action
            icon={Target}
            label={copy.placementTest}
            onClick={() => navigate('/placement')}
          />
          <Action icon={Bot} label={copy.aiCopilotTools} onClick={() => navigate('/tools')} />
          <Action icon={Users} label={copy.teamManagement} onClick={() => navigate('/team')} />
        </div>
      </Section>
    </>
  );
}
