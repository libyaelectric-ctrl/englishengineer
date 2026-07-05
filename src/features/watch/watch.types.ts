export type WatchModel = 'EngineerOS-Pro' | 'EngineerOS-Exec' | 'EngineerOS-Enterprise';
export type WatchSyncStatus = 'disconnected' | 'connecting' | 'syncing' | 'connected' | 'error';
export type WatchBatteryLevel = 'critical' | 'low' | 'medium' | 'high' | 'full';

export interface WatchDevice {
  id: string;
  model: WatchModel;
  serialNumber: string;
  firmwareVersion: string;
  lastSync: string | null;
  syncStatus: WatchSyncStatus;
  batteryLevel: number; // 0-100
  batteryStatus: WatchBatteryLevel;
  isCharging: boolean;
  pairedAt: string;
  isActive: boolean;
}

export interface WatchLearningNotification {
  id: string;
  type: 'vocabulary' | 'meeting' | 'streak' | 'reminder' | 'achievement';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor: string;
  sentAt?: string;
  acknowledged?: boolean;
  actionUrl?: string;
}

export interface WatchProgressSnapshot {
  watchId: string;
  timestamp: string;
  currentLevel: number;
  xp: number;
  coins: number;
  streak: number;
  dailyGoalProgress: number;
  weeklyGoalProgress: number;
  weakVocabularyCount: number;
  upcomingMeetingPrep: {
    meetingId: string;
    title: string;
    timeUntil: number; // minutes
    vocabularyToReview: number;
  }[];
}

export interface WatchSettings {
  notificationsEnabled: boolean;
  vocabularyReminders: boolean;
  meetingPrepAlerts: boolean;
  streakAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
  hapticFeedback: boolean;
  screenBrightness: number; // 0-100
  autoSync: boolean;
  batteryOptimization: boolean;
}

export interface WatchSubscriptionTier {
  tier: 'free' | 'pro' | 'exec' | 'enterprise';
  watchModel: WatchModel;
  monthlyPrice: number;
  features: string[];
  aiRequestsPerDay: number;
  storageLimit: number; // MB
  prioritySupport: boolean;
}

export const WATCH_SUBSCRIPTION_TIERS: Record<string, WatchSubscriptionTier> = {
  free: {
    tier: 'free',
    watchModel: 'EngineerOS-Pro',
    monthlyPrice: 0,
    features: [
      'Basic progress sync',
      'Daily streak reminders',
      'Limited vocabulary notifications (5/day)',
      'Basic watch face',
    ],
    aiRequestsPerDay: 3,
    storageLimit: 50,
    prioritySupport: false,
  },
  pro: {
    tier: 'pro',
    watchModel: 'EngineerOS-Pro',
    monthlyPrice: 29,
    features: [
      'Everything in Free',
      'Unlimited vocabulary notifications',
      'Meeting preparation alerts',
      'Achievement notifications',
      'Custom watch faces',
      'Advanced analytics sync',
      'Offline vocabulary mode',
    ],
    aiRequestsPerDay: 100,
    storageLimit: 500,
    prioritySupport: false,
  },
  exec: {
    tier: 'exec',
    watchModel: 'EngineerOS-Exec',
    monthlyPrice: 79,
    features: [
      'Everything in Pro',
      'Premium titanium watch',
      'Voice command integration',
      'Biometric stress detection',
      'Location-based learning suggestions',
      'Priority customer support',
      'Unlimited AI requests',
      '1GB cloud storage',
    ],
    aiRequestsPerDay: -1, // unlimited
    storageLimit: 1024,
    prioritySupport: true,
  },
  enterprise: {
    tier: 'enterprise',
    watchModel: 'EngineerOS-Enterprise',
    monthlyPrice: 199,
    features: [
      'Everything in Exec',
      'Bulk deployment tools',
      'Team analytics dashboard',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'SLA guarantee',
      'Unlimited cloud storage',
    ],
    aiRequestsPerDay: -1,
    storageLimit: -1, // unlimited
    prioritySupport: true,
  },
};

export interface WatchStoreState {
  pairedWatches: WatchDevice[];
  activeWatchId: string | null;
  notifications: WatchLearningNotification[];
  settings: WatchSettings;
  subscriptionTier: string;
  isSyncing: boolean;
  lastSyncError: string | null;
  
  // Actions
  pairWatch: (watchData: Omit<WatchDevice, 'id' | 'pairedAt' | 'isActive'>) => Promise<string>;
  unpairWatch: (watchId: string) => Promise<void>;
  setActiveWatch: (watchId: string) => void;
  syncNow: () => Promise<void>;
  updateSettings: (settings: Partial<WatchSettings>) => void;
  scheduleNotification: (notification: Omit<WatchLearningNotification, 'id'>) => string;
  acknowledgeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  updateSubscription: (tier: string) => void;
}
