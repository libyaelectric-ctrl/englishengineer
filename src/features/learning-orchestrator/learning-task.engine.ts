import { GrammarEngine } from '@/features/grammar/grammar.engine';
import { GrammarRepository } from '@/features/grammar/grammar.repository';
import { LearningIntelligenceService } from '@/features/learning-intelligence/learning-intelligence.service';
import {
  getBaseCefrLevel,
  getNextCefrBand,
  getTaskBandMix,
} from '@/features/profile/profile.utils';
import { getPreferredDomains } from '@/features/profile/profile.preferences';
import type {
  SkillName,
  UserLearningProfile,
} from '@/features/profile/profile.types';
import type { CefrLevel } from '@/features/level-system/level-system.types';
import type { LearningDataSkill } from '@/core/learning/spaced-repetition.types';
import { VocabularyMenuService } from '@/features/vocabulary/services/vocabulary.menu';
import { VocabularyRepository } from '@/features/vocabulary/services/vocabulary.repository';
import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';
import type {
  LearningTaskRecommendation,
  SelectedVocabularyTerm,
  TaskLevelAllocation,
} from './learning-orchestrator.types';
import { LessonPathEngine } from './lesson-path.engine';

const TASK_TYPE: Record<SkillName, string> = {
  reading: 'reading-comprehension',
  writing: 'writing-production',
  listening: 'listening-recognition',
  speaking: 'speaking-production',
  vocabulary: 'vocabulary-context',
  grammar: 'writing-correction',
};

const EXPECTED_ANSWER: Record<SkillName, string> = {
  reading: 'Comprehension answers with evidence from the text',
  writing: 'Level-appropriate written response',
  listening: 'Recognition answer or short transcript response',
  speaking: 'Recorded or typed speaking rehearsal; no AI scoring',
  vocabulary: 'Meaning match and contextual use',
  grammar: 'Correction plus one original example',
};

const CONTEXT_BY_SKILL: Record<SkillName, string> = {
  reading: 'Daily life, workplace, site/project, and engineering communication',
  writing: 'Level-appropriate workplace and engineering communication',
  listening: 'Level-safe spoken workplace communication',
  speaking: 'Level-safe shadowing, roleplay, or professional explanation',
  vocabulary: 'Vocabulary memory and controlled new-word acquisition',
  grammar: 'Structured grammar practice in a practical communication context',
};

const uniqueTerms = (
  items: SelectedVocabularyTerm[]
): SelectedVocabularyTerm[] => {
  const seen = new Set<string>();
  return items.filter(({ term }) => {
    if (seen.has(term.id)) return false;
    seen.add(term.id);
    return true;
  });
};

const isEligible = (
  term: VocabularyTerm,
  skill: SkillName,
  domain?: string
): boolean =>
  term.status === 'approved' &&
  term.skillUse.includes(skill) &&
  (!domain || term.domain === domain);

const rankPreferredDomains = (
  terms: VocabularyTerm[],
  preferredDomains: string[]
): VocabularyTerm[] =>
  [...terms].sort(
    (a, b) =>
      Number(preferredDomains.includes(b.domain)) -
      Number(preferredDomains.includes(a.domain))
  );

const resolveGrammarFocus = async (
  skill: SkillName,
  baseLevel: CefrLevel,
  selectedGrammar: Awaited<
    ReturnType<typeof GrammarEngine.selectGrammarForTask>
  >
) => {
  if (selectedGrammar.length > 0) return selectedGrammar.slice(0, 2);
  return (
    await GrammarRepository.getGrammarRulesForUserSkillLevel(
      skill as LearningDataSkill,
      baseLevel
    )
  ).slice(0, 2);
};

const getFocusPriority = (
  profile: UserLearningProfile,
  weakWords: number
): 'vocabulary' | 'grammar' =>
  profile.skills.vocabulary.weaknessScore + Math.min(30, weakWords * 5) >=
  profile.skills.grammar.weaknessScore
    ? 'vocabulary'
    : 'grammar';

const buildProfileContext = (profile: UserLearningProfile) =>
  [
    profile.goals.length > 0 ? `${profile.goals.join(', ')} goals` : '',
    profile.professionId
      ? `${profile.professionId.replace(/-/g, ' ')} role`
      : '',
  ]
    .filter(Boolean)
    .join(' and ');

const buildWhyRecommended = (
  skill: SkillName,
  recommended: boolean | undefined,
  profileContext: string
) => {
  const ctxSuffix = profileContext ? ` with ${profileContext}` : '';
  return recommended
    ? `${skill} is currently the weakest independent skill profile${profileContext ? `; context is aligned with ${profileContext}` : ''}.`
    : `Selected manually at the current ${skill} level${ctxSuffix}.`;
};

export const getTaskLevelAllocation = (
  profile: UserLearningProfile,
  skill: SkillName
): TaskLevelAllocation[] => {
  const [safe, stretch] = getTaskBandMix(profile.skills[skill].cefrBand);
  return [
    { band: safe.band, kind: 'safe' },
    { band: safe.band, kind: 'safe' },
    { band: safe.band, kind: 'safe' },
    { band: stretch.band, kind: 'stretch' },
  ];
};

