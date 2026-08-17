import { NAV_ITEMS } from '@/config/navigation.config';
import { ChevronDown, LockKeyhole } from 'lucide-react';

import React, { useState } from 'react';

import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { cn } from '@/shared/utils/cn';
import { prefetchRoute } from '@/shared/utils/prefetch';

import {
  type BillingFeature,
  LockedFeatureModal,
  type LockedFeatureModalItem,
  type SubscriptionSnapshot,
  canAccessFeature,
  useBillingStore,
} from '@/features/billing';
import { NAVIGATION_TRANSLATIONS, useLocalizationStore } from '@/features/localization';

interface NavigationProps {
  onItemClick?: () => void;
}

interface LockableItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  feature?: BillingFeature;
  comingSoon?: boolean;
}

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group relative flex min-h-9 items-center gap-2.5 rounded-[4px] px-3 py-2 text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-primary/10 text-primary border border-primary/25 font-semibold'
      : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
  );

const isLocked = (item: LockableItem, subscription: SubscriptionSnapshot): boolean => {
  if (item.comingSoon) return true;
  if (!item.feature) return false;
  return !canAccessFeature(subscription, item.feature).allowed;
};

export const Navigation = React.memo(({ onItemClick }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
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
  const subscription = useBillingStore((state) => state.subscription);
  const [lockedItem, setLockedItem] = useState<LockedFeatureModalItem | null>(null);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const openPricing = () => {
    setLockedItem(null);
    onItemClick?.();
    navigate('/pricing');
  };

  const renderLockedLink = (item: LockableItem) => (
    <button
      key={item.label}
      type="button"
      onClick={() =>
        setLockedItem({ label: item.label, feature: item.feature, comingSoon: item.comingSoon })
      }
      className="group relative flex min-h-9 w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-3 py-2 text-sm font-medium text-muted-copy transition-all hover:bg-surface-hover hover:text-foreground"
      title={item.comingSoon ? 'Coming soon' : 'Upgrade required'}
      aria-label={`${translate(item.label)} (locked)`}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">{translate(item.label)}</span>
      {item.comingSoon && (
        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Soon
        </span>
      )}
      <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-muted-copy/60" />
    </button>
  );

  return (
    <nav className="space-y-0.5" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        if (item.href) {
          const locked = isLocked(item as LockableItem, subscription);
          if (locked) return renderLockedLink(item as LockableItem);

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
              className="group flex min-h-9 w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-sm font-medium text-muted-copy transition-all hover:bg-surface-hover hover:text-foreground"
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
                {item.children.map((child) => {
                  const childItem = child as LockableItem;
                  const locked = isLocked(childItem, subscription);
                  if (locked) return renderLockedLink(childItem);

                  return (
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
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <LockedFeatureModal
        item={lockedItem}
        onClose={() => setLockedItem(null)}
        onSeePlans={openPricing}
      />
    </nav>
  );
});
Navigation.displayName = 'Navigation';
