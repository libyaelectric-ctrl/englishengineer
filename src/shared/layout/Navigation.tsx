import { useState } from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/config/navigation.config';
import { cn } from '@/shared/utils/cn';
import {
  NAVIGATION_TRANSLATIONS,
  useLocalizationStore,
} from '@/features/localization';
import { ADMIN_PANEL_ENABLED } from '@/config/product.config';
import { prefetchRoute } from '@/shared/utils/prefetch';

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
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_ITEMS.forEach((item) => {
      if ('children' in item && item.children) {
        initial[item.label] = item.children.some(
          (child) => child.href === location.pathname
        );
      }
    });
    return initial;
  });
  const language = useLocalizationStore((state) => state.language);
  const translations = NAVIGATION_TRANSLATIONS[language];
  const translate = (label: string) => translations[label] ?? label;

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
              onMouseEnter={() => prefetchRoute(item.href)}
              className={linkClasses}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{translate(item.label)}</span>
            </NavLink>
          );
        }

        const isOpen = openMenus[item.label] ?? false;

        return (
          <div key={item.label} className="space-y-0.5">
            <button
              type="button"
              onClick={() => toggleMenu(item.label)}
              className="group flex min-h-9 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-copy transition-all hover:bg-surface-hover hover:text-foreground"
              aria-expanded={isOpen}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{translate(item.label)}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform text-muted-copy',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            {isOpen && 'children' in item && (
              <div className="ml-4 space-y-0.5 border-l border-border-soft pl-3">
                {item.children.map((child) => (
                  <NavLink
                    key={child.label}
                    to={child.href}
                    onClick={onItemClick}
                    onMouseEnter={() => prefetchRoute(child.href)}
                    className={linkClasses}
                  >
                    <child.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{translate(child.label)}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {ADMIN_PANEL_ENABLED && (
        <NavLink
          to="/admin"
          onClick={onItemClick}
          className={linkClasses}
        >
          <Shield className="h-4 w-4 shrink-0 text-red-500" />
          <span>{translate('Admin Panel')}</span>
        </NavLink>
      )}
    </nav>
  );
};