export const LearningTaskEngine = {
  getWeakestSkill(profile: UserLearningProfile): SkillName {
    return [...Object.values(profile.skills)].sort(
      (a, b) =>
        b.weaknessScore - a.weaknessScore ||
        a.completedTasks - b.completedTasks ||
        a.elo - b.elo
    )[0].skill;
  },

  getOpportunitySkill(profile: UserLearningProfile): SkillName {
    return LessonPathEngine.getCatchUpSkill(profile);
  },

  async selectTaskVocabulary(
    profile: UserLearningProfile,
    skill: SkillName,
    domain?: string
  ): Promise<SelectedVocabularyTerm[]> {
    const band = profile.skills[skill].cefrBand;
    const currentLevel = getBaseCefrLevel(band);
    const stretchLevel = getBaseCefrLevel(getNextCefrBand(band));
    const memory = VocabularyMenuService.getState();
    const preferredDomains = domain ? [] : getPreferredDomains(profile);
    const memoryIds = Object.entries(memory.progress)
      .filter(([, progress]) =>
        ['Learning', 'Mastered'].includes(progress.status)
      )
      .map(([id]) => id);
    const [known, currentTerms, stretchTerms] = await Promise.all([
      Promise.all(
        memoryIds.map((id) => VocabularyRepository.getVocabularyTermById(id))
      ),
      VocabularyRepository.getVocabularyByLevel(currentLevel),
      VocabularyRepository.getVocabularyByLevel(stretchLevel),
    ]);
    const memoryTerms = known
      .filter((term): term is VocabularyTerm => Boolean(term))
      .filter((term) => isEligible(term, skill, domain))
      .map((term) => ({ term, bucket: 'memory' as const }))
      .slice(0, 7);
    const currentNew = rankPreferredDomains(currentTerms, preferredDomains)
      .filter(
        (term) => isEligible(term, skill, domain) && !memory.progress[term.id]
      )
      .map((term) => ({ term, bucket: 'current-new' as const }));
    const stretchNew = rankPreferredDomains(stretchTerms, preferredDomains)
      .filter(
        (term) => isEligible(term, skill, domain) && !memory.progress[term.id]
      )
      .map((term) => ({ term, bucket: 'stretch' as const }));
    const currentPriority = currentNew.slice(0, 2);
    const priorityIds = new Set([
      ...memoryTerms.map(({ term }) => term.id),
      ...currentPriority.map(({ term }) => term.id),
    ]);
    const stretchPriority = stretchNew.find(
      ({ term }) => !priorityIds.has(term.id)
    );
    const preferred = uniqueTerms([
      ...memoryTerms,
      ...currentPriority,
      ...(stretchPriority ? [stretchPriority] : []),
    ]);
    const fallback = uniqueTerms([
      ...preferred,
      ...currentNew,
      ...stretchNew,
      ...memoryTerms,
    ]);
    return fallback.slice(0, 10);
  },

  async createRecommendation(
    profile: UserLearningProfile,
    skill: SkillName,
    options: { domain?: string; recommended?: boolean } = {}
  ): Promise<LearningTaskRecommendation> {
    const skillProfile = profile.skills[skill];
    const lessonProgress = LessonPathEngine.getSkillProgress(profile, skill);
    const safeCefr = skillProfile.cefrBand;
    const stretchCefr = getNextCefrBand(safeCefr);
    const baseLevel = getBaseCefrLevel(safeCefr);
    const [vocabularyFocus, selectedGrammar] = await Promise.all([
      this.selectTaskVocabulary(profile, skill, options.domain),
      GrammarEngine.selectGrammarForTask(
        skill,
        baseLevel,
        TASK_TYPE[skill],
        options.domain
      ),
    ]);
    const grammarFocus = await resolveGrammarFocus(
      skill,
      baseLevel,
      selectedGrammar
    );
    const intelligence = LearningIntelligenceService.load();
    const weakWords = Object.values(
      VocabularyMenuService.getState().progress
    ).filter((word) => word.isWeak).length;
    const focusPriority = getFocusPriority(profile, weakWords);
    const profileContext = buildProfileContext(profile);

    return {
      id: `task_${skill}_${safeCefr.replace('+', 'plus')}`,
      skill,
      taskType: TASK_TYPE[skill],
      targetCefr: safeCefr,
      safeCefr,
      stretchCefr,
      levelAllocation: getTaskLevelAllocation(profile, skill),
      whyRecommended: buildWhyRecommended(
        skill,
        options.recommended,
        profileContext
      ),
      context: CONTEXT_BY_SKILL[skill],
      prompt:
        grammarFocus[0]?.taskPromptTemplate ??
        `Complete a ${safeCefr} ${skill} task using the selected vocabulary.`,
      vocabularyFocus,
      grammarFocus,
      estimatedMinutes: skill === 'writing' ? 12 : 10,
      expectedAnswerType: EXPECTED_ANSWER[skill],
      evaluationCriteria: [
        'Accuracy at the target CEFR',
        'Correct use of target vocabulary',
        'Correct use of target grammar',
        'Response time and repeated mistake pattern',
      ],
      sourceSummary: {
        vocabularyDatabase: vocabularyFocus.length > 0,
        grammarDatabase: grammarFocus.length > 0,
        memoryTerms: vocabularyFocus.filter((item) => item.bucket === 'memory')
          .length,
        weakWords,
        mistakeLogEntries: intelligence.mistakeLog.length,
      },
      requiresAi: false,
      focusPriority,
      lessonNumber: lessonProgress.lesson.number,
      sharedLessonTitle: lessonProgress.lesson.title,
      explanation: {
        skillPosition: `${skill} is on lesson ${lessonProgress.lesson.number}; every skill advances independently.`,
        levelReason: `${safeCefr} is taken only from the current ${skill} ELO band; ${stretchCefr} is controlled stretch content.`,
        dataReason: `${vocabularyFocus.length} vocabulary items and ${grammarFocus.length} grammar rules were selected from the embedded databases.`,
        eloRule:
          'Accuracy 85%+ raises ELO faster, 60–84% maintains measured growth, and below 60% triggers review support.',
      },
    };
  },
};
