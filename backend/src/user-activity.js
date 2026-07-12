/**
 * User Activity Tracking Service
 * Tracks user actions for analytics and audit
 */

const activities = [];
const MAX_ACTIVITIES = 5000;

export const trackActivity = ({
  userId,
  action,
  category,
  metadata = {},
}) => {
  const activity = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    action,
    category,
    metadata,
    timestamp: new Date().toISOString(),
  };

  activities.push(activity);

  // Keep only last N activities in memory
  if (activities.length > MAX_ACTIVITIES) {
    activities.splice(0, activities.length - MAX_ACTIVITIES);
  }

  return activity;
};

export const getUserActivities = (userId, limit = 50) => {
  return activities
    .filter(a => a.userId === userId)
    .slice(-limit)
    .reverse();
};

export const getRecentActivities = (limit = 100) => {
  return activities.slice(-limit).reverse();
};

export const getActivityStats = (timeRange = '24h') => {
  const now = new Date();
  const cutoff = new Date(now);

  switch (timeRange) {
    case '1h':
      cutoff.setHours(cutoff.getHours() - 1);
      break;
    case '24h':
      cutoff.setDate(cutoff.getDate() - 1);
      break;
    case '7d':
      cutoff.setDate(cutoff.getDate() - 7);
      break;
  }

  const filtered = activities.filter(a => new Date(a.timestamp) >= cutoff);

  const byAction = {};
  const byCategory = {};
  const byUser = {};

  filtered.forEach(a => {
    byAction[a.action] = (byAction[a.action] || 0) + 1;
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
    byUser[a.userId] = (byUser[a.userId] || 0) + 1;
  });

  return {
    total: filtered.length,
    byAction,
    byCategory,
    byUser,
    uniqueUsers: Object.keys(byUser).length,
  };
};

// Activity categories
export const ACTIVITY_CATEGORIES = {
  AUTH: 'auth',
  LEARNING: 'learning',
  BILLING: 'billing',
  AI: 'ai',
  ADMIN: 'admin',
};

// Activity actions
export const ACTIVITY_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',
  LESSON_COMPLETE: 'lesson_complete',
  VOCABULARY_PRACTICE: 'vocabulary_practice',
  AI_REQUEST: 'ai_request',
  SUBSCRIPTION_CHANGE: 'subscription_change',
  ADMIN_ACTION: 'admin_action',
};
