export type ShopItemCategory =
  | 'avatar'
  | 'theme'
  | 'content'
  | 'boost'
  | 'title';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopItemCategory;
  priceCoins: number;
  priceXp: number;
  icon: string;
  isOwned: boolean;
  isLimited: boolean;
  expiresAt?: string;
}

export interface ShopPurchase {
  itemId: string;
  purchasedAt: string;
  pricePaid: { coins: number; xp: number };
}

export interface ShopState {
  ownedItems: string[];
  purchases: ShopPurchase[];
  totalCoinsSpent: number;
  totalXpSpent: number;
}

const SHOP_CATALOG: ShopItem[] = [
  // Avatars
  {
    id: 'avatar-engineer',
    name: 'Engineer Avatar',
    description: 'Professional engineer avatar with hard hat',
    category: 'avatar',
    priceCoins: 100,
    priceXp: 500,
    icon: '👷',
    isOwned: false,
    isLimited: false,
  },
  {
    id: 'avatar-scientist',
    name: 'Scientist Avatar',
    description: 'Lab coat and safety goggles avatar',
    category: 'avatar',
    priceCoins: 150,
    priceXp: 750,
    icon: '🧑‍🔬',
    isOwned: false,
    isLimited: false,
  },
  {
    id: 'avatar-architect',
    name: 'Architect Avatar',
    description: 'Blueprint and ruler avatar',
    category: 'avatar',
    priceCoins: 120,
    priceXp: 600,
    icon: '🧑‍💻',
    isOwned: false,
    isLimited: false,
  },
  {
    id: 'avatar-special-gold',
    name: 'Gold Engineer',
    description: 'Limited edition gold engineer avatar',
    category: 'avatar',
    priceCoins: 500,
    priceXp: 2000,
    icon: '🥇',
    isOwned: false,
    isLimited: true,
    expiresAt: '2026-12-31',
  },

  // Themes
  {
    id: 'theme-dark-pro',
    name: 'Dark Pro Theme',
    description: 'Premium dark theme with accent colors',
    category: 'theme',
    priceCoins: 200,
    priceXp: 1000,
    icon: '🌙',
    isOwned: false,
    isLimited: false,
  },
  {
    id: 'theme-ocean',
    name: 'Ocean Theme',
    description: 'Calming blue ocean-inspired theme',
    category: 'theme',
    priceCoins: 150,
    priceXp: 800,
    icon: '🌊',
    isOwned: false,
    isLimited: false,
  },
  {
    id: 'theme-forest',
    name: 'Forest Theme',
    description: 'Natural green forest theme',
    category: 'theme',
    priceCoins: 150,
    priceXp: 800,
    icon: '🌲',
    isOwned: false,
    isLimited: false,
  },

  // Content
  {
    id: 'content-advanced-vocab',
    name: 'Advanced Vocabulary Pack',
    description: '500+ advanced engineering terms',
    category: 'content',
    priceCoins: 300,
    priceXp: 1500,
    icon: '📚',
    isOwned: false,
    isLimited: false,
  },
  {
    id: 'content-ielts-prep',
    name: 'IELTS Preparation Pack',
    description: 'Complete IELTS preparation materials',
    category: 'content',
    priceCoins: 400,
    priceXp: 2000,
    icon: '📝',
    isOwned: false,
    isLimited: false,
  },

  // Boosts
  {
    id: 'boost-xp-2x',
    name: '2x XP Boost (24h)',
    description: 'Double XP for 24 hours',
    category: 'boost',
    priceCoins: 250,
    priceXp: 0,
    icon: '⚡',
    isOwned: false,
    isLimited: false,
  },
  {
    id: 'boost-streak-freeze',
    name: 'Streak Freeze (3 days)',
    description: 'Protect your streak for 3 days',
    category: 'boost',
    priceCoins: 100,
    priceXp: 0,
    icon: '🧊',
    isOwned: false,
    isLimited: false,
  },

  // Titles
  {
    id: 'title-wordsmith',
    name: 'Wordsmith Title',
    description: 'Display "Wordsmith" next to your name',
    category: 'title',
    priceCoins: 75,
    priceXp: 300,
    icon: '✍️',
    isOwned: false,
    isLimited: false,
  },
  {
    id: 'title polyglot',
    name: 'Polyglot Title',
    description: 'Display "Polyglot" next to your name',
    category: 'title',
    priceCoins: 100,
    priceXp: 500,
    icon: '🌍',
    isOwned: false,
    isLimited: false,
  },
];

export const ShopService = {
  getCatalog(ownedItemIds: string[] = []): ShopItem[] {
    return SHOP_CATALOG.map((item) => ({
      ...item,
      isOwned: ownedItemIds.includes(item.id),
      isLimited:
        item.isLimited && item.expiresAt
          ? new Date(item.expiresAt) > new Date()
          : item.isLimited,
    }));
  },

  getCatalogByCategory(
    category: ShopItemCategory,
    ownedItemIds: string[] = []
  ): ShopItem[] {
    return this.getCatalog(ownedItemIds).filter(
      (item) => item.category === category
    );
  },

  canAfford(item: ShopItem, userCoins: number, userXp: number): boolean {
    return userCoins >= item.priceCoins && userXp >= item.priceXp;
  },

  purchase(
    item: ShopItem,
    userCoins: number,
    userXp: number
  ): { success: boolean; error?: string; purchase?: ShopPurchase } {
    if (item.isOwned) {
      return { success: false, error: 'Item already owned' };
    }

    if (
      item.isLimited &&
      item.expiresAt &&
      new Date(item.expiresAt) < new Date()
    ) {
      return { success: false, error: 'Limited item has expired' };
    }

    if (!this.canAfford(item, userCoins, userXp)) {
      return { success: false, error: 'Insufficient coins or XP' };
    }

    const purchase: ShopPurchase = {
      itemId: item.id,
      purchasedAt: new Date().toISOString(),
      pricePaid: { coins: item.priceCoins, xp: item.priceXp },
    };

    return { success: true, purchase };
  },

  calculateDiscount(
    item: ShopItem,
    streak: number
  ): {
    discountedCoins: number;
    discountedXp: number;
    discountPercent: number;
  } {
    let discountPercent = 0;
    if (streak >= 30) discountPercent = 20;
    else if (streak >= 14) discountPercent = 15;
    else if (streak >= 7) discountPercent = 10;

    return {
      discountedCoins: Math.round(
        item.priceCoins * (1 - discountPercent / 100)
      ),
      discountedXp: Math.round(item.priceXp * (1 - discountPercent / 100)),
      discountPercent,
    };
  },
};
