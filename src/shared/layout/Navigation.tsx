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
    'group relative flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-foreground text-background'
      : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
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
    <nav className="space-y-0.5" aria-label="Main navigation">
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
              <Icon className="h-4 w-4 shrink-0" />
              <span>{translate(item.label)}</span>
            </NavLink>
          );
        }

        return (
          <div key={item.label} className="space-y-0.5">
            <button
              type="button"
              onClick={() => setSkillsOpen((open) => !open)}
              className="group flex min-h-9 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-copy transition-all hover:bg-surface-hover hover:text-foreground"
              aria-expanded={skillsOpen}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{translate(item.label)}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform text-muted-copy',
                  skillsOpen && 'rotate-180'
                )}
              />
            </button>
            {skillsOpen && 'children' in item && (
              <div className="ml-4 space-y-0.5 border-l border-border-soft pl-3">
                {item.children.map((skill) => (
                  <NavLink
                    key={skill.label}
                    to={skill.href}
                    onClick={onItemClick}
                    className={linkClasses}
                  >
                    <skill.icon className="h-3.5 w-3.5 shrink-0" />
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
