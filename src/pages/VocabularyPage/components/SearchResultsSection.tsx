import { Plus, Search } from 'lucide-react';
import { CEFR_LEVELS, type CefrLevel } from '@/features/level-system';
import type {
  VocabularyTerm,
  VocabularyMenuState,
} from '@/features/vocabulary';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { WordCard } from './WordCard';
import type { VocabularyUIState } from '../VocabularyPageReducer';

interface SearchResultsSectionProps {
  hasSearched: boolean;
  searchResults: VocabularyTerm[];
  allSearchResults: VocabularyTerm[];
  isSearchLoading: boolean;
  searchQuery: string;
  showAddForm: boolean;
  customDraft: VocabularyUIState['customDraft'];
  menuState: VocabularyMenuState;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
  onLearn: (term: VocabularyTerm) => void;
  onSetShowAddForm: (show: boolean) => void;
  onSetCustomDraft: (draft: VocabularyUIState['customDraft']) => void;
  onAddCustomWord: (event: React.FormEvent) => void;
}

export function SearchResultsSection({
  hasSearched,
  searchResults,
  allSearchResults,
  isSearchLoading,
  searchQuery,
  showAddForm,
  customDraft,
  menuState,
  onReview,
  onLearn,
  onSetShowAddForm,
  onSetCustomDraft,
  onAddCustomWord,
}: SearchResultsSectionProps) {
  if (!hasSearched) return null;

  if (searchResults.length > 0) {
    return (
      <SectionCard
        title="Search Results"
        subtitle={`Showing ${searchResults.length} of ${allSearchResults.length} matches`}
        icon={Search}
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {searchResults.map((term) => (
            <WordCard
              key={term.id}
              term={term}
              progress={menuState.progress[term.id]}
              mode="View"
              onReview={onReview}
              onLearn={onLearn}
            />
          ))}
        </div>
      </SectionCard>
    );
  }

  if (!isSearchLoading) {
    return (
      <SectionCard
        title="No canonical match"
        subtitle={
          searchQuery
            ? `${searchQuery} is not in the canonical repository`
            : 'No terms match the selected filters'
        }
        icon={Plus}
      >
        {searchQuery && !showAddForm && (
          <Button
            onClick={() => {
              onSetCustomDraft({ ...customDraft, term: searchQuery });
              onSetShowAddForm(true);
            }}
            className="rounded-[4px]"
          >
            <Plus className="h-4 w-4" /> Add to My Vocabulary
          </Button>
        )}
        {showAddForm && (
          <form
            aria-label="Add to My Vocabulary"
            onSubmit={onAddCustomWord}
            className="grid gap-4 md:grid-cols-2"
          >
            <label className="text-sm font-semibold">
              English term
              <input
                required
                value={customDraft.term}
                onChange={(event) =>
                  onSetCustomDraft({ ...customDraft, term: event.target.value })
                }
                className="mt-1 min-h-11 w-full rounded-[4px] border border-border-soft px-3 font-normal bg-surface outline-none focus:border-[#0047bb] focus:ring-2 focus:ring-[#0047bb]/10"
              />
            </label>
            <label className="text-sm font-semibold">
              Turkish meaning
              <input
                required
                value={customDraft.turkishMeaning}
                onChange={(event) =>
                  onSetCustomDraft({
                    ...customDraft,
                    turkishMeaning: event.target.value,
                  })
                }
                className="mt-1 min-h-11 w-full rounded-[4px] border border-border-soft px-3 font-normal bg-surface outline-none focus:border-[#0047bb] focus:ring-2 focus:ring-[#0047bb]/10"
              />
            </label>
            <label className="text-sm font-semibold">
              Example
              <input
                required
                value={customDraft.exampleSentence}
                onChange={(event) =>
                  onSetCustomDraft({
                    ...customDraft,
                    exampleSentence: event.target.value,
                  })
                }
                className="mt-1 min-h-11 w-full rounded-[4px] border border-border-soft px-3 font-normal bg-surface outline-none focus:border-[#0047bb] focus:ring-2 focus:ring-[#0047bb]/10"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">
                CEFR
                <select
                  value={customDraft.cefrLevel}
                  onChange={(event) =>
                    onSetCustomDraft({
                      ...customDraft,
                      cefrLevel: event.target.value as CefrLevel,
                    })
                  }
                  className="mt-1 min-h-11 w-full rounded-[4px] border border-border-soft bg-surface px-3 font-normal cursor-pointer outline-none focus:border-[#0047bb]"
                >
                  {CEFR_LEVELS.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Domain
                <input
                  required
                  value={customDraft.domain}
                  onChange={(event) =>
                    onSetCustomDraft({
                      ...customDraft,
                      domain: event.target.value,
                    })
                  }
                  className="mt-1 min-h-11 w-full rounded-[4px] border border-border-soft px-3 font-normal bg-surface outline-none focus:border-[#0047bb] focus:ring-2 focus:ring-[#0047bb]/10"
                />
              </label>
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit" className="rounded-[4px]">
                <Plus className="h-4 w-4" /> Save to My Vocabulary
              </Button>
              <span className="text-xs font-bold text-foreground0">
                AI Assist Coming Soon
              </span>
            </div>
          </form>
        )}
      </SectionCard>
    );
  }

  return null;
}
