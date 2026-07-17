interface ActivityRecord {
  id: string;
  userId: string;
  action: string;
  category: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

const activities: ActivityRecord[] = [];
const MAX_ACTIVITIES = 5000;

interface TrackActivityOpts {
  userId: string;
  action: string;
  category: string;
  metadata?: Record<string, unknown>;
}

export const trackActivity = ({
  userId,
  action,
  category,
  metadata = {},
}: TrackActivityOpts): ActivityRecord => {
  const activity: ActivityRecord = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    action,
    category,
    metadata,
    timestamp: new Date().toISOString(),
  };

  activities.push(activity);

  if (activities.length > MAX_ACTIVITIES) {
    activities.splice(0, activities.length - MAX_ACTIVITIES);
  }

  return activity;
};

export const getUserActivities = (
  userId: string,
  limit: number = 50
): ActivityRecord[] => {
  return activities
    .filter((a) => a.userId === userId)
    .slice(-limit)
    .reverse();
};

export const getRecentActivities = (limit: number = 100): ActivityRecord[] => {
  return activities.slice(-limit).reverse();
};

interface ActivityStats {
  total: number;
  byAction: Record<string, number>;
  byCategory: Record<string, number>;
  byUser: Record<string, number>;
  uniqueUsers: number;
}

export const getActivityStats = (timeRange: string = '24h'): ActivityStats => {
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

  const filtered = activities.filter((a) => new Date(a.timestamp) >= cutoff);

  const byAction: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byUser: Record<string, number> = {};

  filtered.forEach((a) => {
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

export const ACTIVITY_CATEGORIES = {
  AUTH: 'auth',
  LEARNING: 'learning',
  BILLING: 'billing',
  AI: 'ai',
  ADMIN: 'admin',
} as const;

export const ACTIVITY_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',
  LESSON_COMPLETE: 'lesson_complete',
  VOCABULARY_PRACTICE: 'vocabulary_practice',
  AI_REQUEST: 'ai_request',
  SUBSCRIPTION_CHANGE: 'subscription_change',
  ADMIN_ACTION: 'admin_action',
} as const;
