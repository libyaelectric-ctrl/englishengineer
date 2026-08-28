import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/layouts/sidebar/sidebar.config';
import { PenLine, RefreshCw } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { useLearningStore } from '@/core/learning';

import { GrammarProgressService } from '@/features/grammar/grammar.progress';
import { useGrammarStore } from '@/features/grammar/grammar.store';
import { SkillEntryBrief } from '@/features/learning-orchestrator';
import { useLocalizationStore } from '@/features/localization';
import { interpolate } from '@/features/localization/interpolate';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';

const log = (_page: string, _action: string, _details: string) => {};

export function GrammarSidebar() {
  useLearningStore((s) => s.studySessions.length);
  const g = GrammarProgressService.getSummary(360);
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const { tab, setTab, rules, selectedId } = useGrammarStore(
    useShallow((s) => ({ tab: s.tab, setTab: s.setTab, rules: s.rules, selectedId: s.selectedId }))
  );
  const selectedRule = rules.find((r) => r.id === selectedId) ?? rules[0];
  const selectedRuleIndex = selectedRule ? rules.findIndex((r) => r.id === selectedRule.id) : -1;

  const tabLabel = (t: string): string =>
    t === 'New'
      ? copy.vocabNew
      : t === 'Learning'
        ? copy.learning
        : t === 'Due'
          ? copy.due
          : copy.strong;

  const config: SidebarConfig = {
    header: <SkillEntryBrief skill="grammar" compact={true} />,
    skill: 'grammar',
    pathLabel: copy.yourGrammarPath,
    pathDescription: copy.grammarDesc,
    currentLevel: selectedRule?.cefrLevel,
    totalItems: rules.length,
    tabs: (['New', 'Learning', 'Due', 'Strong'] as const).map((t) => ({
      label: tabLabel(t),
      active: t === tab,
      badge:
        t === 'New' ? g.newRules : t === 'Learning' ? g.learning : t === 'Due' ? g.due : g.strong,
      onClick: () => {
        setTab(t);
        log('/grammar', 'tab', t);
      },
    })),
    stats: [
      { label: copy.tracked, value: g.tracked },
      { label: copy.vocabNew, value: g.newRules, color: 'text-violet-500' },
    ],
    progressBars: [
      {
        label: copy.strong,
        value: g.strong,
        max: 360,
        color: '#8b5cf6',
        showPercent: true,
      },
      { label: copy.due, value: g.due, max: 360, color: '#e879f9' },
    ],
    actions: [
      {
        icon: PenLine,
        label: interpolate(copy.practiceDue, { count: g.due }),
        onClick: () => log('/grammar', 'practice', `${g.due} due`),
        variant: 'warning',
      },
      {
        icon: RefreshCw,
        label: copy.reviewStrong,
        onClick: () => log('/grammar', 'review', 'strong'),
      },
    ],
    custom: selectedRule ? (
      <div className="rounded-[var(--radius-card)] bg-surface-hover p-3 border border-border-soft">
        <p className="text-[10px] font-bold text-primary mb-1">
          {interpolate(copy.lessonOf, { a: selectedRuleIndex + 1, b: rules.length })}
        </p>
        <div className="mt-2 h-1 w-full rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${rules.length > 0 ? Math.round(((selectedRuleIndex + 1) / rules.length) * 100) : 0}%`,
            }}
          />
        </div>
        <p className="text-sm font-bold text-foreground">{selectedRule.title}</p>
        <p className="text-[10px] text-muted-copy mt-1 truncate">{selectedRule.grammarCategory}</p>
      </div>
    ) : undefined,
  };

  return <SkillSidebar config={config} />;
}
