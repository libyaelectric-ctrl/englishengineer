import { BookOpen, CheckCircle2, Zap } from 'lucide-react';

import { useMemo, useRef, useState } from 'react';

import { SectionCard } from '@/shared/components/SectionCard';
import {
  type PipelineStation,
  UniversalCyberPipeline,
} from '@/shared/components/UniversalCyberPipeline';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { PersonalAIPanel } from '@/features/ai/PersonalAIPanel';
import { useAuthStore } from '@/features/auth';
import { CEFR_LEVELS, type CefrLevel } from '@/features/level-system';
import { useLocalizationStore } from '@/features/localization';
import { interpolate } from '@/features/localization/interpolate';
import { VocabularyMenuService, type VocabularyTerm } from '@/features/vocabulary';

import { MasteredHeatmap } from './components/MasteredHeatmap';
import { QuizSection } from './components/QuizSection';
import { SearchModal } from './components/SearchModal';
import { SearchResultsSection } from './components/SearchResultsSection';
import { VocabularyHeader } from './components/VocabularyHeader';
import { WordSetSection } from './components/WordSetSection';
import { useVocabularyPage } from './hooks/useVocabularyPage';

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
    hearts,
    heartsDepletedAt,
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
    showSearchModal,
    openSearchModal,
    closeSearchModal,
  } = useVocabularyPage();

  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const wordSetRef = useRef<HTMLDivElement>(null);

  const handleStartExercise = () => {
    chooseTab('New');
    setTimeout(() => {
      wordSetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const vocabularySummary = useMemo(() => VocabularyMenuService.getSummary(menuState), [menuState]);

  const vocabularyStations: PipelineStation[] = useMemo(() => {
    const termsByLevel = new Map<CefrLevel, VocabularyTerm[]>();
    terms.forEach((term) => {
      const list = termsByLevel.get(term.cefrLevel) ?? [];
      list.push(term);
      termsByLevel.set(term.cefrLevel, list);
    });

    return CEFR_LEVELS.map((level) => {
      const levelTerms = termsByLevel.get(level) ?? [];
      const mastered = levelTerms.filter(
        (term) => menuState.progress[term.id]?.status === 'Mastered'
      ).length;
      const learned = levelTerms.filter((term) => {
        const status = menuState.progress[term.id]?.status;
        return status === 'Learning' || status === 'Learned' || status === 'Mastered';
      }).length;
      const sampleTerms = levelTerms
        .slice(0, 3)
        .map((term) => term.term)
        .join(' · ');
      const hasData = levelTerms.length > 0;
      const isCurrent = level === vocabularyLevel;
      const disciplineLabel = userDiscipline ? userDiscipline.toUpperCase() : 'MÜHENDİSLİK';

      return {
        id: `vocab-${level}`,
        levelBadge: level,
        title: sampleTerms || `${level} Engineering Terminology`,
        subtitle: hasData
          ? interpolate(translate('pipeline.vocab.stationSubtitle'), {
              count: levelTerms.length,
              discipline: disciplineLabel,
            })
          : interpolate(translate('pipeline.vocab.stationFallback'), {
              discipline: disciplineLabel,
            }),
        status:
          hasData && mastered > 0 && mastered === levelTerms.length
            ? 'completed'
            : isCurrent
              ? 'in-progress'
              : 'available',
        progressRatio: hasData ? learned / levelTerms.length : 0,
        totalItems: hasData ? levelTerms.length : vocabularySummary.total,
        completedItems: hasData ? mastered : 0,
        onAction: handleStartExercise,
      };
    });
  }, [terms, menuState, vocabularyLevel, userDiscipline, chooseTab, vocabularySummary, translate]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300 relative pb-8">
      {/* Cyber Telemetry Vocabulary Energy Pipeline */}
      <UniversalCyberPipeline
        title={translate('pipeline.vocab.title')}
        subtitle={interpolate(translate('pipeline.vocab.subtitle'), {
          discipline: userDiscipline ? userDiscipline.toUpperCase() : 'Engineering',
        })}
        badgeText={`CEFR: ${vocabularyLevel}`}
        icon={BookOpen}
        stations={vocabularyStations}
        activeStationId={selectedStationId ?? `vocab-${vocabularyLevel}`}
        onSelectStation={(id) => setSelectedStationId(id)}
        translate={translate}
        metrics={[
          {
            icon: <BookOpen className="h-4 w-4 text-cyan-400" />,
            label: translate('pipeline.metric.totalTerms'),
            value: vocabularySummary.total,
          },
          {
            icon: <Zap className="h-4 w-4 text-amber-400" />,
            label: translate('pipeline.metric.activeLevel'),
            value: vocabularyLevel,
          },
          {
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
            label: translate('pipeline.metric.mastery'),
            value:
              vocabularySummary.total > 0
                ? `${Math.round((vocabularySummary.mastered / vocabularySummary.total) * 100)}%`
                : '0%',
          },
        ]}
      />
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
        hearts={hearts}
        heartsDepletedAt={heartsDepletedAt}
        onSearchInputChange={(input) => dispatchSearch({ type: 'SET_SEARCH_INPUT', input })}
        onSearchSubmit={runSearch}
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
        <PersonalAIPanel
          discipline={userDiscipline}
          cefrLevel={vocabularyLevel}
          userName={currentUser?.displayName}
        />

        <SearchModal
          isOpen={showSearchModal}
          onClose={closeSearchModal}
          onSearch={runSearch}
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

        <div ref={wordSetRef}>
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
        </div>

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
