import { Search } from 'lucide-react';
import type { VocabularySearchFilters, VocabularyTerm, VocabularyMenuStatus } from '@/features/vocabulary';

const TABS = ['New', 'Learning', 'Mastered'] as const;
const TAB_LABELS = {
  New: 'New',
  Learning: 'Learned',
  Mastered: 'Mastered',
};

interface VocabularyHeaderProps {
  vocabularyLevel: string;
  allLevelsLoaded: boolean;
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
}

export { TABS, TAB_LABELS };

export function VocabularyHeader({
  vocabularyLevel,
  allLevelsLoaded,
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
}: VocabularyHeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex flex-col bg-background py-3 border-b border-border-soft shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
            {vocabularyLevel} Vocabulary Path
          </p>
          <h1 className="mt-0.5 truncate text-sm font-black tracking-tight sm:text-base">
            Vocabulary
          </h1>
          <p className="mt-0.5 text-[10px] text-muted-copy">
            {allLevelsLoaded
              ? 'All 5,000 canonical terms are available for this search.'
              : `${vocabularyLevel} learning terms are loaded. Full search loads the remaining levels only when requested.`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={activeTab === tab}
              onClick={() => chooseTab(tab)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                activeTab === tab
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-border-soft bg-surface text-muted-copy hover:text-foreground'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
        <label className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
          <input
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void onSearchSubmit(event);
              }
            }}
            className="min-h-10 w-full rounded-lg border border-border-soft bg-surface px-10 text-sm outline-none focus:border-primary/50"
            placeholder="Search..."
            aria-label="Search vocabulary"
          />
        </label>
      </div>

      {showFilters && (
        <div className="mt-3 grid gap-2 rounded-lg border border-border-soft bg-surface p-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['cefr', 'CEFR'],
              ['domain', 'Domain'],
              ['contentDomain', 'Content domain'],
              ['lifeContext', 'Life context'],
              ['partOfSpeech', 'Part of speech'],
              ['skillUse', 'Skill use'],
              ['status', 'Status'],
            ] as Array<[keyof VocabularySearchFilters, string]>
          ).map(([field, label]) => (
            <label key={field} className="text-[10px] font-bold text-foreground">
              {label}
              <select
                aria-label={`Filter by ${label}`}
                value={filters[field]}
                onChange={(event) => onFilterChange(field, event.target.value)}
                className="mt-1 min-h-8 w-full rounded-lg border border-border-soft bg-background px-2 text-[11px] font-normal focus:border-primary outline-none"
              >
                {(field === 'status'
                  ? ['All', 'New', 'Learning', 'Mastered', 'Weak', 'Forgotten', 'Due Today']
                  : filterOptions(field)
                ).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

      {searchError && (
        <p className="mt-2 text-xs font-semibold text-rose-700">{searchError}</p>
      )}
      {isSearchLoading && (
        <p role="status" className="mt-2 text-[10px] font-bold text-primary">
          Checking all 5,000 canonical terms…
        </p>
      )}
      {hasSearched && searchResults.length > 0 && (
        <p className="mt-2 text-[10px] text-muted-copy">
          {searchResults.length} of {allSearchResults.length} results found
        </p>
      )}
    </div>
  );
}
