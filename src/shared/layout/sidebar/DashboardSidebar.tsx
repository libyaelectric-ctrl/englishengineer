import { useNavigate } from 'react-router-dom';
import { Section, Progress, Action } from './SidebarComponents';

export function DashboardSidebar() {
  const navigate = useNavigate();
  return (
    <>
      <Section title="AI Usage (Team)">
        <div>
          <div className="flex justify-between text-[10px] text-muted-copy mb-1">
            <span>Tokens Used</span>
            <span className="font-bold text-amber-500">85% (850k/1M)</span>
          </div>
          <Progress value={85} max={100} color="#f59e0b" />
          <button className="mt-3 w-full rounded-md bg-amber-500/10 py-1.5 text-[10px] font-bold text-amber-500 hover:bg-amber-500/20 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </Section>

      <Section title="Active Members">
        <div className="flex items-center gap-2 py-1">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface">
              ÖE
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-green-500" />
          </div>
          <div className="relative -ml-3">
            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface">
              AI
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-green-500 pulse-dot" />
          </div>
          <div className="ml-2 text-xs font-medium text-muted-copy">
            2 Online
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
            icon="🤖"
            label="New AI Tool"
            onClick={() => navigate('/tools')}
          />
          <Action
            icon="👥"
            label="Invite Team"
            onClick={() => navigate('/team')}
          />
        </div>
      </Section>
    </>
  );
}
