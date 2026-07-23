import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';
import { Section, Progress, Action } from './SidebarComponents';

export function DashboardSidebar() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const subscription = useBillingStore((state) => state.subscription);

  const planName = subscription?.planId || 'free';
  const isFree = planName === 'free';
  const userInitials = (currentUser?.displayName || 'Eng')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <Section title="AI Copilot & Plan">
        <div>
          <div className="flex justify-between text-xs text-muted-copy mb-1 font-medium">
            <span>Monthly AI Allowance</span>
            <span className="font-bold text-primary">
              {isFree ? '3 / 3 Daily' : '300 / 300 Monthly'}
            </span>
          </div>
          <Progress
            value={isFree ? 33 : 10}
            max={100}
            color="var(--color-primary)"
          />
          <button
            onClick={() => navigate('/billing')}
            className="mt-3 w-full cursor-pointer rounded-lg bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all border border-primary/20"
          >
            {isFree ? 'Upgrade to Pro' : 'Manage Subscription'}
          </button>
        </div>
      </Section>

      <Section title="Active Workspace">
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
            {currentUser?.displayName || 'Engineer'} (Active)
          </div>
        </div>
      </Section>

      <Section title="Quick Actions">
        <div className="space-y-1.5">
          <Action
            icon="⚡"
            label="Command Palette (Cmd+K)"
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'k', metaKey: true })
              )
            }
            variant="primary"
          />
          <Action
            icon="🎯"
            label="Placement Level Test"
            onClick={() => navigate('/placement')}
          />
          <Action
            icon="🤖"
            label="AI Copilot & Tools"
            onClick={() => navigate('/tools')}
          />
          <Action
            icon="👥"
            label="Team Management"
            onClick={() => navigate('/team')}
          />
        </div>
      </Section>
    </>
  );
}
