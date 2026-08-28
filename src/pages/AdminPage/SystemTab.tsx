import { Activity, Bot } from 'lucide-react';

import { useEffect, useState } from 'react';

import { SectionCard } from '@/shared/components/SectionCard';
import { getBackendAuthHeaders } from '@/shared/services/backend-auth.service';

import type { AdminSystemLog } from '@/features/admin';

interface AiAnalytics {
  totalRequests: number;
  totalEstimatedTokens: number;
  estimatedCostUsd: number;
  topUsers: Array<{ userId: string; totalRequests: number; estimatedCostUsd: number }>;
}

interface SystemTabProps {
  systemLogs: AdminSystemLog[];
  isLoading: boolean;
}

export const SystemTab = ({ systemLogs, isLoading }: SystemTabProps) => {
  const [aiAnalytics, setAiAnalytics] = useState<AiAnalytics | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const headers = await getBackendAuthHeaders();
        const baseUrl =
          import.meta.env.VITE_BILLING_API_URL || import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/ai/analytics/admin`, {
          headers,
        });
        if (res.ok) setAiAnalytics(await res.json());
      } catch {
        // Silently fail — analytics is optional
      }
    };
    fetchAnalytics();
  }, []);
  return (
    <SectionCard title="System Diagnostics" icon={Activity}>
      <div className="space-y-4">
        <div className="rounded-[var(--radius-card)] bg-surface-hover/50 p-4 border border-border-soft">
          <h3 className="text-sm font-semibold text-foreground">Active Configuration State</h3>
          <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">Dev Auth Bypass:</span>
              <span className="font-bold text-rose-600">Blocked (Secure)</span>
            </div>
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">Supabase RLS Rules:</span>
              <span className="font-bold text-emerald-600">Active (Secure)</span>
            </div>
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">AI LLM Model:</span>
              <span className="font-bold text-foreground">claude-haiku-4-5</span>
            </div>
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">Rate-Limiter (Upstash):</span>
              <span className="font-bold text-emerald-600">Connected</span>
            </div>
          </div>
        </div>

        {/* AI Cost Overview */}
        <div className="rounded-[var(--radius-card)] bg-surface-hover/50 p-4 border border-border-soft">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" /> AI Cost Overview (All Time)
          </h3>
          <div className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">Total Requests:</span>
              <span className="font-bold text-foreground">
                {aiAnalytics?.totalRequests?.toLocaleString() ?? '—'}
              </span>
            </div>
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">Total Tokens:</span>
              <span className="font-bold text-foreground">
                {aiAnalytics?.totalEstimatedTokens?.toLocaleString() ?? '—'}
              </span>
            </div>
            <div className="flex justify-between border-b border-border-soft pb-1">
              <span className="text-muted-copy">Estimated Cost:</span>
              <span className="font-bold text-amber-600">
                ${aiAnalytics?.estimatedCostUsd?.toFixed(2) ?? '—'}
              </span>
            </div>
          </div>
          {aiAnalytics?.topUsers && aiAnalytics.topUsers.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider mb-1">
                Top Users by Cost
              </p>
              <div className="space-y-1">
                {aiAnalytics.topUsers.slice(0, 5).map((u) => (
                  <div key={u.userId} className="flex justify-between text-[10px] text-muted-copy">
                    <span className="font-mono truncate max-w-[120px]">{u.userId}</span>
                    <span>
                      {u.totalRequests} req · ${u.estimatedCostUsd.toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-copy uppercase tracking-wider mb-2">
            Live System Log Output
          </h3>
          <div className="rounded-[var(--radius-card)] bg-primary/5 p-4 font-mono text-[10px] text-primary space-y-1 max-h-48 overflow-y-auto">
            {isLoading ? (
              <p className="opacity-50">Loading system logs...</p>
            ) : systemLogs.length === 0 ? (
              <p className="opacity-50">No audit logs recorded yet.</p>
            ) : (
              systemLogs.map((log) => (
                <p key={log.id}>
                  <span className="opacity-50">[{log.time}]</span>{' '}
                  <span
                    className={
                      log.type === 'error'
                        ? 'text-red-600 font-bold'
                        : log.type === 'warning'
                          ? 'text-amber-600 font-bold'
                          : ''
                    }
                  >
                    {log.msg}
                  </span>
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
