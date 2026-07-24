import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { MasteredHeatmap } from './VocabularyPage/components/MasteredHeatmap';
import { VocabularyHeader } from './VocabularyPage/components/VocabularyHeader';
import { SearchResultsSection } from './VocabularyPage/components/SearchResultsSection';
import { WordSetSection } from './VocabularyPage/components/WordSetSection';
import { QuizModal } from './VocabularyPage/components/QuizModal';
import { SearchModal } from './VocabularyPage/components/SearchModal';
import { useVocabularyPage } from './VocabularyPage/hooks/useVocabularyPage';
import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';

const VocabularyPage = () => {
  const [quizOpen, setQuizOpen] = useState(false);
  const [strugglingQuizOpen, setStrugglingQuizOpen] = useState(false);
  const wordProgress = useVocabularyStore((s) => s.wordProgress);

  const learnedWords = Object.values(wordProgress)
    .filter((w) => w.status === 'learned')
    .map((w) => ({ id: w.wordId, term: w.wordId, turkishMeaning: w.wordId }));

  const strugglingWords = Object.values(wordProgress)
    .filter((w) => w.status === 'struggling')
    .map((w) => ({ id: w.wordId, term: w.wordId, turkishMeaning: w.wordId }));
  const {
    vocabularyLevel,
    loadError,
    terms,
    menuState,
    wordSet,
    searchResults,
    allSearchResults,
    activeTab,
    mode,
    showFilters,
    showAddForm,
    customDraft,
    isSearchLoading,
    searchInput,
    searchQuery,
    searchError,
    hasSearched,
    filters,
    vocabularyProfile,
    chooseTab,
    reviewWord,
    learnWord,
    exportCSV,
    loadNextBatch,
    addCustomWord,
    filterOptions,
    dispatchUI,
    dispatchSearch,
    showSearchModal,
    openSearchModal,
    closeSearchModal,
  } = useVocabularyPage();

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300 relative pb-8">
      <VocabularyHeader
        vocabularyLevel={vocabularyLevel}
        activeTab={activeTab}
        searchInput={searchInput}
        showFilters={showFilters}
        filters={filters}
        isSearchLoading={isSearchLoading}
        searchError={searchError}
        hasSearched={hasSearched}
        searchResults={searchResults}
        allSearchResults={allSearchResults}
        filterOptions={filterOptions}
        chooseTab={chooseTab}
        onSearchInputChange={(input) =>
          dispatchSearch({ type: 'SET_SEARCH_INPUT', input })
        }
        onSearchSubmit={async (query: string) => {
          dispatchSearch({ type: 'RUN_SEARCH', query });
        }}
        onFilterChange={(field, value) =>
          dispatchSearch({
            type: 'COMMIT_FILTERS',
            filters: { ...filters, [field]: value },
          })
        }
        onOpenQuiz={() => setQuizOpen(true)}
        onOpenStrugglingQuiz={() => setStrugglingQuizOpen(true)}
        onOpenSearch={openSearchModal}
      />

      <div className="pt-4 space-y-4 pb-20">
        <QuizModal
          isOpen={quizOpen}
          onClose={() => setQuizOpen(false)}
          words={learnedWords.slice(0, 10)}
        />
        <QuizModal
          isOpen={strugglingQuizOpen}
          onClose={() => setStrugglingQuizOpen(false)}
          words={strugglingWords.slice(0, 10)}
          isStrugglingQuiz
        />

        <SearchModal
          isOpen={showSearchModal}
          onClose={closeSearchModal}
          onSearch={async (query: string) => {
            dispatchSearch({ type: 'RUN_SEARCH', query });
          }}
          searchInput={searchInput}
          onSearchInputChange={(input) =>
            dispatchSearch({ type: 'SET_SEARCH_INPUT', input })
          }
          searchResults={searchResults}
          hasSearched={hasSearched}
        />

        <SearchResultsSection
          hasSearched={hasSearched}
          searchResults={searchResults}
          allSearchResults={allSearchResults}
          isSearchLoading={isSearchLoading}
          searchQuery={searchQuery}
          showAddForm={showAddForm}
          customDraft={customDraft}
          menuState={menuState}
          onReview={reviewWord}
          onLearn={learnWord}
          onSetShowAddForm={(show) =>
            dispatchUI({ type: 'SET_SHOW_ADD_FORM', show })
          }
          onSetCustomDraft={(draft) =>
            dispatchUI({ type: 'SET_CUSTOM_DRAFT', draft })
          }
          onAddCustomWord={addCustomWord}
        />

        <WordSetSection
          activeTab={activeTab}
          vocabularyProfile={vocabularyProfile}
          loadError={loadError}
          terms={terms}
          wordSet={wordSet}
          mode={mode}
          menuState={menuState}
          onReview={reviewWord}
          onLearn={learnWord}
          onExportCSV={exportCSV}
          onLoadNextBatch={loadNextBatch}
        />

        {activeTab === 'Mastered' && (
          <SectionCard
            title="Mastered Words Activity"
            subtitle="Your learning activity over the last 12 weeks"
            icon={CheckCircle2}
          >
            <MasteredHeatmap menuState={menuState} />
          </SectionCard>
        )}
      </div>
    </div>
  );
};

export default VocabularyPage;
