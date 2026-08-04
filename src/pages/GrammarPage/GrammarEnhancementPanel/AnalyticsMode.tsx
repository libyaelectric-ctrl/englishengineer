import { BarChart3 } from 'lucide-react';

import { useMemo } from 'react';

import { type GrammarRule, type GrammarRuleProgress } from '@/features/grammar';

import { getModuleLabel } from '../GrammarPageHelpers';
import { MiniMetric, PanelShell } from './shared';
import { type RuleWithProgress } from './types';

const getRetention = (progress: GrammarRuleProgress): number => {
  if (!progress.lastUsedAt) return progress.strength;
  const days = Math.max(
    0,
    (Date.now() - new Date(progress.lastUsedAt).getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.max(0, Math.round(progress.strength * Math.exp(-days / 14)));
};

const getCategoryAnalytics = (items: RuleWithProgress[]) => {
  const groups = new Map<string, RuleWithProgress[]>();
  items.forEach((item) => {
    const label = getModuleLabel(item.rule.grammarCategory);
    groups.set(label, [...(groups.get(label) ?? []), item]);
  });
  return [...groups.entries()]
    .map(([category, entries]) => ({
      category,
      total: entries.length,
      mastered: entries.filter((item) => item.status === 'Mastered').length,
      strength: Math.round(
        entries.reduce((sum, item) => sum + item.progress.strength, 0) / entries.length
      ),
    }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 6);
};

export const AnalyticsMode = ({
  selectedProgress,
  rules,
  rulesWithProgress,
}: {
  selectedProgress: GrammarRuleProgress;
  rules: GrammarRule[];
  rulesWithProgress: RuleWithProgress[];
}) => {
  const retention = getRetention(selectedProgress);
  const masteredCount = rulesWithProgress.filter((item) => item.status === 'Mastered').length;
  const cefrEstimate = Math.min(100, Math.round((masteredCount / Math.max(1, rules.length)) * 100));
  const categoryAnalytics = useMemo(
    () => getCategoryAnalytics(rulesWithProgress),
    [rulesWithProgress]
  );

  return (
    <PanelShell
      title="Progress and Memory Analytics"
      subtitle="Retention, CEFR estimate, weekly activity, heatmap, and category mastery distribution."
      icon={BarChart3}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <MiniMetric label="Retention" value={`${retention}%`} />
        <MiniMetric label="CEFR readiness" value={`${cefrEstimate}%`} />
        <MiniMetric
          label="Due rules"
          value={rulesWithProgress.filter((item) => item.progress.reviewStatus === 'Due').length}
        />
        <MiniMetric label="Mastered" value={masteredCount} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[4px] border border-border-soft bg-background p-3">
          <p className="text-xs font-black uppercase tracking-wide">Memory Retention Curve</p>
          <div className="mt-3 h-3 rounded-[4px] bg-surface-hover">
            <div className="h-full rounded-[4px] bg-success" style={{ width: `${retention}%` }} />
          </div>
        </div>
        <div className="rounded-[4px] border border-border-soft bg-background p-3">
          <p className="text-xs font-black uppercase tracking-wide">Daily Activity Heatmap</p>
          <div className="mt-3 grid grid-cols-14 gap-1">
            {Array.from({ length: 56 }).map((_, index) => {
              const intensity = (index + selectedProgress.exposures) % 5;
              return (
                <span
                  key={index}
                  className="h-3 rounded-[2px]"
                  style={{
                    backgroundColor: ['#e5e7eb', '#bbf7d0', '#86efac', '#22c55e', '#15803d'][
                      intensity
                    ],
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {categoryAnalytics.map((item) => (
          <div
            key={item.category}
            className="rounded-[4px] border border-border-soft bg-background p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-bold">{item.category}</p>
              <span className="text-[10px] font-bold text-muted-copy">
                {item.mastered}/{item.total}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-[4px] bg-surface-hover">
              <div
                className="h-full rounded-[4px] bg-primary"
                style={{ width: `${item.strength}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
};
