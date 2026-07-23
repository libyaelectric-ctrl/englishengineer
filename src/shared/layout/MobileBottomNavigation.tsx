import { BriefcaseBusiness, Home, Layers3, Map, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import {
  NAVIGATION_TRANSLATIONS,
  useLocalizationStore,
} from '@/features/localization';

const ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Learning Hub', href: '/curriculum', icon: Map },
  { label: 'Skills', href: '/reading', icon: Layers3 },
  { label: 'Tools', href: '/tools', icon: BriefcaseBusiness },
  { label: 'Profile', href: '/profile', icon: User },
] as const;

export const MobileBottomNavigation = () => {
  const language = useLocalizationStore((state) => state.language);
  const translations = NAVIGATION_TRANSLATIONS[language];

  return (
    <nav
      aria-label="Mobile learning navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border-soft bg-surface/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-lg backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[4px] px-1 text-[9px] font-bold text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground border border-transparent',
                  isActive &&
                    'bg-[#0047bb]/10 text-[#0047bb] border-[#0047bb]/25'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="max-w-full truncate">
                    {translations[item.label] ?? item.label}
                  </span>
                  {isActive && (
                    <span className="h-1 w-4 bg-[#0047bb] rounded-full shadow-[0_0_8px_#0047bb] animate-in fade-in duration-200 mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
