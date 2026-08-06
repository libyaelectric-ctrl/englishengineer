import { describe, expect, it, vi } from 'vitest';

import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

import { ContentAggregatorService } from '@/shared/services/content-aggregator.service';
import { VocabularyRepository } from '@/shared/services/vocabulary.repository';

vi.mock('@/shared/services/vocabulary.repository', () => ({
  VocabularyRepository: {
    getVocabularyByDomains: vi.fn(),
    getVocabularyByDomain: vi.fn(),
  },
}));

const createMockTerm = (id: string, domain: string, skills: string[]): VocabularyTerm =>
  ({
    id,
    term: id,
    normalizedTerm: id,
    turkishMeaning: id,
    cefrLevel: 'A1',
    domain,
    contentDomain: domain,
    lifeContext: 'site',
    register: 'neutral',
    primaryUseCase: 'site-task',
    category: 'general',
    termType: 'single_word',
    partOfSpeech: 'noun',
    wordCount: 1,
    definition: `Definition for ${id}`,
    exampleSentence: `Example for ${id}`,
    turkishExample: `Örnek ${id}`,
    relatedTerms: [],
    commonMistakes: '',
    grammarFits: [],
    skillUse: skills,
    tags: [domain],
    source: 'test',
    confidence: 0.9,
    status: 'approved',
    importTier: 'core',
    isCore: false,
    isTechnical: false,
    isProfessionalPhrase: false,
    isContractual: false,
    isDailySiteEnglish: false,
    isLifeWideEnglish: false,
    reviewReason: '',
    variantOf: '',
    grammarDomainAlias: domain,
    qcRepairNotes: '',
  }) as VocabularyTerm;

