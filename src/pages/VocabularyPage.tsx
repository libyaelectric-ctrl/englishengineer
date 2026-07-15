import { CheckCircle2 } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { MasteredHeatmap } from './VocabularyPage/components/MasteredHeatmap';
import { VocabularyHeader } from './VocabularyPage/components/VocabularyHeader';
import { SearchResultsSection } from './VocabularyPage/components/SearchResultsSection';
import { WordSetSection } from './VocabularyPage/components/WordSetSection';
import { useVocabularyPage } from './VocabularyPage/hooks/useVocabularyPage';

const VocabularyPage = () => {
  const {
    vocabularyLevel,
    allLevelsLoaded,
    loadError,
    terms,
    menuState,
    wordSet,
    searchResults,
    allSearchResults,
    activeTab,
    mode,
    learningDomain,
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
    runSearch,
    addCustomWord,
    filterOptions,
    dispatchUI,
    dispatchSearch,
    dispatchData,
    selectSet,
  } = useVocabularyPage();

  return (
    <div className="animate-in fade-in duration-300 relative">
      <VocabularyHeader
        vocabularyLevel={vocabularyLevel}
        allLevelsLoaded={allLevelsLoaded}
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
        onSearchSubmit={runSearch}
        onFilterChange={(field, value) =>
          dispatchSearch({
            type: 'COMMIT_FILTERS',
            filters: { ...filters, [field]: value },
          })
        }
      />

      <div className="pt-4 space-y-4 pb-20">
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
          learningDomain={learningDomain}
          filterOptions={filterOptions}
          loadError={loadError}
          terms={terms}
          wordSet={wordSet}
          mode={mode}
          menuState={menuState}
          onReview={reviewWord}
          onLearn={learnWord}
          onDomainChange={(domain) => {
            dispatchUI({ type: 'SET_LEARNING_DOMAIN', domain });
            dispatchData({
              type: 'SET_WORD_SET_IDS',
              wordSetIds: selectSet(activeTab, menuState, domain),
            });
          }}
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
