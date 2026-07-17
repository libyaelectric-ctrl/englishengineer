import { MissionDifficulty } from '@/core/learning';
import { VocabularyDiscipline, VocabularyEntry } from '../types/vocabulary.types';

export type ExpansionCategory = {
  discipline: VocabularyDiscipline;
  CEFR: VocabularyEntry['CEFR'];
  difficulty: MissionDifficulty;
  tags: string[];
  context: string;
  terms: string[];
};

export { expansionCategories } from './expansion-categories/index';
