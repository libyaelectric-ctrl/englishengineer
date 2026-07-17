import type { LearningState, MissionModule } from '@/core/learning/learning.types';
import { GrammarEngine } from '@/features/grammar/grammar.engine';
import type { CefrLevel } from '@/features/level-system/level-system.types';
import { VocabularyEngine } from '@/features/vocabulary/vocabulary.engine';
import { VocabularyMenuService } from '@/features/vocabulary/vocabulary.menu';
import { VocabularyRepository } from '@/features/vocabulary/vocabulary.repository';
import {
  SKILL_NAMES,
  type CefrBand,
  type DailyMission,
  type ProfileBadge,
  type SkillName,
  type SkillProfile,
  type UserLearningProfile,
  type VocabularyMemorySummary,
} from './profile.types';
import {
  clampSkillElo,
  getCefrBandFromElo,
  getProgressToNextCefrBand,
  getSkillLessonNumber,
} from './profile.utils';

const MODULE_BY_SKILL: Record<SkillName, MissionModule> = {
  reading: 'Reading',
  writing: 'Writing',
  listening: 'Listening',
  speaking: 'Speaking',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
};
const ROUTE_BY_SKILL: Record<SkillName, string> = {
  reading: '/reading',
  writing: '/writing',
  listening: '/listening',
  speaking: '/speaking',
  vocabulary: '/vocabulary',
  grammar: '/curriculum',
};
const TASK_TYPE_BY_SKILL: Record<SkillName, string> = {
  reading: 'reading-comprehension',
  writing: 'writing-correction',
  listening: 'listening-recognition',
  speaking: 'speaking-production',
  vocabulary: 'vocabulary-context',
  grammar: 'writing-correction',
};

const toCefrLevel = (band: CefrBand): CefrLevel =>
  band.replace('+', '') as CefrLevel;

const getSessionDelta = (score: number): number => {
  if (score >= 85) return 12;
  if (score >= 60) return 4;
  return -8;
};

const withEvidence = (
  profile: SkillProfile,
  state: LearningState
): SkillProfile => {
  const module = MODULE_BY_SKILL[profile.skill];
  const sessions = state.studySessions.filter(
    (session) => session.module === module
  );
  if (sessions.length === 0) return profile;
  const accuracy = Math.round(
    sessions.reduce((sum, session) => sum + session.score, 0) / sessions.length
  );
  const elo = clampSkillElo(
    profile.elo +
      sessions.reduce((sum, session) => sum + getSessionDelta(session.score), 0)
  );
  const progressToNextBand = getProgressToNextCefrBand(elo);
  const latest = [...sessions].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  )[0];
  return {
    ...profile,
    elo,
    cefrBand: getCefrBandFromElo(elo),
    progressToNextBand,
    trend:
      accuracy >= 85 ? 'improving' : accuracy < 60 ? 'declining' : 'steady',
    completedTasks: sessions.length,
    accuracy,
    weaknessScore: 100 - accuracy,
    lastPracticedAt: latest?.timestamp ?? null,
    promotionState:
      elo === 5000
        ? 'maxed'
        : progressToNextBand >= 90
          ? 'ready'
          : 'progressing',
  };
};

