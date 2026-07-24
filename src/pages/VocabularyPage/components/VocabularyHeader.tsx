import { useState, useEffect } from 'react';
import { Search, Volume2, VolumeX } from 'lucide-react';
import { getSoundMuted, toggleSoundMuted } from '@/shared/utils/sound';
import type {
  VocabularySearchFilters,
  VocabularyTerm,
  VocabularyMenuStatus,
} from '@/features/vocabulary';

import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';

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

const SearchInput = ({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}) => (
  <label className="relative hidden w-36 sm:w-44 md:block">
    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-copy" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          void onSubmit(e);
        }
      }}
      className="min-h-8 w-full rounded-[4px] border border-border-soft bg-surface pl-8 pr-2 text-xs outline-none focus:border-[#0047bb] text-foreground"
      placeholder="Search..."
      aria-label="Search vocabulary"
    />
  </label>
);

const SoundToggle = ({
  isMuted,
  onToggle,
}: {
  isMuted: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    title={isMuted ? 'Unmute card sounds' : 'Mute card sounds'}
    className={`flex items-center gap-1 rounded-[4px] border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
      isMuted
        ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-rose-600'
        : 'border-border-soft bg-surface text-muted-copy hover:text-foreground hover:bg-surface-hover'
    }`}
  >
    {isMuted ? (
      <VolumeX className="h-3.5 w-3.5" />
    ) : (
      <Volume2 className="h-3.5 w-3.5" />
    )}
  </button>
);

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
  onOpenQuiz,
  onOpenStrugglingQuiz,
}: VocabularyHeaderProps) {
  const [isSoundMuted, setIsSoundMuted] = useState(() => getSoundMuted());
  const wordProgress = useVocabularyStore((s) => s.wordProgress);

  const learnedCount = Object.values(wordProgress).filter(
    (w) => w.status === 'learned'
  ).length;
  const strugglingCount = Object.values(wordProgress).filter(
    (w) => w.status === 'struggling'
  ).length;
  const masteredCount = Object.values(wordProgress).filter(
    (w) => w.status === 'mastered'
  ).length;

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

  const canStartQuiz = learnedCount >= 100;

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/95 backdrop-blur-xl mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Vocabulary
          </h1>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0047bb]">
            {vocabularyLevel}
          </span>
          <SoundToggle isMuted={isSoundMuted} onToggle={handleSoundToggle} />
          <div
            className="hidden xl:flex items-center gap-2 rounded-[4px] border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
            title="200 Mastered words required to unlock Reading & Writing skills"
          >
            <span>🏆 Goal: {masteredCount}/200</span>
            <div className="w-16 h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-950 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((masteredCount / 200) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {strugglingCount > 0 && (
            <button
              type="button"
              onClick={onOpenStrugglingQuiz}
              title="Struggling words review"
              className="flex items-center gap-1.5 rounded-[4px] border border-rose-400/40 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-all uppercase tracking-wider"
            >
              ⚠️ Struggling ({strugglingCount})
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (!canStartQuiz) {
                alert(
                  `At least 100 words in Learned pool are required to start Mastered Quiz (Current: ${learnedCount}/100).`
                );
                return;
              }
              onOpenQuiz?.();
            }}
            title={
              canStartQuiz
                ? 'Start Mastered Quiz'
                : `Need 100 learned words (Current: ${learnedCount}/100)`
            }
            className={`flex items-center gap-1 rounded-[4px] border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              canStartQuiz
                ? 'border-amber-400/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                : 'border-border-soft bg-surface text-muted-copy opacity-75'
            }`}
          >
            🏆 Quiz ({learnedCount}/100)
          </button>

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
      </div>

      {/* Search bar below tabs */}
      <div className="mb-4">
        <SearchInput
          value={searchInput}
          onChange={onSearchInputChange}
          onSubmit={onSearchSubmit}
        />
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
