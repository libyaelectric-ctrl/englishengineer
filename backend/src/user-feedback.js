/**
 * User Feedback Service
 * Collects and manages user feedback
 */

const feedbackStore = [];

export const submitFeedback = ({
  userId,
  type,
  category,
  message,
  rating,
  metadata = {},
}) => {
  const feedback = {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    type, // 'bug', 'feature', 'improvement', 'general'
    category, // 'ui', 'ai', 'billing', 'performance', 'other'
    message,
    rating, // 1-5
    metadata,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  feedbackStore.push(feedback);

  // Keep only last 1000 feedbacks
  if (feedbackStore.length > 1000) {
    feedbackStore.splice(0, feedbackStore.length - 1000);
  }

  return feedback;
};

export const getFeedback = (filters = {}) => {
  let results = [...feedbackStore];

  if (filters.type) {
    results = results.filter(f => f.type === filters.type);
  }
  if (filters.category) {
    results = results.filter(f => f.category === filters.category);
  }
  if (filters.status) {
    results = results.filter(f => f.status === filters.status);
  }
  if (filters.userId) {
    results = results.filter(f => f.userId === filters.userId);
  }

  return results.slice(-(filters.limit || 100)).reverse();
};

export const updateFeedbackStatus = (feedbackId, status) => {
  const feedback = feedbackStore.find(f => f.id === feedbackId);
  if (feedback) {
    feedback.status = status;
    feedback.updatedAt = new Date().toISOString();
    return feedback;
  }
  return null;
};

export const getFeedbackStats = () => {
  const byType = {};
  const byCategory = {};
  const byStatus = {};
  let totalRating = 0;
  let ratingCount = 0;

  feedbackStore.forEach(f => {
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
    averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null,
  };
};

export const FEEDBACK_TYPES = {
  BUG: 'bug',
  FEATURE: 'feature',
  IMPROVEMENT: 'improvement',
  GENERAL: 'general',
};

export const FEEDBACK_CATEGORIES = {
  UI: 'ui',
  AI: 'ai',
  BILLING: 'billing',
  PERFORMANCE: 'performance',
  OTHER: 'other',
};
