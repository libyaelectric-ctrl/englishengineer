import { Section, Item, Stat, Progress, Action } from './SidebarComponents';
import { SkillEntryBrief } from '@/features/learning-orchestrator';
import type { SidebarConfig } from './sidebar.config';

export function SkillSidebar({ config }: { config: SidebarConfig }) {
  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief
          skill={
            config.skill as
              | 'vocabulary'
              | 'grammar'
              | 'reading'
              | 'writing'
              | 'listening'
              | 'speaking'
          }
          compact={true}
        />
      </div>

      <Section title={config.pathLabel}>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-1">
              {config.currentLevel || 'Loading'} PATH · {config.totalItems ?? 0}{' '}
              ITEMS
            </p>
            <p className="text-xs text-muted-copy leading-5">
              {config.pathDescription}
            </p>
          </div>
          {config.custom}
        </div>
      </Section>

      {config.tabs && config.tabs.length > 0 && (
        <Section title={config.pathLabel}>
          <div className="space-y-0.5">
            {config.tabs.map((tab) => (
              <Item
                key={tab.label}
                label={tab.label}
                active={tab.active}
                badge={tab.badge}
                onClick={tab.onClick}
              />
            ))}
          </div>
        </Section>
      )}

      {config.stats && config.stats.length > 0 && (
        <Section title="Stats">
          {config.stats.map((stat) => (
            <Stat
              key={stat.label}
              label={stat.label}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </Section>
      )}

      {config.progressBars && config.progressBars.length > 0 && (
        <Section title="Progress">
          <div className="space-y-2">
            {config.progressBars.map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs text-muted-copy mb-1">
                  <span>{bar.label}</span>
                  <span>
                    {bar.value}/{bar.max}
                    {bar.showPercent &&
                      ` (${Math.round((bar.value / bar.max) * 100)}%)`}
                  </span>
                </div>
                <Progress value={bar.value} max={bar.max} color={bar.color} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {config.actions && config.actions.length > 0 && (
        <Section title="Actions">
          <div className="space-y-1.5">
            {config.actions.map((action) => (
              <Action key={action.label} {...action} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
