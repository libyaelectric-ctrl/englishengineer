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
    'group relative flex min-h-11 items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'bg-sky-50 text-sky-900 shadow-[0_6px_18px_rgba(59,113,143,0.08)] ring-1 ring-sky-200'
      : 'text-slate-600 hover:bg-sky-50/60 hover:text-sky-900'
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
    <nav className="space-y-1.5 p-3" aria-label="Main navigation">
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
              <Icon className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-sky-700" />
              <span>{translate(item.label)}</span>
            </NavLink>
          );
        }

        return (
          <div key={item.label}>
            <button
              type="button"
              onClick={() => setSkillsOpen((open) => !open)}
              className="group flex min-h-11 w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-sky-50/60 hover:text-sky-900"
              aria-expanded={skillsOpen}
            >
              <Icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-sky-700" />
              <span className="flex-1 text-left">{translate(item.label)}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  skillsOpen && 'rotate-180'
                )}
              />
            </button>
            {skillsOpen && 'children' in item && (
              <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-2">
                {item.children.map((skill) => (
                  <NavLink
                    key={skill.label}
                    to={skill.href}
                    onClick={onItemClick}
                    className={linkClasses}
                  >
                    <skill.icon className="h-4 w-4 shrink-0 text-slate-400" />
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
