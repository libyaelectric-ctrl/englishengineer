import { BarChart3, Clock3, Coins, Gauge, RefreshCw, Shield } from 'lucide-react';

import { useCallback, useEffect, useState } from 'react';

import { SectionCard } from '@/shared/components/SectionCard';

import { useAuthStore } from '@/features/auth';

import {
  type AiAdminAnalytics,
  type AiAnalyticsData,
  AiAnalyticsService,
} from './ai-analytics.service';

const formatCost = (usd: number): string => `$${usd.toFixed(4)}`;

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
};

const isoDate = (date: Date): string => date.toISOString().split('T')[0];

const buildLastSevenDays = (
  byDay: AiAnalyticsData['byDay']
): Array<{ date: string; count: number }> => {
  const counts = new Map(byDay.map((d) => [d.date, d.count]));
  const days: Array<{ date: string; count: number }> = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
    const key = isoDate(date);
    days.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return days;
};

const shortDayLabel = (date: string): string => {
  const [year, month, day] = date.split('T')[0].split('-');
  void month;
  void year;
  return day;
};

const quotaPercent = (data: AiAnalyticsData): number => {
  const activeLimit = data.limits.daily ?? data.limits.monthly;
  if (!activeLimit) return 0;
  return Math.min(100, Math.round((data.limits.used / activeLimit) * 100));
};

export const AiAnalyticsCard = () => {
  const userRole = useAuthStore((s) => s.currentUser?.role);
  const [analytics, setAnalytics] = useState<AiAnalyticsData | null>(null);
  const [adminAnalytics, setAdminAnalytics] = useState<AiAdminAnalytics | null>(null);

  const load = useCallback(async () => {
    const data = await AiAnalyticsService.fetch();
    setAnalytics(data);
    if (userRole === 'admin') {
      setAdminAnalytics(await AiAnalyticsService.fetchAdmin());
    }
  }, [userRole]);

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await AiAnalyticsService.fetch();
      if (!active) return;
      setAnalytics(data);
      if (userRole === 'admin') {
        const admin = await AiAnalyticsService.fetchAdmin();
        if (active) setAdminAnalytics(admin);
      }
    })();
    return () => {
      active = false;
    };
  }, [userRole]);

  if (!analytics) return null;

  const isAdmin = userRole === 'admin';
  const days = buildLastSevenDays(analytics.byDay);
  const maxDayCount = Math.max(1, ...days.map((d) => d.count));
  const topOperations = analytics.byOperation.slice(0, 4);
  const quotaBarVisible = analytics.planId !== '';

  return (
    <SectionCard
      title="AI Kullanım Analitiği"
      subtitle="Bu kullanıcının AI tüketim özeti (tahmini)"
      icon={BarChart3}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {quotaBarVisible && (
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wide text-muted-copy">
                  Kotanız ({analytics.planId})
                </span>
                <span className="font-mono text-foreground">
                  {analytics.limits.used} / {analytics.limits.daily ?? analytics.limits.monthly}
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                    {analytics.limits.remaining} kaldı
                  </span>
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500"
                  style={{ width: `${quotaPercent(analytics)}%` }}
                />
              </div>
            </div>
          )}
          <button
            onClick={load}
            title="Yenile"
            className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-card)] bg-surface-hover px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-primary/15 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Yenile
          </button>
        </div>

        {analytics.totalRequests === 0 ? (
          <p className="text-xs text-muted-copy">
            Henüz AI kullanımı yok. Ders üretin veya AI koçu kullanın, burada sayılacak.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-[var(--radius-card)] bg-surface-hover p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-copy">
                  <Gauge className="h-3 w-3" />
                  İstek
                </div>
                <p className="mt-1 text-lg font-extrabold text-foreground">
                  {analytics.totalRequests}
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] bg-surface-hover p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-copy">
                  <Clock3 className="h-3 w-3" />
                  Ort. Süre
                </div>
                <p className="mt-1 text-lg font-extrabold text-foreground">
                  {formatDuration(analytics.averageDurationMs)}
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] bg-surface-hover p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-copy">
                  <Coins className="h-3 w-3" />
                  Token
                </div>
                <p className="mt-1 text-lg font-extrabold text-foreground">
                  {analytics.totalEstimatedTokens.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] bg-surface-hover p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-copy">
                  <BarChart3 className="h-3 w-3" />
                  Maliyet
                </div>
                <p className="mt-1 text-lg font-extrabold text-foreground">
                  {formatCost(analytics.estimatedCostUsd)}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-copy">
                Son 7 Gün
              </p>
              <div className="flex items-end gap-1.5">
                {days.map((day) => (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-muted-copy">{day.count}</span>
                    <div
                      className="w-full rounded-t-[var(--radius-sm)] bg-gradient-to-t from-primary/70 to-primary"
                      style={{
                        height: `${Math.max(4, Math.round((day.count / maxDayCount) * 64))}px`,
                      }}
                      title={`${day.count} istek`}
                    />
                    <span className="text-[9px] text-muted-copy">{shortDayLabel(day.date)}</span>
                  </div>
                ))}
              </div>
            </div>

            {topOperations.length > 0 && (
              <div className="space-y-1">
                {topOperations.map((op) => (
                  <div
                    key={op.operation}
                    className="flex items-center justify-between rounded-[var(--radius-card)] bg-surface-hover/60 px-3 py-1.5 text-xs"
                  >
                    <span className="font-mono text-muted-copy">{op.operation}</span>
                    <span className="font-bold text-foreground">{op.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isAdmin && adminAnalytics && adminAnalytics.totalRequests > 0 && (
          <div className="rounded-[var(--radius-card)] border border-amber-500/30 bg-amber-50/40 p-3 dark:bg-amber-950/20">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              <Shield className="h-3 w-3" />
              Yönetici Özeti (tüm kullanıcılar)
            </div>
            <div className="mt-1 flex flex-wrap gap-4 text-xs">
              <span className="text-foreground">
                Toplam istek: <b className="font-extrabold">{adminAnalytics.totalRequests}</b>
              </span>
              <span className="text-foreground">
                Toplam token:{' '}
                <b className="font-extrabold">
                  {adminAnalytics.totalEstimatedTokens.toLocaleString('tr-TR')}
                </b>
              </span>
              <span className="text-foreground">
                Tahmini maliyet:{' '}
                <b className="font-extrabold">{formatCost(adminAnalytics.estimatedCostUsd)}</b>
              </span>
            </div>
            {adminAnalytics.topUsers.slice(0, 3).map((user) => (
              <div
                key={user.userId}
                className="mt-1 flex items-center justify-between rounded-[var(--radius-card)] bg-surface-hover/60 px-3 py-1.5 text-xs"
              >
                <span className="font-mono text-muted-copy break-all pr-2">{user.userId}</span>
                <span className="font-bold text-foreground">
                  {user.totalRequests} · {user.totalEstimatedTokens}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
};
