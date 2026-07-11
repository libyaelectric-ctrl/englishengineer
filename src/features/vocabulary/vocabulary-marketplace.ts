export type ContentItemType = 'vocabulary_set' | 'practice_scenario' | 'lesson_plan';

export interface MarketplaceContent {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  type: ContentItemType;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  data: VocabularySetData | PracticeScenarioData;
  rating: number;
  ratingCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

export interface VocabularySetData {
  terms: Array<{
    word: string;
    meaning: string;
    example: string;
    cefrLevel: string;
  }>;
}

export interface PracticeScenarioData {
  prompt: string;
  expectedKeywords: string[];
  discipline: string;
  estimatedMinutes: number;
}

export interface MarketplaceRating {
  contentId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export interface MarketplaceSearchFilters {
  type?: ContentItemType;
  category?: string;
  difficulty?: string;
  sortBy?: 'rating' | 'downloads' | 'newest';
}

const MOCK_CONTENT: MarketplaceContent[] = [
  {
    id: 'mc-1',
    authorId: 'user-1',
    authorName: 'Sarah Engineer',
    title: 'Electrical Safety Vocabulary',
    description: 'Essential electrical safety terms for site workers',
    type: 'vocabulary_set',
    category: 'Electrical Engineering',
    difficulty: 'intermediate',
    tags: ['safety', 'electrical', 'site'],
    data: { terms: [
      { word: 'lockout', meaning: 'Kilitleme prosedürü', example: 'Perform lockout before maintenance', cefrLevel: 'B1' },
      { word: 'tagout', meaning: 'Etiketleme prosedürü', example: 'Apply tagout to the breaker', cefrLevel: 'B1' },
    ]},
    rating: 4.8,
    ratingCount: 24,
    downloadCount: 156,
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-07-01T14:30:00Z',
    isPublished: true,
  },
  {
    id: 'mc-2',
    authorId: 'user-2',
    authorName: 'Mike Builder',
    title: 'Construction Site Daily Briefing',
    description: 'Practice daily construction site briefings in English',
    type: 'practice_scenario',
    category: 'Construction',
    difficulty: 'beginner',
    tags: ['daily', 'briefing', 'construction'],
    data: {
      prompt: 'Good morning team. Today we will focus on the foundation work for Building C. The concrete pouring is scheduled for 10 AM.',
      expectedKeywords: ['foundation', 'concrete', 'pouring', 'schedule'],
      discipline: 'Construction',
      estimatedMinutes: 10,
    },
    rating: 4.5,
    ratingCount: 18,
    downloadCount: 89,
    createdAt: '2026-06-20T08:00:00Z',
    updatedAt: '2026-06-28T16:00:00Z',
    isPublished: true,
  },
  {
    id: 'mc-3',
    authorId: 'user-3',
    authorName: 'Lisa Architect',
    title: 'Architecture Design Meeting Prep',
    description: 'Prepare for architecture design review meetings',
    type: 'lesson_plan',
    category: 'Architecture',
    difficulty: 'advanced',
    tags: ['design', 'review', 'meeting'],
    data: { terms: [
      { word: 'facade', meaning: 'Cephe', example: 'The glass facade reflects modern design', cefrLevel: 'B2' },
      { word: 'cantilever', meaning: 'Konsol', example: 'The cantilever extends 5 meters', cefrLevel: 'B2' },
    ]},
    rating: 4.2,
    ratingCount: 12,
    downloadCount: 45,
    createdAt: '2026-07-01T12:00:00Z',
    updatedAt: '2026-07-05T09:00:00Z',
    isPublished: true,
  },
];

export const MarketplaceService = {
  searchContent(
    query: string = '',
    filters: MarketplaceSearchFilters = {}
  ): MarketplaceContent[] {
    let results = MOCK_CONTENT.filter((c) => c.isPublished);

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.type) {
      results = results.filter((c) => c.type === filters.type);
    }
    if (filters.category) {
      results = results.filter((c) => c.category === filters.category);
    }
    if (filters.difficulty) {
      results = results.filter((c) => c.difficulty === filters.difficulty);
    }

    const sortBy = filters.sortBy || 'rating';
    results.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'downloads') return b.downloadCount - a.downloadCount;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return results;
  },

  getContentById(id: string): MarketplaceContent | undefined {
    return MOCK_CONTENT.find((c) => c.id === id);
  },

  createContent(
    authorId: string,
    authorName: string,
    input: {
      title: string;
      description: string;
      type: ContentItemType;
      category: string;
      difficulty: MarketplaceContent['difficulty'];
      tags: string[];
      data: MarketplaceContent['data'];
    }
  ): MarketplaceContent {
    return {
      id: `mc-${Date.now()}`,
      authorId,
      authorName,
      ...input,
      rating: 0,
      ratingCount: 0,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
    };
  },

  rateContent(
    contentId: string,
    rating: number,
    review?: string
  ): MarketplaceRating {
    return {
      contentId,
      userId: 'current-user',
      rating: Math.max(1, Math.min(5, rating)),
      review,
      createdAt: new Date().toISOString(),
    };
  },

  getCategories(): string[] {
    return Array.from(new Set(MOCK_CONTENT.map((c) => c.category)));
  },

  getPopularContent(limit: number = 5): MarketplaceContent[] {
    return MOCK_CONTENT
      .filter((c) => c.isPublished)
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, limit);
  },
};
