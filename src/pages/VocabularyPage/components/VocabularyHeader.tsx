import { Search, Volume2, VolumeX } from 'lucide-react';

import { useEffect, useState } from 'react';

import { getSoundMuted, toggleSoundMuted } from '@/shared/utils/sound';

import type {
  VocabularyMenuState,
  VocabularyMenuStatus,
  VocabularySearchFilters,
  VocabularyTerm,
} from '@/features/vocabulary';

const TABS = ['New', 'Learned', 'Mastered', 'Struggling'] as const;
const TAB_LABELS = {
  New: 'New',
  Learned: 'Learned',
  Learning: 'Learned',
  Mastered: 'Mastered',
  Struggling: 'Struggling',
};

interface VocabularyHeaderProps {
  vocabularyLevel: string;
  activeTab: VocabularyMenuStatus;
  searchInput: string;
  showFilters?: boolean;
  filters?: VocabularySearchFilters;
  isSearchLoading?: boolean;
  searchError?: string | null;
  hasSearched?: boolean;
  searchResults?: VocabularyTerm[];
  allSearchResults?: VocabularyTerm[];
  filterOptions?: (field: keyof VocabularySearchFilters) => string[];
  chooseTab: (tab: VocabularyMenuStatus) => void;
  onSearchInputChange: (input: string) => void;
  onSearchSubmit: (query: string) => Promise<void>;
  onFilterChange?: (field: keyof VocabularySearchFilters, value: string) => void;
  onOpenSearch?: () => void;
  menuState: VocabularyMenuState;
}

export { TABS, TAB_LABELS };

const SoundToggle = ({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    title={isMuted ? 'Unmute card sounds' : 'Mute card sounds'}
    className={`flex items-center gap-1 rounded-[4px] border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
      isMuted
        ? 'border-rose-300 bg-rose-50 text-rose-600 dark:bg-rose-950/30'
        : 'border-border-soft bg-surface text-muted-copy hover:bg-surface-hover hover:text-foreground'
    }`}
  >
    {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
  </button>
);

export function VocabularyHeader({
  vocabularyLevel,
  activeTab,
  hasSearched,
  searchResults,
  allSearchResults,
  chooseTab,
  onOpenSearch,
  menuState,
}: VocabularyHeaderProps) {
  const [isSoundMuted, setIsSoundMuted] = useState(() => getSoundMuted());
  const masteredCount = Object.values(menuState.progress).filter(
    (word) => word.status === 'Mastered'
  ).length;

  useEffect(() => {
    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ muted: boolean }>;
      if (customEvent.detail) setIsSoundMuted(customEvent.detail.muted);
    };
    window.addEventListener('engvox_sound_toggle', handleToggle);
    return () => window.removeEventListener('engvox_sound_toggle', handleToggle);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-30 mb-4 flex flex-wrap h-auto min-h-16 items-center justify-between gap-3 border-b border-border-soft bg-background/95 p-2 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-foreground">Vocabulary</h1>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {vocabularyLevel}
          </span>
          <SoundToggle
            isMuted={isSoundMuted}
            onToggle={() => setIsSoundMuted(toggleSoundMuted())}
          />
          <div
            className="hidden items-center gap-2 rounded-[4px] border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 xl:flex dark:text-emerald-400"
            title="200 Mastered words required to unlock Reading & Writing skills"
          >
            <span>Goal: {masteredCount}/200</span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-950">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((masteredCount / 200) * 100))}%`,
                }}
              />
            </div>
          </div>
          {/* Keyboard Shortcut Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 rounded border border-border-soft bg-surface/80 px-2 py-1 text-[10px] font-mono text-muted-copy">
            <span className="rounded bg-primary/10 px-1 font-bold text-primary">Space</span> Flip |
            <span className="rounded bg-primary/10 px-1 font-bold text-primary">1-4</span> Rating |
            <span className="rounded bg-primary/10 px-1 font-bold text-primary">←/→</span> Nav
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex gap-1 rounded-[4px] border border-border-soft bg-surface p-1 shadow-sm"
            role="tablist"
            aria-label="Vocabulary filter"
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                type="button"
                aria-selected={activeTab === tab}
                onClick={() => chooseTab(tab)}
                className={`rounded-[4px] px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border border-primary bg-primary text-white'
                    : 'text-muted-copy hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
            <button
              type="button"
              onClick={onOpenSearch}
              title="Search vocabulary"
              className="flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-[11px] font-bold text-muted-copy transition-all hover:bg-primary/5 hover:text-primary sm:px-2 sm:py-1 sm:text-[10px]"
            >
              <Search className="h-4 w-4 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Engineering Domain Sub-Specialty Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          Domain:
        </span>
        {[
          'All Domains',
          '🏗️ Civil',
          '⚡ Electrical',
          '💻 Software',
          '⚙️ Mechanical',
          '📋 Safety',
        ].map((domain, idx) => (
          <button
            key={domain}
            type="button"
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              idx === 0
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border-soft bg-surface text-muted-copy hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {domain}
          </button>
        ))}
      </div>

      {hasSearched && searchResults && searchResults.length > 0 && (
        <p className="pb-3 text-[10px] font-medium text-muted-copy">
          Showing {searchResults.length} of {allSearchResults?.length || searchResults.length}{' '}
          results found
        </p>
      )}
    </>
  );
}
