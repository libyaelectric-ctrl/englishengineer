import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/config/navigation.config';
import { cn } from '@/shared/utils/cn';
import {
  NAVIGATION_TRANSLATIONS,
  useLocalizationStore,
} from '@/features/localization';

interface NavigationProps {
  onItemClick?: () => void;
}

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group relative flex min-h-10 items-center gap-3 rounded-[8px] px-3 py-2 text-xs font-semibold transition-all duration-150',
    isActive
      ? 'bg-surface-hover text-foreground border border-border-soft shadow-sm'
      : 'text-muted-copy hover:bg-surface-hover/30 hover:text-foreground border border-transparent'
  );

export const Navigation = ({ onItemClick }: NavigationProps) => {
  const location = useLocation();
  const [skillsOpen, setSkillsOpen] = useState(() =>
    NAV_ITEMS.some(
      (item) =>
        'children' in item &&
        item.children?.some((skill) => skill.href === location.pathname)
    )
  );
  const language = useLocalizationStore((state) => state.language);
  const translations = NAVIGATION_TRANSLATIONS[language];
  const translate = (label: string) => translations[label] ?? label;

  return (
    <nav className="space-y-1 p-3" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        if (item.href) {
          return (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={onItemClick}
              className={linkClasses}
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-copy group-hover:text-foreground transition-colors" />
              <span>{translate(item.label)}</span>
            </NavLink>
          );
        }

        return (
          <div key={item.label} className="space-y-1">
            <button
              type="button"
              onClick={() => setSkillsOpen((open) => !open)}
              className="group flex min-h-10 w-full items-center gap-3 rounded-[8px] px-3 py-2 text-xs font-semibold text-muted-copy transition-all hover:bg-surface-hover/30 hover:text-foreground border border-transparent"
              aria-expanded={skillsOpen}
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-copy group-hover:text-foreground" />
              <span className="flex-1 text-left">{translate(item.label)}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform text-muted-copy',
                  skillsOpen && 'rotate-180'
                )}
              />
            </button>
            {skillsOpen && 'children' in item && (
              <div className="ml-5 space-y-1 border-l border-border-soft pl-2">
                {item.children.map((skill) => (
                  <NavLink
                    key={skill.label}
                    to={skill.href}
                    onClick={onItemClick}
                    className={linkClasses}
                  >
                    <skill.icon className="h-3.5 w-3.5 shrink-0 text-muted-copy" />
                    <span>{translate(skill.label)}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
