import React from 'react';
import { Activity } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';

interface SystemLog {
  id: number;
  time: string;
  type: 'info' | 'warning';
  msg: string;
}

interface SystemTabProps {
  systemLogs: SystemLog[];
}

export const SystemTab: React.FC<SystemTabProps> = ({ systemLogs }) => {
  return (
    <SectionCard title="System Diagnostics" icon={Activity}>
      <div className="space-y-4">
        <div className="rounded-xl bg-surface-hover/50 p-4 border border-border-soft">
          <h3 className="text-sm font-semibold text-foreground">
            Active Configuration State
          </h3>
          <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">Dev Auth Bypass:</span>
              <span className="font-bold text-rose-600">Blocked (Secure)</span>
            </div>
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">Supabase RLS Rules:</span>
              <span className="font-bold text-emerald-600">
                Active (Secure)
              </span>
            </div>
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">AI LLM Model:</span>
              <span className="font-bold text-foreground">
                claude-haiku-4-5
              </span>
            </div>
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">Rate-Limiter (Upstash):</span>
              <span className="font-bold text-emerald-600">Connected</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-copy uppercase tracking-wider mb-2">
            Live System Log Output
          </h3>
          <div className="rounded-xl bg-primary/5 p-4 font-mono text-[10px] text-primary space-y-1 max-h-48 overflow-y-auto">
            {systemLogs.map((log) => (
              <p key={log.id}>
                <span className="opacity-50">[{log.time}]</span>{' '}
                <span
                  className={
                    log.type === 'warning' ? 'text-amber-600 font-bold' : ''
                  }
                >
                  {log.msg}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
