import { describe, it, expect } from 'vitest';
import { MarketplaceService } from './vocabulary-marketplace';

describe('MarketplaceService', () => {
  describe('searchContent', () => {
    it('returns all published content', () => {
      const results = MarketplaceService.searchContent();
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((c) => c.isPublished)).toBe(true);
    });

    it('filters by query', () => {
      const results = MarketplaceService.searchContent('electrical');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.title.includes('Electrical'))).toBe(true);
    });

    it('filters by type', () => {
      const results = MarketplaceService.searchContent('', { type: 'vocabulary_set' });
      expect(results.every((c) => c.type === 'vocabulary_set')).toBe(true);
    });

    it('filters by category', () => {
      const results = MarketplaceService.searchContent('', { category: 'Construction' });
      expect(results.every((c) => c.category === 'Construction')).toBe(true);
    });

    it('sorts by downloads', () => {
      const results = MarketplaceService.searchContent('', { sortBy: 'downloads' });
      expect(results[0].downloadCount).toBeGreaterThanOrEqual(results[1].downloadCount);
    });
  });

  describe('getContentById', () => {
    it('returns content by id', () => {
      const content = MarketplaceService.getContentById('mc-1');
      expect(content).toBeDefined();
      expect(content?.title).toBe('Electrical Safety Vocabulary');
    });

    it('returns undefined for non-existent id', () => {
      const content = MarketplaceService.getContentById('non-existent');
      expect(content).toBeUndefined();
    });
  });

  describe('createContent', () => {
    it('creates new content with correct fields', () => {
      const content = MarketplaceService.createContent('user-1', 'Test User', {
        title: 'Test Content',
        description: 'Test description',
        type: 'vocabulary_set',
        category: 'Test',
        difficulty: 'beginner',
        tags: ['test'],
        data: { terms: [] },
      });
      expect(content.id).toBeDefined();
      expect(content.title).toBe('Test Content');
      expect(content.rating).toBe(0);
      expect(content.downloadCount).toBe(0);
    });
  });

  describe('rateContent', () => {
    it('creates a rating', () => {
      const rating = MarketplaceService.rateContent('mc-1', 5, 'Great content!');
      expect(rating.contentId).toBe('mc-1');
      expect(rating.rating).toBe(5);
      expect(rating.review).toBe('Great content!');
    });

    it('clamps rating to 1-5 range', () => {
      const low = MarketplaceService.rateContent('mc-1', 0);
      expect(low.rating).toBe(1);
      const high = MarketplaceService.rateContent('mc-1', 10);
      expect(high.rating).toBe(5);
    });
  });

  describe('getCategories', () => {
    it('returns unique categories', () => {
      const categories = MarketplaceService.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(new Set(categories).size).toBe(categories.length);
    });
  });

  describe('getPopularContent', () => {
    it('returns top N items by download count', () => {
      const popular = MarketplaceService.getPopularContent(2);
      expect(popular).toHaveLength(2);
      expect(popular[0].downloadCount).toBeGreaterThanOrEqual(popular[1].downloadCount);
    });
  });
});
