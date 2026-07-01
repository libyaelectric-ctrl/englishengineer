import { BookMarked, BookOpen, Home, Map, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import {
  NAVIGATION_TRANSLATIONS,
  useLocalizationStore,
} from '@/features/localization';

const ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Learning Hub', href: '/curriculum', icon: Map },
  { label: 'Reading', href: '/reading', icon: BookOpen },
  { label: 'Vocabulary', href: '/vocabulary', icon: BookMarked },
  { label: 'Profile', href: '/profile', icon: User },
] as const;

export const MobileBottomNavigation = () => {
  const language = useLocalizationStore((state) => state.language);
  const translations = NAVIGATION_TRANSLATIONS[language];

  return (
    <nav
      aria-label="Mobile learning navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-300 bg-white/96 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_28px_rgba(15,23,42,0.08)] backdrop-blur-lg lg:hidden"
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
                  'flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-[12px] px-1 text-[10px] font-bold text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-800',
                  isActive && 'bg-sky-50 text-sky-800'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="max-w-full truncate">
                {translations[item.label] ?? item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
