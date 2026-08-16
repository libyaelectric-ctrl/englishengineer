import { NAV_ITEMS } from '@/config/navigation.config';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import React, { useState } from 'react';

import { NavLink, useLocation } from 'react-router-dom';

import {
  accordionItem,
  accordionOpen,
  iconHover,
  staggerContainer,
  staggerItem,
} from '@/shared/motion/variants';
import { cn } from '@/shared/utils/cn';
import { prefetchRoute } from '@/shared/utils/prefetch';

import { NAVIGATION_TRANSLATIONS, useLocalizationStore } from '@/features/localization';

interface NavigationProps {
  onItemClick?: () => void;
}

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group relative flex min-h-9 items-center gap-2.5 rounded-[4px] px-3 py-2 text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-primary/10 text-primary border border-primary/25 font-semibold'
      : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
  );

export const Navigation = React.memo(({ onItemClick }: NavigationProps) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_ITEMS.forEach((item) => {
      if ('children' in item && item.children) {
        initial[item.label] = item.children.some((child) => child.href === location.pathname);
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
    <motion.nav
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-0.5"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item, index) => {
        const Icon = item.icon;
        if (item.href) {
          return (
            <motion.div key={item.label} variants={staggerItem} custom={index}>
              <NavLink
                to={item.href}
                onClick={onItemClick}
                onMouseEnter={() => prefetchRoute(item.href)}
                className={linkClasses}
              >
                <motion.span variants={iconHover} whileHover="hover" whileTap="tap">
                  <Icon className="h-4 w-4 shrink-0" />
                </motion.span>
                <span>{translate(item.label)}</span>
              </NavLink>
            </motion.div>
          );
        }

        const isOpen = openMenus[item.label] ?? false;

        return (
          <motion.div
            key={item.label}
            variants={staggerItem}
            custom={index}
            className="space-y-0.5"
          >
            <motion.button
              type="button"
              onClick={() => toggleMenu(item.label)}
              className="group flex min-h-9 w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-sm font-medium text-muted-copy transition-all hover:bg-surface-hover hover:text-foreground"
              aria-expanded={isOpen}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.span variants={iconHover} whileHover="hover" whileTap="tap">
                <Icon className="h-4 w-4 shrink-0" />
              </motion.span>
              <span className="flex-1 text-left">{translate(item.label)}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <ChevronDown className="h-3.5 w-3.5 text-muted-copy" />
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {isOpen && 'children' in item && (
                <motion.div
                  variants={accordionOpen}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="ml-4 space-y-0.5 border-l border-border-soft pl-3"
                >
                  {item.children.map((child, childIndex) => (
                    <motion.div key={child.label} variants={accordionItem} custom={childIndex}>
                      <NavLink
                        to={child.href}
                        onClick={onItemClick}
                        onMouseEnter={() => prefetchRoute(child.href)}
                        className={linkClasses}
                      >
                        <motion.span variants={iconHover} whileHover="hover" whileTap="tap">
                          <child.icon className="h-3.5 w-3.5 shrink-0" />
                        </motion.span>
                        <span>{translate(child.label)}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.nav>
  );
});
Navigation.displayName = 'Navigation';
