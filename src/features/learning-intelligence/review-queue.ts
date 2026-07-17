import { GrammarProgressService } from '@/features/grammar/grammar.progress';
import { GrammarRepository } from '@/features/grammar/grammar.repository';
import { SKILL_NAMES } from '@/features/profile/profile.types';
import type { UserLearningProfile } from '@/features/profile/profile.types';
import { isVocabularyProgressDue } from '@/features/vocabulary/vocabulary.menu';
import { VocabularyMenuService } from '@/features/vocabulary/vocabulary.menu';
import { VocabularyRepository } from '@/features/vocabulary/vocabulary.repository';
import { buildReviewPriorities } from './review-priority';
import { LearningIntelligenceService } from './learning-intelligence.service';
import type {
  ReviewPriorityCandidate,
  UnifiedReviewItem,
} from './learning-intelligence.types';

interface ReviewMetadata {
  route: string;
  detail: string;
}

export const UnifiedReviewQueueService = {
  async buildQueue(
    profile: UserLearningProfile,
    now = new Date()
  ): Promise<UnifiedReviewItem[]> {
    const candidates: ReviewPriorityCandidate[] = [];
    const metadata = new Map<string, ReviewMetadata>();
    const vocabularyState = VocabularyMenuService.getState();
    const vocabularyEntries = Object.entries(vocabularyState.progress).filter(
      ([, progress]) =>
        progress.isWeak || isVocabularyProgressDue(progress, now)
    );
    const vocabularyTerms = await Promise.all(
      vocabularyEntries.slice(0, 12).map(async ([id, progress]) => ({
        id,
        progress,
        term: await VocabularyRepository.getVocabularyTermById(id),
      }))
    );
    vocabularyTerms.forEach(({ id, progress, term }) => {
      const candidateId = `vocabulary-${id}`;
      candidates.push({
        id: candidateId,
        label: term?.term ?? id,
        source: progress.isWeak ? 'weak-word' : 'due-item',
        severity: progress.wrongReviews,
      });
      metadata.set(candidateId, {
        route: '/vocabulary',
        detail: progress.isWeak
          ? 'Weak vocabulary needs another controlled recall.'
          : 'Vocabulary review date is due.',
      });
    });

    const grammarEntries = Object.values(
      GrammarProgressService.getAll(now)
    ).filter((progress) => progress.reviewStatus === 'Due');
    const grammarRules = await Promise.all(
      grammarEntries.slice(0, 8).map(async (progress) => ({
        progress,
        rule: await GrammarRepository.getGrammarRuleById(progress.ruleId),
      }))
    );
    grammarRules.forEach(({ progress, rule }) => {
      const candidateId = `grammar-${progress.ruleId}`;
      candidates.push({
        id: candidateId,
        label: rule?.title ?? progress.ruleId,
        source: 'due-item',
        severity: progress.incorrectUsages,
      });
      metadata.set(candidateId, {
        route: '/grammar',
        detail: 'Grammar spaced review is due.',
      });
    });

    LearningIntelligenceService.load()
      .mistakeLog.filter((item) => (item.repetitionCount ?? 1) >= 3)
      .slice(0, 8)
      .forEach((item) => {
        const candidateId = `mistake-${item.id}`;
        candidates.push({
          id: candidateId,
          label: `${item.category}: ${item.originalText}`,
          source: 'repeated-mistake',
          severity: item.repetitionCount,
        });
        metadata.set(candidateId, {
          route: '/profile#mistake-log',
          detail: item.correction,
        });
      });

    const catchUpSkill = [...SKILL_NAMES].sort(
      (left, right) =>
        profile.skills[left].completedTasks -
          profile.skills[right].completedTasks ||
        profile.skills[right].weaknessScore - profile.skills[left].weaknessScore
    )[0];
    const skillCandidateId = `skill-${catchUpSkill}`;
    candidates.push({
      id: skillCandidateId,
      label: `${catchUpSkill[0].toUpperCase()}${catchUpSkill.slice(1)} catch-up opportunity`,
      source: 'skill-weakness',
      severity: Math.round(profile.skills[catchUpSkill].weaknessScore / 10),
    });
    metadata.set(skillCandidateId, {
      route: catchUpSkill === 'grammar' ? '/grammar' : `/${catchUpSkill}`,
      detail: `This skill is on lesson ${profile.skills[catchUpSkill].completedTasks + 1} and can progress independently.`,
    });

    return buildReviewPriorities(candidates).map((item) => ({
      ...item,
      ...(metadata.get(item.id) ?? {
        route: '/curriculum',
        detail: item.reason,
      }),
    }));
  },
};
