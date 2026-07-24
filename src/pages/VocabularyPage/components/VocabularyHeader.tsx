import { useState, useEffect } from 'react';
import { Search, Volume2, VolumeX } from 'lucide-react';
import { getSoundMuted, toggleSoundMuted } from '@/shared/utils/sound';
import type {
  VocabularySearchFilters,
  VocabularyTerm,
  VocabularyMenuStatus,
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
  onSearchSubmit: (event: React.FormEvent) => Promise<void>;
  onFilterChange?: (
    field: keyof VocabularySearchFilters,
    value: string
  ) => void;
  onOpenQuiz?: () => void;
  onOpenStrugglingQuiz?: () => void;
}

export { TABS, TAB_LABELS };

export function VocabularyHeader({
  vocabularyLevel,
  activeTab,
  searchInput,
  hasSearched,
  searchResults,
  allSearchResults,
  chooseTab,
  onSearchInputChange,
  onSearchSubmit,
}: VocabularyHeaderProps) {
  const [isSoundMuted, setIsSoundMuted] = useState(() => getSoundMuted());

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ muted: boolean }>;
      if (customEvent.detail) {
        setIsSoundMuted(customEvent.detail.muted);
      }
    };
    window.addEventListener('engvox_sound_toggle', handleToggle);
    return () =>
      window.removeEventListener('engvox_sound_toggle', handleToggle);
  }, []);

  const handleSoundToggle = () => {
    const next = toggleSoundMuted();
    setIsSoundMuted(next);
  };

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/95 backdrop-blur-xl mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Vocabulary
          </h1>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
            {vocabularyLevel}
          </span>
          <label className="relative hidden w-36 sm:w-44 md:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-copy" />
            <input
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void onSearchSubmit(event);
                }
              }}
              className="min-h-8 w-full rounded-[4px] border border-border-soft bg-surface pl-8 pr-2 text-xs outline-none focus:border-[#0047bb] text-foreground"
              placeholder="Search..."
              aria-label="Search vocabulary"
            />
          </label>
          <button
            type="button"
            onClick={handleSoundToggle}
            title={isSoundMuted ? 'Unmute card sounds' : 'Mute card sounds'}
            className={`flex items-center gap-1 rounded-[4px] border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              isSoundMuted
                ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-rose-600'
                : 'border-border-soft bg-surface text-muted-copy hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            {isSoundMuted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Tabs on Right */}
        <div className="flex gap-1 rounded-[4px] border border-border-soft bg-surface p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={activeTab === tab}
              onClick={() => chooseTab(tab)}
              className={`px-3 py-1 text-[10px] font-sans font-bold rounded-[4px] transition-all cursor-pointer uppercase tracking-wider ${
                activeTab === tab
                  ? 'bg-[#0047bb] text-white border border-[#0047bb]'
                  : 'text-muted-copy hover:bg-primary/5 hover:text-[#0047bb]'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {hasSearched && searchResults && searchResults.length > 0 && (
        <p className="pb-3 text-[10px] text-muted-copy font-medium">
          Showing {searchResults.length} of{' '}
          {allSearchResults?.length || searchResults.length} results found
        </p>
      )}
    </>
  );
}
