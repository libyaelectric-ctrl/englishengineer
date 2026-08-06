import type { CefrLevel } from '@/shared/types/domain.types';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

import { VocabularyRepository } from './vocabulary.repository';

export type Discipline =
  | 'general'
  | 'engineering'
  | 'architecture'
  | 'chemical'
  | 'civil'
  | 'electrical'
  | 'electronics'
  | 'hse'
  | 'industrial'
  | 'mechanical'
  | 'mechatronics'
  | 'software';

export interface ContentPool {
  vocabulary: VocabularyTerm[];
  readings: VocabularyTerm[];
  listenings: VocabularyTerm[];
  speakings: VocabularyTerm[];
  writings: VocabularyTerm[];
  totalCount: number;
  domains: string[];
}

const BASE_DOMAINS = ['general', 'engineering'] as const;

export const ContentAggregatorService = {
  async buildContentPool(discipline: Discipline, cefrLevel?: CefrLevel): Promise<ContentPool> {
    const domains = [...BASE_DOMAINS, discipline];

    const allTerms = await VocabularyRepository.getVocabularyByDomains(domains);

    const vocabulary: VocabularyTerm[] = [];
    const readings: VocabularyTerm[] = [];
    const listenings: VocabularyTerm[] = [];
    const speakings: VocabularyTerm[] = [];
    const writings: VocabularyTerm[] = [];

    for (const term of allTerms) {
      const skills = term.skillUse || [];

      if (skills.includes('vocabulary')) {
        vocabulary.push(term);
      }
      if (skills.includes('reading')) {
        readings.push(term);
      }
      if (skills.includes('listening')) {
        listenings.push(term);
      }
      if (skills.includes('speaking')) {
        speakings.push(term);
      }
      if (skills.includes('writing')) {
        writings.push(term);
      }
    }

    return {
      vocabulary,
      readings,
      listenings,
      speakings,
      writings,
      totalCount: allTerms.length,
      domains,
    };
  },

  async getVocabularyByDiscipline(discipline: Discipline): Promise<VocabularyTerm[]> {
    return VocabularyRepository.getVocabularyByDomain(discipline);
  },

  async getGeneralVocabulary(): Promise<VocabularyTerm[]> {
    return VocabularyRepository.getVocabularyByDomain('general');
  },

  async getEngineeringVocabulary(): Promise<VocabularyTerm[]> {
    return VocabularyRepository.getVocabularyByDomain('engineering');
  },
};
