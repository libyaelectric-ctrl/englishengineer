import { GrammarProgressService, useGrammarStore } from '@/features/grammar';
import { useLearningStore } from '@/core/learning';
import { SkillEntryBrief } from '@/features/learning-orchestrator/SkillEntryBrief';
import { SkillSidebar } from '@/shared/layout/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/shared/layout/sidebar/sidebar.config';

const log = (_page: string, _action: string, _details: string) => {};

export function GrammarSidebar() {
  useLearningStore((s) => s.studySessions.length);
  const g = GrammarProgressService.getSummary(360);
  const { tab, setTab, rules, selectedId } = useGrammarStore();
  const selectedRule = rules.find((r) => r.id === selectedId) ?? rules[0];
  const selectedRuleIndex = selectedRule
    ? rules.findIndex((r) => r.id === selectedRule.id)
    : -1;

  const config: SidebarConfig = {
    header: <SkillEntryBrief skill="grammar" compact={true} />,
    skill: 'grammar',
    pathLabel: 'Your grammar path',
    pathDescription:
      'Move through named topics in order; practice feeds Learning Memory.',
    currentLevel: selectedRule?.cefrLevel,
    totalItems: rules.length,
    tabs: (['New', 'Learning', 'Due', 'Strong'] as const).map((t) => ({
      label: t,
      active: t === tab,
      badge:
        t === 'New'
          ? g.newRules
          : t === 'Learning'
            ? g.learning
            : t === 'Due'
              ? g.due
              : g.strong,
      onClick: () => {
        setTab(t);
        log('/grammar', 'tab', t);
      },
    })),
    stats: [
      { label: 'Tracked', value: g.tracked },
      { label: 'New', value: g.newRules, color: 'text-violet-500' },
    ],
    progressBars: [
      {
        label: 'Strong',
        value: g.strong,
        max: 360,
        color: '#8b5cf6',
        showPercent: true,
      },
      { label: 'Due', value: g.due, max: 360, color: '#e879f9' },
    ],
    actions: [
      {
        icon: '📝',
        label: `Practice ${g.due} due rules`,
        onClick: () => log('/grammar', 'practice', `${g.due} due`),
        variant: 'warning',
      },
      {
        icon: '🔄',
        label: 'Review strong',
        onClick: () => log('/grammar', 'review', 'strong'),
      },
    ],
    custom: selectedRule ? (
      <div className="rounded-lg bg-surface-hover p-3 border border-border-soft">
        <p className="text-[10px] font-bold text-primary mb-1">
          LESSON {selectedRuleIndex + 1} OF {rules.length}
        </p>
        <div className="mt-2 h-1 w-full rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${rules.length > 0 ? Math.round(((selectedRuleIndex + 1) / rules.length) * 100) : 0}%`,
            }}
          />
        </div>
        <p className="text-sm font-bold text-foreground">
          {selectedRule.title}
        </p>
        <p className="text-[10px] text-muted-copy mt-1 truncate">
          {selectedRule.grammarCategory}
        </p>
      </div>
    ) : undefined,
  };

  return <SkillSidebar config={config} />;
}
