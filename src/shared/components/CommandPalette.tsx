import { ChevronRight, Command, Moon, Search, Sun } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import type { KeyboardEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useCommandPalette } from '@/shared/hooks/useCommandPalette';
import { cn } from '@/shared/utils/cn';

import { CATEGORIES_ORDER, COMMANDS, ICON_MAP } from './CommandPalette/commandPalette.data';
import { useThemeToggle } from './CommandPalette/useThemeToggle';

export const CommandPalette = () => {
  const { isOpen, close, recordVisit, getRecent, getFrequency } = useCommandPalette();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTheme, toggleTheme } = useThemeToggle();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const recentHrefs = useMemo(() => (isOpen ? getRecent() : []), [isOpen, getRecent]);
  const frequency = useMemo(() => (isOpen ? getFrequency() : []), [isOpen, getFrequency]);

  const filtered = useMemo(() => {
    if (!search.trim()) return COMMANDS;
    const q = search.toLowerCase();
    return COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.href.toLowerCase().includes(q) ||
        cmd.keywords?.some((kw) => kw.includes(q))
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof COMMANDS>();
    for (const cmd of filtered) {
      const arr = map.get(cmd.category) || [];
      arr.push(cmd);
      map.set(cmd.category, arr);
    }
    return CATEGORIES_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      items: map.get(c)!,
    }));
  }, [filtered]);

  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!listRef.current) return;
    const btn = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    btn?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const execute = (href: string) => {
    recordVisit(href);
    navigate(href);
    close();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % flatItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[selectedIndex]) execute(flatItems[selectedIndex].href);
        break;
    }
  };

  const recentItems = useMemo(() => {
    if (search.trim()) return [];
    return recentHrefs
      .map((href) => COMMANDS.find((c) => c.href === href))
      .filter(Boolean)
      .slice(0, 3) as typeof COMMANDS;
  }, [search, recentHrefs]);

  const frequentItems = useMemo(() => {
    if (search.trim()) return [];
    const recentSet = new Set(recentHrefs);
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([href]) => COMMANDS.find((c) => c.href === href))
      .filter((cmd): cmd is (typeof COMMANDS)[0] => !!cmd && !recentSet.has(cmd.href))
      .slice(0, 3);
  }, [search, recentHrefs, frequency]);

  type Section =
    | { type: 'header'; label: string }
    | { type: 'item'; cmd: (typeof COMMANDS)[0]; globalIndex: number };

  const sections: Section[] = useMemo(() => {
    const result: Section[] = [];
    let idx = 0;

    if (!search.trim()) {
      if (recentItems.length > 0) {
        result.push({ type: 'header', label: 'Recent' });
        for (const cmd of recentItems) {
          result.push({ type: 'item', cmd, globalIndex: idx++ });
        }
      }
      if (frequentItems.length > 0) {
        result.push({ type: 'header', label: 'Frequently Visited' });
        for (const cmd of frequentItems) {
          result.push({ type: 'item', cmd, globalIndex: idx++ });
        }
      }
    }

    for (const group of grouped) {
      result.push({ type: 'header', label: group.category });
      for (const cmd of group.items) {
        result.push({ type: 'item', cmd, globalIndex: idx++ });
      }
    }

    return result;
  }, [search, recentItems, frequentItems, grouped]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.12 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: prefersReduced ? 0 : 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-xl overflow-hidden rounded-[var(--radius-card)] border border-border-soft bg-surface shadow-2xl"
          >
            <div className="flex items-center border-b border-border-soft px-4">
              <Search className="h-5 w-5 shrink-0 text-muted-copy" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent px-4 py-4 text-sm font-medium outline-none placeholder:text-muted-copy"
                placeholder="Search pages, navigate, or run actions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Command palette search"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className="rounded-[var(--radius-card)] p-1.5 text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground"
                  aria-label="Toggle theme"
                  title="Toggle dark/light mode"
                >
                  {currentTheme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
                <kbd className="ml-1 rounded border border-border-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                  ESC
                </kbd>
              </div>
            </div>

            <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2 custom-scrollbar">
              {sections.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-copy">
                  No results for &quot;{search}&quot;
                </div>
              ) : (
                sections.map((section) => {
                  if (section.type === 'header') {
                    return (
                      <div
                        key={`hdr-${section.label}`}
                        className="mb-1 mt-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-copy/60 first:mt-1"
                      >
                        {section.label}
                      </div>
                    );
                  }

                  const { cmd, globalIndex } = section;
                  const isSelected = globalIndex === selectedIndex;
                  const IconComponent = ICON_MAP[cmd.icon];
                  const isCurrentPage = location.pathname === cmd.href;

                  return (
                    <button
                      key={cmd.id}
                      data-index={globalIndex}
                      onClick={() => execute(cmd.href)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-[var(--radius-card)] px-3 py-2.5 text-left text-sm transition-colors',
                        isSelected
                          ? 'bg-primary/5 font-medium text-primary'
                          : 'text-muted-copy hover:bg-surface-hover/50 hover:text-foreground',
                        isCurrentPage && 'ring-1 ring-primary/20'
                      )}
                    >
                      {IconComponent && (
                        <IconComponent
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isSelected ? 'text-primary' : 'text-muted-copy'
                          )}
                        />
                      )}
                      <span className="flex-1 truncate">{cmd.label}</span>
                      {isCurrentPage && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          Current
                        </span>
                      )}
                      {isSelected && <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border-soft px-4 py-2 text-[10px] text-muted-copy/60">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Command className="h-3 w-3" />K
                </span>
                <span>to toggle</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border-soft px-1 py-px text-[10px]">
                    &uarr;
                  </kbd>
                  <kbd className="rounded border border-border-soft px-1 py-px text-[10px]">
                    &darr;
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border-soft px-1 py-px text-[10px]">
                    &#x21B5;
                  </kbd>
                  select
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
