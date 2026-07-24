import { useState, useEffect } from 'react';
import { Search, Zap, Lock, Info, Volume2, VolumeX } from 'lucide-react';
import { getSoundMuted, toggleSoundMuted } from '@/shared/utils/sound';
import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';
import {
  VocabularyProgressService,
  QUIZ_THRESHOLD,
} from '@/features/vocabulary/services/vocabulary.progress';
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
  showFilters: boolean;
  filters: VocabularySearchFilters;
  isSearchLoading: boolean;
  searchError: string | null;
  hasSearched: boolean;
  searchResults: VocabularyTerm[];
  allSearchResults: VocabularyTerm[];
  filterOptions: (field: keyof VocabularySearchFilters) => string[];
  chooseTab: (tab: VocabularyMenuStatus) => void;
  onSearchInputChange: (input: string) => void;
  onSearchSubmit: (event: React.FormEvent) => Promise<void>;
  onFilterChange: (field: keyof VocabularySearchFilters, value: string) => void;
  onOpenQuiz: () => void;
  onOpenStrugglingQuiz: () => void;
}

export { TABS, TAB_LABELS };

export function VocabularyHeader({
  vocabularyLevel,
  activeTab,
  searchInput,
  showFilters,
  filters,
  isSearchLoading,
  searchError,
  hasSearched,
  searchResults,
  allSearchResults,
  filterOptions,
  chooseTab,
  onSearchInputChange,
  onSearchSubmit,
  onFilterChange,
  onOpenQuiz,
  onOpenStrugglingQuiz,
}: VocabularyHeaderProps) {
  const { wordProgress, stats } = useVocabularyStore();
  const learnedCount = stats.learned;
  const strugglingCount = stats.struggling;
  const canStartQuiz = VocabularyProgressService.isQuizReady(learnedCount);
  const learnedWords = Object.values(wordProgress).filter(
    (w) => w.status === 'learned'
  );

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
    <div className="space-y-4 mb-6">
      {/* Clean 64px Sticky Header Bar (Identical to ProgressPage) */}
      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Vocabulary
          </h1>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
            {vocabularyLevel}
          </span>
          <p className="hidden text-[11px] font-medium text-muted-copy leading-tight sm:block">
            Engineering terms & technical lexicon.
          </p>
        </div>

        {/* Clean Symmetrical Tab Switcher */}
        <div className="flex items-center gap-1 rounded-[4px] border border-border-soft bg-surface p-1 shadow-sm">
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

      {/* Spacious Secondary Toolbar (Search & Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <label className="relative flex-1">
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
              className="min-h-9 w-full rounded-[4px] border border-border-soft bg-surface pl-8 pr-2 text-xs outline-none focus:border-[#0047bb] text-foreground"
              placeholder="Search words..."
              aria-label="Search vocabulary"
            />
          </label>

          <button
            type="button"
            onClick={handleSoundToggle}
            title={isSoundMuted ? 'Unmute card sounds' : 'Mute card sounds'}
            className={`flex h-9 items-center gap-1.5 rounded-[4px] border px-3 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
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
            <span>{isSoundMuted ? 'Muted' : 'Sound'}</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="py-2 flex flex-wrap gap-1.5">
          {(
            [
              ['cefr', 'CEFR'],
              ['domain', 'Domain'],
              ['status', 'Status'],
            ] as Array<[keyof VocabularySearchFilters, string]>
          ).map(([field, label]) => (
            <select
              key={field}
              aria-label={`Filter by ${label}`}
              value={filters[field]}
              onChange={(event) => onFilterChange(field, event.target.value)}
              className="min-h-7 rounded-[4px] border border-border-soft bg-surface px-2 text-[10px] font-medium focus:border-[#0047bb] outline-none cursor-pointer"
            >
              {(field === 'status'
                ? ['All', 'New', 'Learned', 'Mastered', 'Struggling']
                : filterOptions(field)
              ).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))}
        </div>
      )}

      {searchError && (
        <p className="py-1 text-[10px] text-rose-600">{searchError}</p>
      )}
      {isSearchLoading && (
        <p className="py-1 text-[10px] text-[#0047bb] animate-pulse">
          Searching...
        </p>
      )}
      {hasSearched && searchResults.length > 0 && (
        <p className="py-1 text-[10px] text-muted-copy">
          Showing {searchResults.length} of {allSearchResults.length} results
          found
        </p>
      )}

      <div className="flex items-center gap-3 py-2 border-t border-border-soft mt-1">
        {canStartQuiz ? (
          <button
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 rounded-[4px] bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover"
          >
            <Zap className="h-3 w-3" />
            Quiz ({learnedWords.length})
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-[4px] border border-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5">
            <Lock className="h-3 w-3 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-700">
              Locked — Learn {QUIZ_THRESHOLD - learnedCount} more
            </span>
            <div className="h-1 w-20 rounded-full bg-amber-200 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{
                  width: `${Math.min((learnedCount / QUIZ_THRESHOLD) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {strugglingCount > 0 && (
          <button
            onClick={onOpenStrugglingQuiz}
            className="flex items-center gap-1 rounded-[4px] border border-red-300 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 transition hover:bg-red-100"
          >
            Struggling ({strugglingCount})
          </button>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-copy">
          <Info className="h-3 w-3" />
          {learnedCount}/{QUIZ_THRESHOLD} learned
        </div>
      </div>
    </div>
  );
}
