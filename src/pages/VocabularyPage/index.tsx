import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VocabularyHeader, TABS, TAB_LABELS } from './components/VocabularyHeader';
import { ProgressMetrics } from './ProgressMetrics';
import { MyVocabularySection } from './MyVocabularySection';
import { SearchResultsSection } from './components/SearchResultsSection';
import { WordSetSection } from './components/WordSetSection';
import { BadgePanel } from './components/BadgePanel';
import { useVocabularyPage } from './hooks/useVocabularyPage';

const VocabularyPage = () => {
  const {
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
    onOpenSearch,
    menuState,
    myVocabulary,
    progressMetrics,
    badgePanel,
    wordSet,
    onArchive,
    onUpdate,
  } = useVocabularyPage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, easing: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-background text-foreground"
    >
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
        onSearchInputChange={onSearchInputChange}
        onSearchSubmit={onSearchSubmit}
        onFilterChange={onFilterChange}
        onOpenSearch={onOpenSearch}
        menuState={menuState}
      />

      <div className="space-y-6">
        {/* Progress Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, easing: [0.25, 1, 0.5, 1] }}
        >
          <ProgressMetrics {...progressMetrics} />
        </motion.div>

        {/* Badge Panel */}
        {badgePanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <BadgePanel {...badgePanel} />
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'New' && (
            <motion.div
              key="new"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3, easing: [0.25, 1, 0.5, 1] }}
            >
              <WordSetSection {...wordSet} />
            </motion.div>
          )}

          {(activeTab === 'Learned' || activeTab === 'Learning') && (
            <motion.div
              key="learned"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3, easing: [0.25, 1, 0.5, 1] }}
            >
              <MyVocabularySection
                myVocabulary={myVocabulary}
                onUpdate={onUpdate}
              />
            </motion.div>
          )}

          {activeTab === 'Mastered' && (
            <motion.div
              key="mastered"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3, easing: [0.25, 1, 0.5, 1] }}
            >
              <MyVocabularySection
                myVocabulary={myVocabulary}
                onUpdate={onUpdate}
              />
            </motion.div>
          )}

          {activeTab === 'Struggling' && (
            <motion.div
              key="struggling"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3, easing: [0.25, 1, 0.5, 1] }}
            >
              <MyVocabularySection
                myVocabulary={myVocabulary}
                onUpdate={onUpdate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2, easing: [0.25, 1, 0.5, 1] }}
          >
            <SearchResultsSection
              results={searchResults}
              isLoading={isSearchLoading}
              error={searchError}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VocabularyPage;
