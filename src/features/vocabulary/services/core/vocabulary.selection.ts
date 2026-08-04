import type { LearningDataSkill } from '@/core/learning/spaced-repetition.types';

import type { CefrBand } from '@/shared/types/domain.types';

import { getBaseCefrLevel, getNextCefrBand } from '@/features/profile/profile.utils';

import type { VocabularyTerm } from '../../types/vocabulary.types';
import {
  type VocabularyMenuState,
  type VocabularyMenuStatus,
  getVocabularyMenuStatus,
  isVocabularyProgressDue,
} from './vocabulary.menu';

export interface VocabularyLearningSetOptions {
  cefrBand: CefrBand;
  skillUse: LearningDataSkill;
  status: VocabularyMenuStatus;
  domain?: string;
  preferredDomains?: string[];
  now?: Date;
  offset?: number;
}

export const selectVocabularyLearningSet = (
  terms: VocabularyTerm[],
  state: VocabularyMenuState,
  options: VocabularyLearningSetOptions
): VocabularyTerm[] => {
  const currentLevel = getBaseCefrLevel(options.cefrBand);
  const stretchLevel = getBaseCefrLevel(getNextCefrBand(options.cefrBand));
  const now = options.now ?? new Date();
  const eligible = terms.filter((term) => {
    if (term.status !== 'approved') return false;
    if (!term.skillUse.includes(options.skillUse)) return false;
    if (options.domain && term.domain !== options.domain) return false;
    if (
      !options.domain &&
      options.preferredDomains &&
      !options.preferredDomains.includes(term.domain)
    )
      return false;
    const termStatus = getVocabularyMenuStatus(term.id, state);
    if (options.status === 'Learned' || options.status === 'Learning') {
      return termStatus === 'Learned' || termStatus === 'Learning';
    }
    return termStatus === options.status;
  });
  const due = eligible.filter((term) => {
    const progress = state.progress[term.id];
    return progress ? isVocabularyProgressDue(progress, now) : false;
  });
  const current = eligible.filter((term) => term.cefrLevel === currentLevel);
  const currentIds = new Set(current.map((t) => t.id));
  const stretch = eligible.filter(
    (term) => term.cefrLevel === stretchLevel && !currentIds.has(term.id)
  );

  const dueIds = new Set(due.map((t) => t.id));
  const stretchIds = new Set(stretch.map((t) => t.id));
  const remaining = eligible.filter(
    (term) => !dueIds.has(term.id) && !currentIds.has(term.id) && !stretchIds.has(term.id)
  );

  const preferred = eligible.filter((term) => options.preferredDomains?.includes(term.domain));

  const seen = new Set<string>();
  const ordered = [...due, ...preferred, ...current, ...stretch, ...remaining].filter((term) => {
    if (seen.has(term.id)) return false;
    seen.add(term.id);
    return true;
  });
  const offset = Math.max(0, options.offset ?? 0);
  return ordered.slice(offset, offset + 9);
};
