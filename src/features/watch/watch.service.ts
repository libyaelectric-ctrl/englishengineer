import type {
  WatchLearningNotification,
  WatchProgressSnapshot,
  WatchDevice,
} from './watch.types';
import { useLearningCockpit } from '@/features/profile';
import { useWatchStore } from './watch.store';

export const WatchNotificationService = {
  /**
   * Generate vocabulary reminder notifications
   */
  generateVocabularyReminders: (): Omit<WatchLearningNotification, 'id'>[] => {
    const notifications: Omit<WatchLearningNotification, 'id'>[] = [];
    
    // This would integrate with the actual vocabulary store
    // For now, we'll create a template
    
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
    
    notifications.push({
      type: 'vocabulary',
      title: 'Vocabulary Review Due',
      message: '5 engineering terms need review before your next lesson.',
      priority: 'medium',
      scheduledFor: scheduledTime.toISOString(),
      actionUrl: '/vocabulary',
    });
    
    return notifications;
  },

  /**
   * Generate meeting preparation alerts
   */
  generateMeetingPrepAlerts: (): Omit<WatchLearningNotification, 'id'>[] => {
    const notifications: Omit<WatchLearningNotification, 'id'>[] = [];
    
    // This would integrate with calendar/meeting data
    // For now, we'll create a template
    
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    notifications.push({
      type: 'meeting',
      title: 'Site Meeting Prep',
      message: 'Review electrical terminology for client meeting in 1 hour.',
      priority: 'high',
      scheduledFor: scheduledTime.toISOString(),
      actionUrl: '/vocabulary',
    });
    
    return notifications;
  },

  /**
   * Generate streak maintenance alerts
   */
  generateStreakAlerts: (streak: number): Omit<WatchLearningNotification, 'id'> | null => {
    if (streak === 0) {
      const now = new Date();
      const scheduledTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      
      return {
        type: 'streak',
        title: 'Maintain Your Streak',
        message: 'Complete a lesson today to keep your learning momentum.',
        priority: 'high',
        scheduledFor: scheduledTime.toISOString(),
        actionUrl: '/dashboard',
      };
    }
    
    if (streak >= 7 && streak % 7 === 0) {
      const now = new Date();
      const scheduledTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
      
      return {
        type: 'achievement',
        title: `${streak} Day Streak!`,
        message: 'Amazing consistency! Keep up the great work.',
        priority: 'low',
        scheduledFor: scheduledTime.toISOString(),
        actionUrl: '/analytics',
      };
    }
    
    return null;
  },

  /**
   * Create a progress snapshot for watch sync
   */
  createProgressSnapshot: (
    userId: string | undefined
  ): WatchProgressSnapshot | null => {
    if (!userId) return null;
    
    const { memory, learningState } = useLearningCockpit(userId);
    
    const activeWatchId = useWatchStore((state) => state.activeWatchId);
    if (!activeWatchId) return null;
    
    const weakVocabularyCount = memory.weakWords;
    const dailyGoalProgress = learningState.studySessions.filter(
      (s) => new Date(s.timestamp).toDateString() === new Date().toDateString()
    ).length;
    
    // Calculate current level from XP (simplified)
    const currentLevel = Math.floor(learningState.xp / 1000) + 1;
    
    return {
      watchId: activeWatchId,
      timestamp: new Date().toISOString(),
      currentLevel,
      xp: learningState.xp,
      coins: learningState.coins,
      streak: learningState.streak,
      dailyGoalProgress,
      weeklyGoalProgress: dailyGoalProgress, // Simplified for now
      weakVocabularyCount,
      upcomingMeetingPrep: [], // Would integrate with calendar
    };
  },

  /**
   * Schedule all pending notifications
   */
  scheduleAllNotifications: () => {
    const { scheduleNotification } = useWatchStore.getState();
    
    // Generate vocabulary reminders
    const vocabReminders = WatchNotificationService.generateVocabularyReminders();
    vocabReminders.forEach((notification) => {
      scheduleNotification(notification);
    });
    
    // Generate meeting prep alerts
    const meetingAlerts = WatchNotificationService.generateMeetingPrepAlerts();
    meetingAlerts.forEach((notification) => {
      scheduleNotification(notification);
    });
    
    // Generate streak alerts (would need actual streak data)
    // const streakAlert = WatchNotificationService.generateStreakAlerts(streak);
    // if (streakAlert) {
    //   scheduleNotification(streakAlert);
    // }
  },

  /**
   * Simulate watch battery drain
   */
  simulateBatteryDrain: (_watchId: string, currentLevel: number): number => {
    // Simulate 1% battery drain per hour
    const drainRate = 1;
    const newLevel = Math.max(0, currentLevel - drainRate);
    
    return newLevel;
  },

  /**
   * Check if watch needs charging reminder
   */
  checkChargingReminder: (watch: WatchDevice): Omit<WatchLearningNotification, 'id'> | null => {
    if (watch.batteryLevel <= 20 && !watch.isCharging) {
      const now = new Date();
      const scheduledTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
      
      return {
        type: 'reminder',
        title: 'Watch Battery Low',
        message: `Battery at ${watch.batteryLevel}%. Please charge soon.`,
        priority: 'urgent',
        scheduledFor: scheduledTime.toISOString(),
      };
    }
    
    return null;
  },
};
