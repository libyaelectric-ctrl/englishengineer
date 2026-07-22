import {
  getBaseCefrLevel,
  getNextCefrBand,
} from '@/features/profile/profile.utils';
import type { CefrBand } from '@/features/profile/profile.types';
import type { LearningDataSkill } from '@/core/learning/spaced-repetition.types';
import {
  getVocabularyMenuStatus,
  isVocabularyProgressDue,
  type VocabularyMenuState,
  type VocabularyMenuStatus,
} from './vocabulary.menu';
import type { VocabularyTerm } from '../types/vocabulary.types';

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
  const stretch = eligible.filter(
    (term) => term.cefrLevel === stretchLevel && !current.includes(term)
  );
  const remaining = eligible.filter(
    (term) =>
      !due.includes(term) && !current.includes(term) && !stretch.includes(term)
  );

  const preferred = eligible.filter((term) =>
    options.preferredDomains?.includes(term.domain)
  );

  const ordered = [
    ...due,
    ...preferred,
    ...current,
    ...stretch,
    ...remaining,
  ].filter((term, index, list) => list.indexOf(term) === index);
  const offset = Math.max(0, options.offset ?? 0);
  return ordered.slice(offset, offset + 9);
};