export const LearningProfileEngine = {
  buildProfileSnapshot(
    profile: UserLearningProfile,
    learningState: LearningState
  ): UserLearningProfile {
    return {
      ...profile,
      skills: Object.fromEntries(
        SKILL_NAMES.map((skill) => [
          skill,
          withEvidence(profile.skills[skill], learningState),
        ])
      ) as Record<SkillName, SkillProfile>,
    };
  },

  async getVocabularyMemorySummary(): Promise<VocabularyMemorySummary> {
    const total = VocabularyRepository.getVocabularyTotalCount();
    const summary = VocabularyMenuService.getSummary(undefined, total);
    return {
      total,
      new: summary.newWords,
      learning: summary.learning,
      mastered: summary.mastered,
      forgotten: summary.forgotten,
      dueToday: summary.dueToday,
      weakWords: summary.weak,
    };
  },

  async generateDailyMissions(
    profile: UserLearningProfile,
    memory: VocabularyMemorySummary
  ): Promise<DailyMission[]> {
    const weakest = [...SKILL_NAMES]
      .map((skill) => profile.skills[skill])
      .sort(
        (a, b) =>
          a.completedTasks - b.completedTasks ||
          b.weaknessScore - a.weaknessScore
      )[0];
    const weakestLevel = toCefrLevel(weakest.cefrBand);
    const grammarLevel = toCefrLevel(profile.skills.grammar.cefrBand);
    const vocabularyLevel = toCefrLevel(profile.skills.vocabulary.cefrBand);
    const grammarMix =
      profile.skills.grammar.completedTasks % 4 === 3 ? 'stretch' : 'safe';
    const [grammarRules, vocabularyTerms] = await Promise.all([
      GrammarEngine.selectGrammarForTask(
        weakest.skill,
        weakestLevel,
        TASK_TYPE_BY_SKILL[weakest.skill],
        undefined,
        grammarMix
      ),
      VocabularyEngine.selectVocabularyForTask('vocabulary', vocabularyLevel),
    ]);
    const grammarFocus =
      grammarRules[0] ??
      (
        await GrammarEngine.selectGrammarForTask(
          'writing',
          grammarLevel,
          'writing-correction',
          undefined,
          grammarMix
        )
      )[0];
    const skillLabel =
      weakest.skill.charAt(0).toUpperCase() + weakest.skill.slice(1);

    return [
      {
        id: `daily_${weakest.skill}`,
        type: 'skill-practice',
        skill: weakest.skill,
        title: `${skillLabel} · Lesson ${getSkillLessonNumber(weakest.completedTasks)}`,
        cefrBand: weakest.cefrBand,
        difficulty: 'current',
        estimatedMinutes: 10,
        reason:
          weakest.completedTasks === 0
            ? `Build the first reliable ${skillLabel} baseline.`
            : `${skillLabel} is on lesson ${getSkillLessonNumber(weakest.completedTasks)} and has the clearest catch-up opportunity.`,
        route: ROUTE_BY_SKILL[weakest.skill],
      },
      {
        id: 'daily_vocabulary_review',
        type: 'vocabulary-review',
        skill: 'vocabulary',
        title:
          memory.dueToday > 0
            ? 'Vocabulary memory review'
            : 'Current-level vocabulary set',
        cefrBand: profile.skills.vocabulary.cefrBand,
        difficulty: memory.dueToday > 0 ? 'review' : 'current',
        estimatedMinutes: 8,
        reason:
          memory.dueToday > 0
            ? `${memory.dueToday} saved words are due today.`
            : 'Start building the vocabulary memory bank safely.',
        route: '/vocabulary',
        itemCount:
          memory.dueToday > 0
            ? Math.min(memory.dueToday, 10)
            : Math.min(vocabularyTerms.length, 10),
      },
      {
        id: 'daily_grammar_focus',
        type: 'grammar-focus',
        skill: 'grammar',
        title: grammarFocus?.title ?? 'Current-level grammar foundation',
        cefrBand: profile.skills.grammar.cefrBand,
        difficulty: 'current',
        estimatedMinutes: 7,
        reason: grammarFocus
          ? `${grammarMix === 'safe' ? 'Safe review' : 'Stretch practice'}: use ${grammarFocus.structure} in an engineering context.`
          : 'Build a reliable grammar baseline for technical communication.',
        route: '/grammar',
      },
    ];
  },

  getBadges(
    profile: UserLearningProfile,
    memory: VocabularyMemorySummary
  ): ProfileBadge[] {
    const totalTasks = SKILL_NAMES.reduce(
      (sum, skill) => sum + profile.skills[skill].completedTasks,
      0
    );
    return [
      {
        id: 'site_starter',
        label: 'Site English Starter',
        unlocked: totalTasks >= 1,
        description: 'Complete the first learning task.',
      },
      {
        id: 'first_100_words',
        label: 'First 100 Words',
        unlocked: memory.mastered >= 100,
        description: 'Master 100 vocabulary terms.',
      },
      {
        id: 'grammar_builder',
        label: 'Grammar Builder',
        unlocked: profile.skills.grammar.completedTasks >= 5,
        description: 'Complete five grammar practices.',
      },
      {
        id: 'speaking_rookie',
        label: 'Speaking Rookie',
        unlocked: profile.skills.speaking.completedTasks >= 1,
        description: 'Complete the first speaking practice.',
      },
    ];
  },
};
