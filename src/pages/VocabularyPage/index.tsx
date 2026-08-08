import { CheckCircle2 } from 'lucide-react';

import { SectionCard } from '@/shared/components/SectionCard';

import { useAuthStore } from '@/features/auth';
import { PersonalAIPanel } from '@/features/ai/PersonalAIPanel';
import { useLocalizationStore } from '@/features/localization';

import { MasteredHeatmap } from './components/MasteredHeatmap';
import { QuizSection } from './components/QuizSection';
import { SearchModal } from './components/SearchModal';
import { SearchResultsSection } from './components/SearchResultsSection';
import { VocabularyHeader } from './components/VocabularyHeader';
import { WordSetSection } from './components/WordSetSection';
import { useVocabularyPage } from './hooks/useVocabularyPage';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

const VocabularyPage = () => {
  const translate = useLocalizationStore((s) => s.translate);
  const currentUser = useAuthStore((s) => s.currentUser);
  const userDiscipline = (currentUser?.engineeringDiscipline as EngineeringDiscipline) ?? null;
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
        onSearchInputChange={(input) => dispatchSearch({ type: 'SET_SEARCH_INPUT', input })}
        onSearchSubmit={async (query: string) => {
          dispatchSearch({ type: 'RUN_SEARCH', query });
        }}
        onFilterChange={(field, value) =>
          dispatchSearch({
            type: 'COMMIT_FILTERS',
            filters: { ...filters, [field]: value },
          })
        }
        onOpenSearch={openSearchModal}
        menuState={menuState}
      />

      <div className="pt-4 space-y-4 pb-20">
        <PersonalAIPanel discipline={userDiscipline} cefrLevel={vocabularyLevel} userName={currentUser?.displayName} />

        <SearchModal
          isOpen={showSearchModal}
          onClose={closeSearchModal}
          onSearch={async (query: string) => {
            dispatchSearch({ type: 'RUN_SEARCH', query });
          }}
          searchInput={searchInput}
          onSearchInputChange={(input) => dispatchSearch({ type: 'SET_SEARCH_INPUT', input })}
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
          onSetShowAddForm={(show) => dispatchUI({ type: 'SET_SHOW_ADD_FORM', show })}
          onSetCustomDraft={(draft) => dispatchUI({ type: 'SET_CUSTOM_DRAFT', draft })}
          onAddCustomWord={addCustomWord}
        />

        {activeTab === 'Learned' && <QuizSection menuState={menuState} />}

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
            title={translate('vocabulary.masteredActivity')}
            subtitle={translate('vocabulary.masteredActivityDesc')}
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
