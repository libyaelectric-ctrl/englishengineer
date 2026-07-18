import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search,
  Home,
  User,
  BookMarked,
  Languages,
  BookOpen,
  PenTool,
  Headphones,
  Mic2,
  Library,
  Calendar,
  BarChart3,
  Target,
  Trophy,
  BriefcaseBusiness,
  WandSparkles,
  BrainCircuit,
  Shield,
  Wallet,
  Settings,
  Moon,
  Sun,
  ChevronRight,
  Command,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useCommandPalette } from '@/shared/hooks/useCommandPalette';

const COMMANDS = [
  // Skills
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'Home',
    category: 'Navigate',
    keywords: ['home', 'main'],
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    href: '/vocabulary',
    icon: 'BookMarked',
    category: 'Skills',
    keywords: ['words', 'kelime'],
  },
  {
    id: 'grammar',
    label: 'Grammar',
    href: '/grammar',
    icon: 'Languages',
    category: 'Skills',
    keywords: ['gr kuralları'],
  },
  {
    id: 'reading',
    label: 'Reading',
    href: '/reading',
    icon: 'BookOpen',
    category: 'Skills',
    keywords: ['okuma'],
  },
  {
    id: 'writing',
    label: 'Writing',
    href: '/writing',
    icon: 'PenTool',
    category: 'Skills',
    keywords: ['yazma'],
  },
  {
    id: 'listening',
    label: 'Listening',
    href: '/listening',
    icon: 'Headphones',
    category: 'Skills',
    keywords: ['dinleme'],
  },
  {
    id: 'speaking',
    label: 'Speaking',
    href: '/speaking',
    icon: 'Mic2',
    category: 'Skills',
    keywords: ['konuşma'],
  },
  // Learning Hub
  {
    id: 'curriculum-today',
    label: "Today's Curriculum",
    href: '/curriculum/today',
    icon: 'Calendar',
    category: 'Learning Hub',
    keywords: ['bugün', 'plan'],
  },
  {
    id: 'curriculum-full',
    label: 'Full Curriculum',
    href: '/curriculum/full',
    icon: 'Library',
    category: 'Learning Hub',
    keywords: ['müfredat'],
  },
  {
    id: 'curriculum-memory',
    label: 'Learning Memory',
    href: '/curriculum/memory',
    icon: 'BarChart3',
    category: 'Learning Hub',
    keywords: ['bellek'],
  },
  // Progress
  {
    id: 'progress-overview',
    label: 'Progress Overview',
    href: '/progress/overview',
    icon: 'Target',
    category: 'Progress',
    keywords: ['ilerleme'],
  },
  {
    id: 'progress-next-steps',
    label: 'Next Steps',
    href: '/progress/next-steps',
    icon: 'Trophy',
    category: 'Progress',
    keywords: ['sonraki', 'adım'],
  },
  // Tools
  {
    id: 'tools-work',
    label: 'Work Tools',
    href: '/tools/work',
    icon: 'BriefcaseBusiness',
    category: 'Tools',
    keywords: ['iş'],
  },
  {
    id: 'tools-quick',
    label: 'Quick Tools',
    href: '/tools/quick',
    icon: 'WandSparkles',
    category: 'Tools',
    keywords: ['hızlı'],
  },
  {
    id: 'tools-ai',
    label: 'AI Copilot',
    href: '/tools/ai',
    icon: 'BrainCircuit',
    category: 'Tools',
    keywords: ['asistan', 'ai'],
  },
  // Profile
  {
    id: 'profile-overview',
    label: 'Profile',
    href: '/profile/overview',
    icon: 'User',
    category: 'Account',
    keywords: ['hesap'],
  },
  {
    id: 'profile-preferences',
    label: 'Settings',
    href: '/profile/preferences',
    icon: 'Settings',
    category: 'Account',
    keywords: ['ayarlar'],
  },
  {
    id: 'profile-billing',
    label: 'Billing',
    href: '/billing',
    icon: 'Wallet',
    category: 'Account',
    keywords: ['fatura'],
  },
  {
    id: 'profile-security',
    label: 'Security & Data',
    href: '/profile/security',
    icon: 'Shield',
    category: 'Account',
    keywords: ['güvenlik'],
  },
  // Admin
  {
    id: 'admin',
    label: 'Admin Panel',
    href: '/admin',
    icon: 'Settings',
    category: 'Account',
    keywords: ['admin'],
  },
  // Pricing (public)
  {
    id: 'pricing',
    label: 'Pricing',
    href: '/pricing',
    icon: 'Wallet',
    category: 'Account',
    keywords: ['fiyat'],
  },
];

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Home,
  User,
  BookMarked,
  Languages,
  BookOpen,
  PenTool,
  Headphones,
  Mic2,
  Library,
  Calendar,
  BarChart3,
  Target,
  Trophy,
  BriefcaseBusiness,
  WandSparkles,
  BrainCircuit,
  Shield,
  Wallet,
  Settings,
  Moon,
  Sun,
};

const CATEGORIES_ORDER = [
  'Navigate',
  'Skills',
  'Learning Hub',
  'Progress',
  'Tools',
  'Account',
];

export const CommandPalette: React.FC = () => {
  const { isOpen, close, recordVisit, getRecent, getFrequency } =
    useCommandPalette();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const recentHrefs = useMemo(
    () => (isOpen ? getRecent() : []),
    [isOpen, getRecent]
  );
  const frequency = useMemo(
    () => (isOpen ? getFrequency() : []),
    [isOpen, getFrequency]
  );

  const isDark = document.documentElement.classList.contains('dark');
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDark);
    document.documentElement.classList.toggle('light', isDark);
    localStorage.setItem('theme', newTheme);
  };

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

  // Keep selected item visible
  useEffect(() => {
    if (!listRef.current) return;
    const btn = listRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    btn?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const execute = (href: string) => {
    recordVisit(href);
    navigate(href);
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  // Build the "recent" section items
  const recentItems = useMemo(() => {
    if (search.trim()) return [];
    return recentHrefs
      .map((href) => COMMANDS.find((c) => c.href === href))
      .filter(Boolean)
      .slice(0, 3) as typeof COMMANDS;
  }, [search, recentHrefs]);

  // Build "frequently visited" items (top 3 by frequency, excluding recent)
  const frequentItems = useMemo(() => {
    if (search.trim()) return [];
    const recentSet = new Set(recentHrefs);
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([href]) => COMMANDS.find((c) => c.href === href))
      .filter(
        (cmd): cmd is (typeof COMMANDS)[0] => !!cmd && !recentSet.has(cmd.href)
      )
      .slice(0, 3);
  }, [search, recentHrefs, frequency]);

  // Build display sections
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border-soft bg-surface shadow-2xl"
          >
            {/* Search input */}
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
                  className="rounded-md p-1.5 text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground"
                  aria-label="Toggle theme"
                  title="Toggle dark/light mode"
                >
                  {isDark ? (
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

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-[360px] overflow-y-auto p-2 custom-scrollbar"
            >
              {sections.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-copy">
                  No results for "{search}"
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
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
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
                      {isSelected && (
                        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border-soft px-4 py-2 text-[10px] text-muted-copy/60">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Command className="h-3 w-3" />K
                </span>
                <span>to toggle</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border-soft px-1 py-px text-[9px]">
                    &uarr;
                  </kbd>
                  <kbd className="rounded border border-border-soft px-1 py-px text-[9px]">
                    &darr;
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border-soft px-1 py-px text-[9px]">
                    ↵
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
