import { Search } from 'lucide-react';
import type {
  VocabularySearchFilters,
  VocabularyTerm,
  VocabularyMenuStatus,
} from '@/features/vocabulary';

const TABS = ['New', 'Learned', 'Mastered', 'Struggling'] as const;
const TAB_LABELS = {
  New: 'New',
  Learned: 'Learned',
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
}: VocabularyHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-soft -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex h-12 shrink-0 items-center gap-3">
        <h1 className="shrink-0 text-sm font-bold tracking-tight text-foreground">Vocabulary</h1>
        <span className="shrink-0 rounded-[4px] border border-border-soft bg-surface px-2 py-0.5 text-[8px] font-bold uppercase text-[#0047bb]">{vocabularyLevel}</span>

        <div className="flex flex-1 gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={activeTab === tab}
              onClick={() => chooseTab(tab)}
              className={`shrink-0 rounded-[4px] border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'border-[#0047bb]/40 bg-[#0047bb]/5 text-[#0047bb]'
                  : 'border-border-soft text-muted-copy hover:text-foreground'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <label className="relative shrink-0 w-40 sm:w-48">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-copy" />
          <input
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void onSearchSubmit(event);
              }
            }}
            className="min-h-8 w-full rounded-[4px] border border-border-soft bg-surface pl-7 pr-2 text-xs outline-none focus:border-[#0047bb]/50 text-foreground"
            placeholder="Search..."
            aria-label="Search vocabulary"
          />
        </label>
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

      {searchError && <p className="py-1 text-[10px] text-rose-600">{searchError}</p>}
      {isSearchLoading && <p className="py-1 text-[10px] text-[#0047bb] animate-pulse">Searching...</p>}
      {hasSearched && searchResults.length > 0 && (
        <p className="py-1 text-[10px] text-muted-copy">
          {searchResults.length}/{allSearchResults.length} results
        </p>
      )}
    </div>
  );
}
