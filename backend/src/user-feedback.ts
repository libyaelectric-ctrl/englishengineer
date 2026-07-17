interface FeedbackRecord {
  id: string;
  userId: string;
  type: string;
  category: string;
  message: string;
  rating?: number;
  metadata: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const feedbackStore: FeedbackRecord[] = [];

interface SubmitFeedbackOpts {
  userId: string;
  type: string;
  category: string;
  message: string;
  rating?: number;
  metadata?: Record<string, unknown>;
}

export const submitFeedback = ({
  userId,
  type,
  category,
  message,
  rating,
  metadata = {},
}: SubmitFeedbackOpts): FeedbackRecord => {
  const feedback: FeedbackRecord = {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    type,
    category,
    message,
    rating,
    metadata,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  feedbackStore.push(feedback);

  if (feedbackStore.length > 1000) {
    feedbackStore.splice(0, feedbackStore.length - 1000);
  }

  return feedback;
};

interface FeedbackFilters {
  type?: string;
  category?: string;
  status?: string;
  userId?: string;
  limit?: number;
}

export const getFeedback = (
  filters: FeedbackFilters = {}
): FeedbackRecord[] => {
  let results = [...feedbackStore];

  if (filters.type) {
    results = results.filter((f) => f.type === filters.type);
  }
  if (filters.category) {
    results = results.filter((f) => f.category === filters.category);
  }
  if (filters.status) {
    results = results.filter((f) => f.status === filters.status);
  }
  if (filters.userId) {
    results = results.filter((f) => f.userId === filters.userId);
  }

  return results.slice(-(filters.limit || 100)).reverse();
};

export const updateFeedbackStatus = (
  feedbackId: string,
  status: string
): FeedbackRecord | null => {
  const feedback = feedbackStore.find((f) => f.id === feedbackId);
  if (feedback) {
    feedback.status = status;
    feedback.updatedAt = new Date().toISOString();
    return feedback;
  }
  return null;
};

interface FeedbackStats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  averageRating: string | null;
}

export const getFeedbackStats = (): FeedbackStats => {
  const byType: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalRating = 0;
  let ratingCount = 0;

  feedbackStore.forEach((f) => {
    byType[f.type] = (byType[f.type] || 0) + 1;
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
    byStatus[f.status] = (byStatus[f.status] || 0) + 1;
    if (f.rating) {
      totalRating += f.rating;
      ratingCount++;
    }
  });

  return {
    total: feedbackStore.length,
    byType,
    byCategory,
    byStatus,
    averageRating:
      ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null,
  };
};

export const FEEDBACK_TYPES = {
  BUG: 'bug',
  FEATURE: 'feature',
  IMPROVEMENT: 'improvement',
  GENERAL: 'general',
} as const;

export const FEEDBACK_CATEGORIES = {
  UI: 'ui',
  AI: 'ai',
  BILLING: 'billing',
  PERFORMANCE: 'performance',
  OTHER: 'other',
} as const;
