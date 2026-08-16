import { BriefcaseBusiness, Home, Layers3, Map, User } from 'lucide-react';
import { motion } from 'motion/react';

import { NavLink, useLocation } from 'react-router-dom';

import { activeCapsule, cardHover, iconHover } from '@/shared/motion/variants';
import { cn } from '@/shared/utils/cn';

import { NAVIGATION_TRANSLATIONS, useLocalizationStore } from '@/features/localization';

const ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Learning Hub', href: '/curriculum', icon: Map },
  { label: 'Skills', href: '/reading', icon: Layers3 },
  { label: 'Tools', href: '/tools', icon: BriefcaseBusiness },
  { label: 'Profile', href: '/profile', icon: User },
] as const;

export const MobileBottomNavigation = () => {
  const location = useLocation();
  const language = useLocalizationStore((state) => state.language);
  const translations = NAVIGATION_TRANSLATIONS[language];

  const activeIndex = ITEMS.findIndex((item) => location.pathname.startsWith(item.href));

  return (
    <nav
      aria-label="Mobile learning navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border-soft bg-surface/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-lg backdrop-blur-md lg:hidden"
    >
      <div className="relative mx-auto max-w-lg">
        <motion.div
          variants={activeCapsule}
          initial={false}
          animate={{ x: activeIndex * 72 + 8, width: 56, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="absolute bottom-full left-0 h-1 bg-primary rounded-t-full shadow-[0_0_12px_var(--color-primary)] pointer-events-none"
          style={{ transformOrigin: 'center' }}
        />
        <div className="grid grid-cols-5 gap-1">
          {ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;
            return (
              <motion.div
                key={item.href}
                layout
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              >
                <NavLink
                  to={item.href}
                  className={cn(
                    'relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[4px] px-1 text-[10px] font-bold transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <motion.span
                        variants={iconHover}
                        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </motion.span>
                      <span className="max-w-full truncate">
                        {translations[item.label] ?? item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
