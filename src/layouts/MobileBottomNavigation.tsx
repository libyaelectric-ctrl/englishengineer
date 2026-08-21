import {
  BookMarked,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  Headphones,
  Home,
  Languages,
  Map,
  Mic2,
  PenTool,
  Trophy,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { useCallback, useEffect, useRef, useState } from 'react';

import { NavLink } from 'react-router-dom';

import { cn } from '@/shared/utils/cn';

import { NAVIGATION_TRANSLATIONS, useLocalizationStore } from '@/features/localization';

const SKILL_ITEMS = [
  { label: 'Vocabulary', href: '/vocabulary', icon: BookMarked },
  { label: 'Grammar', href: '/grammar', icon: Languages },
  { label: 'Reading', href: '/reading', icon: BookOpen },
  { label: 'Writing', href: '/writing', icon: PenTool },
  { label: 'Listening', href: '/listening', icon: Headphones },
  { label: 'Speaking', href: '/speaking', icon: Mic2 },
] as const;

const ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Path', href: '/learning-path', icon: Trophy },
  { label: 'Skills', href: null, icon: FileText },
  { label: 'Hub', href: '/curriculum', icon: Map },
  { label: 'Tools', href: '/tools', icon: BriefcaseBusiness },
  { label: 'Profile', href: '/profile', icon: User },
] as const;

export const MobileBottomNavigation = () => {
  const language = useLocalizationStore((state) => state.language);
  const translations = NAVIGATION_TRANSLATIONS[language];
  const [skillsOpen, setSkillsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setSkillsOpen(false), []);

  // Escape key closes popup
  useEffect(() => {
    if (!skillsOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [skillsOpen, close]);

  return (
    <nav
      aria-label="Mobile learning navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border-soft bg-surface/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-lg backdrop-blur-md lg:hidden"
    >
      {/* Skills popup */}
      <AnimatePresence>
        {skillsOpen && (
          <>
            <motion.div
              key="skills-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[1px]"
              onClick={close}
              aria-hidden="true"
            />
            <motion.div
              ref={popupRef}
              key="skills-popup"
              role="dialog"
              aria-label={translations['Skills'] ?? 'Skills'}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute bottom-full left-2 right-2 z-50 mb-2 rounded-[var(--radius-card)] border border-border-soft bg-surface shadow-xl p-2 grid grid-cols-3 gap-1.5"
            >
              {SKILL_ITEMS.map((skill) => {
                const Icon = skill.icon;
                return (
                  <NavLink
                    key={skill.href}
                    to={skill.href}
                    onClick={close}
                    className={({ isActive }) =>
                      cn(
                        'flex flex-col items-center gap-1 rounded-[4px] p-2.5 text-[10px] font-bold transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/25'
                          : 'text-muted-copy hover:bg-surface-hover hover:text-foreground border border-transparent'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{translations[skill.label] ?? skill.label}</span>
                  </NavLink>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="mx-auto grid max-w-lg grid-cols-6 gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          // Skills item triggers popup instead of navigation
          if (item.label === 'Skills') {
            return (
              <button
                key="skills"
                ref={triggerRef}
                type="button"
                onClick={() => setSkillsOpen((o) => !o)}
                aria-expanded={skillsOpen}
                aria-haspopup="dialog"
                className={cn(
                  'relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[4px] px-1 text-[10px] font-bold text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground border border-transparent cursor-pointer',
                  skillsOpen && 'bg-primary/10 text-primary border-primary/25'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="max-w-full truncate">
                  {translations[item.label] ?? item.label}
                </span>
                {skillsOpen && (
                  <span className="h-1 w-4 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)] animate-in fade-in duration-200 mt-0.5" />
                )}
              </button>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href!}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[4px] px-1 text-[10px] font-bold text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground border border-transparent',
                  isActive && 'bg-primary/10 text-primary border-primary/25'
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
                    <span className="h-1 w-4 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)] animate-in fade-in duration-200 mt-0.5" />
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
