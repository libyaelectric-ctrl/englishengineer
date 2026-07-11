import { describe, it, expect } from 'vitest';
import { ShopService } from './gamification-shop';

describe('ShopService', () => {
  describe('getCatalog', () => {
    it('returns all items', () => {
      const catalog = ShopService.getCatalog();
      expect(catalog.length).toBeGreaterThan(0);
    });

    it('marks owned items correctly', () => {
      const catalog = ShopService.getCatalog(['avatar-engineer', 'theme-dark-pro']);
      const engineer = catalog.find((i) => i.id === 'avatar-engineer');
      const scientist = catalog.find((i) => i.id === 'avatar-scientist');
      expect(engineer?.isOwned).toBe(true);
      expect(scientist?.isOwned).toBe(false);
    });
  });

  describe('getCatalogByCategory', () => {
    it('filters by category', () => {
      const avatars = ShopService.getCatalogByCategory('avatar');
      expect(avatars.every((i) => i.category === 'avatar')).toBe(true);
    });

    it('returns empty for non-existent category', () => {
      const items = ShopService.getCatalogByCategory('nonexistent' as never);
      expect(items).toHaveLength(0);
    });
  });

  describe('canAfford', () => {
    it('returns true when user has enough coins and xp', () => {
      const item = ShopService.getCatalog()[0];
      expect(ShopService.canAfford(item, 1000, 5000)).toBe(true);
    });

    it('returns false when user lacks coins', () => {
      const item = ShopService.getCatalog()[0];
      expect(ShopService.canAfford(item, 10, 5000)).toBe(false);
    });

    it('returns false when user lacks xp', () => {
      const item = ShopService.getCatalog()[0];
      expect(ShopService.canAfford(item, 1000, 10)).toBe(false);
    });
  });

  describe('purchase', () => {
    it('succeeds for affordable item', () => {
      const item = ShopService.getCatalog()[0];
      const result = ShopService.purchase(item, 1000, 5000);
      expect(result.success).toBe(true);
      expect(result.purchase).toBeDefined();
      expect(result.purchase?.itemId).toBe(item.id);
    });

    it('fails for already owned item', () => {
      const catalog = ShopService.getCatalog(['avatar-engineer']);
      const item = catalog.find((i) => i.id === 'avatar-engineer')!;
      const result = ShopService.purchase(item, 1000, 5000);
      expect(result.success).toBe(false);
      expect(result.error).toContain('already owned');
    });

    it('fails for insufficient coins', () => {
      const item = ShopService.getCatalog()[0];
      const result = ShopService.purchase(item, 5, 5000);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient');
    });
  });

  describe('calculateDiscount', () => {
    it('returns no discount for short streaks', () => {
      const item = ShopService.getCatalog()[0];
      const discount = ShopService.calculateDiscount(item, 3);
      expect(discount.discountPercent).toBe(0);
      expect(discount.discountedCoins).toBe(item.priceCoins);
    });

    it('returns 10% discount for 7+ day streak', () => {
      const item = ShopService.getCatalog()[0];
      const discount = ShopService.calculateDiscount(item, 7);
      expect(discount.discountPercent).toBe(10);
      expect(discount.discountedCoins).toBe(Math.round(item.priceCoins * 0.9));
    });

    it('returns 15% discount for 14+ day streak', () => {
      const item = ShopService.getCatalog()[0];
      const discount = ShopService.calculateDiscount(item, 14);
      expect(discount.discountPercent).toBe(15);
    });

    it('returns 20% discount for 30+ day streak', () => {
      const item = ShopService.getCatalog()[0];
      const discount = ShopService.calculateDiscount(item, 30);
      expect(discount.discountPercent).toBe(20);
    });
  });
});
