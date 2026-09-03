import { MissionDifficulty } from '@/core/learning';

import type { VocabularyDomain } from '@/shared/constants/engineering-disciplines';

import { VocabularyEntry } from '../../types/vocabulary.types';

export type ExpansionCategory = {
  discipline: VocabularyDomain;
  CEFR: VocabularyEntry['CEFR'];
  difficulty: MissionDifficulty;
  tags: string[];
  context: string;
  terms: string[];
};
