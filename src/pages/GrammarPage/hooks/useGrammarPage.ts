import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '@/features/auth';
import {
  GrammarProgressService,
  GrammarRepository,
  useGrammarStore,
} from '@/features/grammar';
import { CEFR_LEVELS, type CefrLevel } from '@/features/level-system';
import { getBaseCefrLevel, useLearningCockpit } from '@/features/profile';
import { VocabularyRepository } from '@/features/vocabulary';
import { useLearningStore } from '@/core/learning';
import { showToast } from '@/shared/components/Toast';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import {
  getLessonStatus,
  getModuleLabel,
  normalizeKey,
  EMPTY_LEVEL_COUNTS,
} from '../GrammarPageHelpers';

export function useGrammarPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { profile } = useLearningCockpit(currentUser?.id);
  const level = getBaseCefrLevel(profile.skills.grammar.cefrBand);
  const grammarPoolIds = useLearningStore((state) => state.grammarPool);

  const { rules, selectedId, query, setRules, setSelectedId, setQuery } =
    useGrammarStore();

  const lessonStripRef = useRef<HTMLDivElement>(null);

  const [vocabularyIndex, setVocabularyIndex] = useState<
    Record<string, string>
  >({});
  const [quizOpen, setQuizOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [progressVersion, setProgressVersion] = useState(0);
  const [levelCounts, setLevelCounts] =
    useState<Record<CefrLevel, number>>(EMPTY_LEVEL_COUNTS);

  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    void GrammarRepository.getAllRulesSorted().then(async (all) => {
      if (!active) return;
      setRules(all);

      const unlocked = new Set<string>();
      for (const r of all) {
        const isUnlocked = await GrammarProgressService.isLessonUnlocked(r.id);
        if (isUnlocked) {
          unlocked.add(r.id);
        } else {
          break;
        }
      }
      if (all[0]) unlocked.add(all[0].id);
      setUnlockedIds(unlocked);

      if (!selectedId) {
        const currentActive = all.find(
          (r) => !GrammarProgressService.get(r.id).isPassed
        );
        setSelectedId(currentActive?.id ?? all[0]?.id ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, [selectedId, setRules, setSelectedId, progressVersion]);

  useEffect(() => {
    let active = true;
    void Promise.all(
      CEFR_LEVELS.map(async (cefrLevel) => {
        const levelRules =
          await GrammarRepository.getGrammarRulesByLevel(cefrLevel);
        return [cefrLevel, levelRules.length] as const;
      })
    ).then((entries) => {
      if (!active) return;
      setLevelCounts({
        A1: entries.find(([l]) => l === 'A1')?.[1] ?? 0,
        A2: entries.find(([l]) => l === 'A2')?.[1] ?? 0,
        B1: entries.find(([l]) => l === 'B1')?.[1] ?? 0,
        B2: entries.find(([l]) => l === 'B2')?.[1] ?? 0,
        C1: entries.find(([l]) => l === 'C1')?.[1] ?? 0,
        C2: entries.find(([l]) => l === 'C2')?.[1] ?? 0,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void VocabularyRepository.getVocabularyForUserSkillLevel(
      'grammar',
      level
    ).then((terms) => {
      if (!active) return;
      const next: Record<string, string> = {};
      terms.forEach((term) => {
        [
          term.id,
          term.term,
          term.normalizedTerm,
          term.grammarDomainAlias,
          ...term.tags,
          ...term.grammarFits,
          ...term.relatedTerms,
        ].forEach((key) => {
          if (key) next[normalizeKey(key)] = term.term;
        });
      });
      setVocabularyIndex(next);
    });
    return () => {
      active = false;
    };
  }, [level]);

  const rulesWithProgress = useMemo(
    () =>
      rules.map((rule) => ({
        rule,
        progress: GrammarProgressService.get(rule.id),
        status: getLessonStatus(GrammarProgressService.get(rule.id)),
        isUnlocked: unlockedIds.has(rule.id),
      })),
    [rules, progressVersion, unlockedIds]
  );

  const visibleRules = useMemo(() => {
    const nq = query.trim().toLowerCase();
    return rulesWithProgress.filter(
      ({ rule }) =>
        !nq ||
        [
          rule.title,
          rule.ruleTitle,
          rule.structure,
          rule.engineeringUseCase,
          rule.turkishExplanation,
          getModuleLabel(rule.grammarCategory),
        ]
          .join(' ')
          .toLowerCase()
          .includes(nq)
    );
  }, [query, rulesWithProgress]);

  const totalGrammarLessons = CEFR_LEVELS.reduce(
    (total, cefrLevel) => total + levelCounts[cefrLevel],
    0
  );

  useEffect(() => {
    if (visibleRules.length === 0) return;
    if (
      !selectedId ||
      !visibleRules.some(({ rule }) => rule.id === selectedId)
    ) {
      setSelectedId(visibleRules[0].rule.id);
    }
  }, [selectedId, setSelectedId, visibleRules]);

  const selectedRule =
    rules.find((rule) => rule.id === selectedId) ??
    visibleRules[0]?.rule ??
    rules[0] ??
    null;

  const selectedProgress = selectedRule
    ? GrammarProgressService.get(selectedRule.id)
    : null;

  const pathGroups = useMemo(() => {
    const groups = new Map<string, typeof visibleRules>();
    visibleRules.forEach((entry) => {
      const module = getModuleLabel(entry.rule.grammarCategory);
      groups.set(module, [...(groups.get(module) ?? []), entry]);
    });
    return Array.from(groups.entries()).map(([module, entries]) => ({
      module,
      entries,
    }));
  }, [visibleRules]);

  const linkedVocabulary = useMemo(() => {
    if (!selectedRule) return [];
    return selectedRule.linkedVocabularyTags
      .map((tag) => ({ tag, term: vocabularyIndex[normalizeKey(tag)] }))
      .filter((item): item is { tag: string; term: string } =>
        Boolean(item.term)
      )
      .slice(0, 8);
  }, [selectedRule, vocabularyIndex]);

  const nextLesson = useMemo(() => {
    if (!selectedRule) return null;
    const index = rules.findIndex((r) => r.id === selectedRule.id);
    if (index === -1 || index >= rules.length - 1) return null;
    return rules[index + 1];
  }, [rules, selectedRule]);

  const reviewTargets = rulesWithProgress
    .filter(
      (e) =>
        e.progress.reviewStatus === 'Due' ||
        e.progress.incorrectUsages > e.progress.correctUsages
    )
    .slice(0, 5);

  const masteredCount = rulesWithProgress.filter(
    (e) => e.status === 'Mastered'
  ).length;

  const selectRule = (ruleId: string) => {
    setSelectedId(ruleId);
    setQuizOpen(false);
    setHintOpen(false);
    setQuizAnswers({});
  };

  const scrollLessonStrip = (direction: 'left' | 'right') => {
    lessonStripRef.current?.scrollBy({
      left: direction === 'left' ? -420 : 420,
      behavior: 'smooth',
    });
  };

  const recordUsage = (correct: boolean) => {
    if (!selectedRule) return;
    ProductAnalyticsService.track('grammar_task_started', '/grammar', {
      metadata: {
        skill: 'grammar',
        missionId: selectedRule.id,
        source: 'user',
      },
    });
    GrammarProgressService.recordUsage(selectedRule.id, correct);
    setProgressVersion((v) => v + 1);
    showToast(
      correct
        ? 'Good. Practice evidence was saved.'
        : 'Saved for review. This lesson will stay in practice.',
      correct ? 'success' : 'info'
    );
    ProductAnalyticsService.track('grammar_task_completed', '/grammar', {
      metadata: {
        skill: 'grammar',
        missionId: selectedRule.id,
        source: 'user',
      },
    });
    ProductAnalyticsService.trackOnce('first_task_completed', '/grammar', {
      skill: 'grammar',
      source: 'user',
    });
  };

  const recordQuizResult = (correctCount: number) => {
    if (!selectedRule) return;
    const passed = correctCount >= 2;
    if (passed) {
      GrammarProgressService.recordPass(selectedRule.id);
      GrammarProgressService.recordUsage(selectedRule.id, true);
      showToast(
        'Congratulations! You passed the lesson quiz! Next lesson is unlocked.',
        'success'
      );
    } else {
      GrammarProgressService.recordUsage(selectedRule.id, false);
      showToast(
        'You did not pass the quiz. Review the explanation and try again.',
        'error'
      );
    }
    setProgressVersion((v) => v + 1);
  };

  useEffect(() => {
    if (!selectedRule || Object.keys(quizAnswers).length !== 3) return;
    let correctCount = 0;
    quizItems.forEach((item, index) => {
      const selectedLetter = quizAnswers[index];
      const correctLetter = String.fromCharCode(65 + item.correct);
      if (selectedLetter === correctLetter) {
        correctCount++;
      }
    });
    recordQuizResult(correctCount);
  }, [quizAnswers, selectedRule]);

  const quizItems = selectedRule
    ? [
        {
          question: 'Which structure are you practicing?',
          choices: [
            selectedRule.structure,
            selectedRule.engineeringUseCase,
            selectedRule.commonMistakes,
          ],
          correct: 0,
        },
        {
          question: 'Which sentence is safer?',
          choices: [
            selectedRule.correctedExampleEnglish,
            selectedRule.badExampleEnglish,
            selectedRule.definition,
          ],
          correct: 0,
        },
        {
          question: 'Where does this lesson help you most?',
          choices: [
            selectedRule.engineeringUseCase,
            selectedRule.grammarCategory,
            'Pronunciation only',
          ],
          correct: 0,
        },
      ]
    : [];

  return {
    level,
    grammarPoolIds,
    rules,
    selectedId,
    query,
    setQuery,
    lessonStripRef,
    quizOpen,
    setQuizOpen,
    hintOpen,
    setHintOpen,
    quizAnswers,
    setQuizAnswers,
    levelCounts,
    rulesWithProgress,
    visibleRules,
    totalGrammarLessons,
    selectedRule,
    selectedProgress,
    pathGroups,
    linkedVocabulary,
    nextLesson,
    reviewTargets,
    masteredCount,
    selectRule,
    scrollLessonStrip,
    recordUsage,
    quizItems,
  };
}
