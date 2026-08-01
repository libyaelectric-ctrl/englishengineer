export interface FeatureFlag {
  enabled: boolean;
  description: string;
  rolloutPercentage?: number;
  allowedUsers?: string[];
  allowedPlans?: string[];
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  'ai-coach-v2': {
    enabled: true,
    description: 'New AI Coach with enhanced evaluation',
  },
  'writing-review-beta': {
    enabled: true,
    description: 'Writing review with advanced feedback',
  },
  'gamification-leaderboard': {
    enabled: false,
    description: 'Team leaderboard for gamification',
    allowedPlans: ['pro', 'project', 'exec', 'private', 'team'],
  },
  'advanced-analytics': {
    enabled: false,
    description: 'Advanced analytics dashboard',
    rolloutPercentage: 50,
    allowedPlans: ['exec', 'private', 'team'],
  },
  'voice-practice-v2': {
    enabled: true,
    description: 'Enhanced voice practice with real-time feedback',
  },
  'multi-language-ui': {
    enabled: false,
    description: 'Full multi-language UI support',
    rolloutPercentage: 25,
  },
  'workspace-collaboration': {
    enabled: false,
    description: 'Real-time workspace collaboration',
    allowedPlans: ['project', 'exec', 'private', 'team'],
  },
  'offline-mode': {
    enabled: true,
    description: 'Offline learning mode with sync',
  },
};

export const getDefaultFlags = (): Record<string, boolean> => {
  const flags: Record<string, boolean> = {};
  Object.entries(FEATURE_FLAGS).forEach(([key, flag]) => {
    flags[key] = flag.enabled;
  });
  return flags;
};
