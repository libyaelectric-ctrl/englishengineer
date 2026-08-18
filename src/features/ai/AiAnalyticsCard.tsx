import { BarChart3, Clock3, Coins, Gauge } from 'lucide-react';

import { useEffect, useState } from 'react';

import { SectionCard } from '@/shared/components/SectionCard';

import { type AiAnalyticsData, AiAnalyticsService } from './ai-analytics.service';

const formatCost = (usd: number): string => `$${usd.toFixed(4)}`;

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
};

export const AiAnalyticsCard = () => {
  const [analytics, setAnalytics] = useState<AiAnalyticsData | null>(null);

  useEffect(() => {
    let active = true;
    AiAnalyticsService.fetch().then((data) => {
      if (active) setAnalytics(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!analytics) return null;

  const topOperations = analytics.byOperation.slice(0, 4);

  return (
    <SectionCard
      title="AI Kullanım Analitiği"
      subtitle="Bu kullanıcının AI tüketim özeti (tahmini)"
      icon={BarChart3}
    >
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
    </SectionCard>
  );
};