describe('NASA Standard Content Pool Tests', () => {
  describe('Senaryo A: Mimar kullanıcısı', () => {
    it('en az 4500 öğeli havuz olmalı', async () => {
      const generalTerms = Array.from({ length: 2500 }, (_, i) =>
        createMockTerm(`gen_${i}`, 'general', ['vocabulary', 'reading'])
      );
      const engineeringTerms = Array.from({ length: 800 }, (_, i) =>
        createMockTerm(`eng_${i}`, 'engineering', ['vocabulary', 'writing'])
      );
      const architectureTerms = Array.from({ length: 1250 }, (_, i) =>
        createMockTerm(`arch_${i}`, 'architecture', ['vocabulary', 'reading', 'speaking'])
      );

      vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue([
        ...generalTerms,
        ...engineeringTerms,
        ...architectureTerms,
      ]);

      const pool = await ContentAggregatorService.buildContentPool('architecture');

      expect(pool.totalCount).toBe(4550);
      expect(pool.domains).toContain('general');
      expect(pool.domains).toContain('engineering');
      expect(pool.domains).toContain('architecture');
    });

    it('mimari okuma içeriği olmalı', async () => {
      const mockTerms = [
        createMockTerm('arch_read_1', 'architecture', ['reading']),
        createMockTerm('arch_read_2', 'architecture', ['reading']),
        createMockTerm('gen_1', 'general', ['vocabulary']),
      ];

      vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue(mockTerms);

      const pool = await ContentAggregatorService.buildContentPool('architecture');

      expect(pool.readings.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Senaryo B: Branş değişikliği', () => {
    it('elektrik mühendisliği geçişinde genel içerik korunmalı', async () => {
      const mockTerms = [
        createMockTerm('gen_1', 'general', ['vocabulary']),
        createMockTerm('eng_1', 'engineering', ['vocabulary']),
        createMockTerm('elec_1', 'electrical', ['vocabulary']),
      ];

      vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue(mockTerms);

      const pool = await ContentAggregatorService.buildContentPool('electrical');

      expect(pool.domains).toContain('general');
      expect(pool.domains).toContain('engineering');
      expect(pool.domains).toContain('electrical');
      expect(pool.totalCount).toBe(3);
    });

    it('genel ve ortak mühendislik içerikleri silinmemeli', async () => {
      const mockTerms = [
        createMockTerm('gen_1', 'general', ['vocabulary', 'reading']),
        createMockTerm('eng_1', 'engineering', ['vocabulary', 'writing']),
        createMockTerm('mech_1', 'mechanical', ['vocabulary']),
      ];

      vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue(mockTerms);

      const pool = await ContentAggregatorService.buildContentPool('mechanical');

      const generalItems = pool.vocabulary.filter((v) => v.domain === 'general');
      const engineeringItems = pool.vocabulary.filter((v) => v.domain === 'engineering');

      expect(generalItems.length).toBeGreaterThan(0);
      expect(engineeringItems.length).toBeGreaterThan(0);
    });
  });

  describe('Senaryo C: Veri tutarlılığı', () => {
    it('hiçbir kullanıcı "Veri Bulunamadı" hatası almamalı', async () => {
      vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue([]);

      const pool = await ContentAggregatorService.buildContentPool('general');

      expect(pool).not.toBeNull();
      expect(pool.totalCount).toBeGreaterThanOrEqual(0);
      expect(pool.domains.length).toBeGreaterThanOrEqual(2);
    });

    it('toplam öğe sayısı beklenen aralıkta olmalı', async () => {
      const generalTerms = Array.from({ length: 2500 }, (_, i) =>
        createMockTerm(`gen_${i}`, 'general', ['vocabulary'])
      );
      const engineeringTerms = Array.from({ length: 800 }, (_, i) =>
        createMockTerm(`eng_${i}`, 'engineering', ['vocabulary'])
      );
      const softwareTerms = Array.from({ length: 1400 }, (_, i) =>
        createMockTerm(`sw_${i}`, 'software', ['vocabulary'])
      );

      vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue([
        ...generalTerms,
        ...engineeringTerms,
        ...softwareTerms,
      ]);

      const pool = await ContentAggregatorService.buildContentPool('software');

      expect(pool.totalCount).toBeGreaterThanOrEqual(4400);
      expect(pool.totalCount).toBeLessThanOrEqual(4900);
    });

    it('tüm branşlar için tutarlı domain listesi', async () => {
      const disciplines = ['architecture', 'chemical', 'civil', 'electrical', 'electronics', 'hse', 'industrial', 'mechanical', 'mechatronics', 'software'] as const;

      for (const discipline of disciplines) {
        vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue([
          createMockTerm('gen_1', 'general', ['vocabulary']),
          createMockTerm('eng_1', 'engineering', ['vocabulary']),
          createMockTerm(`${discipline}_1`, discipline, ['vocabulary']),
        ]);

        const pool = await ContentAggregatorService.buildContentPool(discipline);

        expect(pool.domains).toContain('general');
        expect(pool.domains).toContain('engineering');
        expect(pool.domains).toContain(discipline);
      }
    });
  });

  describe('Senaryo D: Performans', () => {
    it('büyük veri setiyle hızlı çalışmalı', async () => {
      const largeDataset = Array.from({ length: 4700 }, (_, i) => {
        const domain = i < 2500 ? 'general' : i < 3300 ? 'engineering' : 'software';
        return createMockTerm(`term_${i}`, domain, ['vocabulary', 'reading', 'writing']);
      });

      vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue(largeDataset);

      const startTime = performance.now();
      const pool = await ContentAggregatorService.buildContentPool('software');
      const endTime = performance.now();

      expect(pool.totalCount).toBe(4700);
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('beceri bazlı filtreleme doğru çalışmalı', async () => {
      const mockTerms = [
        createMockTerm('v_1', 'general', ['vocabulary']),
        createMockTerm('r_1', 'general', ['reading']),
        createMockTerm('w_1', 'general', ['writing']),
        createMockTerm('l_1', 'general', ['listening']),
        createMockTerm('s_1', 'general', ['speaking']),
      ];

      vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue(mockTerms);

      const pool = await ContentAggregatorService.buildContentPool('general');

      expect(pool.vocabulary.length).toBe(1);
      expect(pool.readings.length).toBe(1);
      expect(pool.writings.length).toBe(1);
      expect(pool.listenings.length).toBe(1);
      expect(pool.speakings.length).toBe(1);
    });
  });
});