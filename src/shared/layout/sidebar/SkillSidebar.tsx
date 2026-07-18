import { Section, Item, Stat, Progress, Action } from './SidebarComponents';
import type { SidebarConfig } from './sidebar.config';

function renderTabs(title: string, tabs: NonNullable<SidebarConfig['tabs']>) {
  if (tabs.length === 0) return null;
  return (
    <Section title={title}>
      <div className="space-y-0.5">
        {tabs.map((tab) => (
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
  );
}

function renderStats(stats: NonNullable<SidebarConfig['stats']>) {
  if (stats.length === 0) return null;
  return (
    <Section title="Stats">
      {stats.map((stat) => (
        <Stat
          key={stat.label}
          label={stat.label}
          value={stat.value}
          color={stat.color}
        />
      ))}
    </Section>
  );
}

function renderProgressBars(bars: NonNullable<SidebarConfig['progressBars']>) {
  if (bars.length === 0) return null;
  return (
    <Section title="Progress">
      <div className="space-y-2">
        {bars.map((bar) => (
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
  );
}

function renderActions(actions: NonNullable<SidebarConfig['actions']>) {
  if (actions.length === 0) return null;
  return (
    <Section title="Actions">
      <div className="space-y-1.5">
        {actions.map((action) => (
          <Action key={action.label} {...action} />
        ))}
      </div>
    </Section>
  );
}

export function SkillSidebar({ config }: { config: SidebarConfig }) {
  return (
    <>
      {config.header && <div className="px-4 pt-4">{config.header}</div>}

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

      {config.tabs && renderTabs(config.pathLabel, config.tabs)}
      {config.stats && renderStats(config.stats)}
      {config.progressBars && renderProgressBars(config.progressBars)}
      {config.actions && renderActions(config.actions)}
    </>
  );
}
