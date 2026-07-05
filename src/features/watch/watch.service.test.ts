import { describe, expect, it } from 'vitest';
import { WatchNotificationService } from './watch.service';
import { WatchDevice, WATCH_SUBSCRIPTION_TIERS } from './watch.types';

const mockWatch: WatchDevice = {
  id: 'watch_test',
  model: 'EngineerOS-Pro',
  serialNumber: 'SN-001',
  firmwareVersion: '1.0.0',
  lastSync: null,
  syncStatus: 'disconnected',
  batteryLevel: 15,
  batteryStatus: 'low',
  isCharging: false,
  pairedAt: new Date().toISOString(),
  isActive: true,
};

describe('WatchNotificationService', () => {
  describe('generateVocabularyReminders', () => {
    it('returns vocabulary reminder notifications', () => {
      const reminders = WatchNotificationService.generateVocabularyReminders();
      expect(reminders.length).toBeGreaterThan(0);
      expect(reminders[0].type).toBe('vocabulary');
      expect(reminders[0].title).toContain('Vocabulary');
    });

    it('includes action URL', () => {
      const reminders = WatchNotificationService.generateVocabularyReminders();
      expect(reminders[0].actionUrl).toBe('/vocabulary');
    });
  });

  describe('generateMeetingPrepAlerts', () => {
    it('returns meeting prep notifications', () => {
      const alerts = WatchNotificationService.generateMeetingPrepAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe('meeting');
      expect(alerts[0].priority).toBe('high');
    });
  });

  describe('generateStreakAlerts', () => {
    it('returns streak alert when streak is 0', () => {
      const alert = WatchNotificationService.generateStreakAlerts(0);
      expect(alert).not.toBeNull();
      expect(alert?.type).toBe('streak');
      expect(alert?.priority).toBe('high');
    });

    it('returns achievement alert at 7-day milestones', () => {
      const alert = WatchNotificationService.generateStreakAlerts(7);
      expect(alert).not.toBeNull();
      expect(alert?.type).toBe('achievement');
      expect(alert?.title).toContain('7');
    });

    it('returns null for non-milestone streaks', () => {
      const alert = WatchNotificationService.generateStreakAlerts(5);
      expect(alert).toBeNull();
    });
  });

  describe('simulateBatteryDrain', () => {
    it('reduces battery by 1%', () => {
      const newLevel = WatchNotificationService.simulateBatteryDrain('watch_1', 80);
      expect(newLevel).toBe(79);
    });

    it('does not go below 0', () => {
      const newLevel = WatchNotificationService.simulateBatteryDrain('watch_1', 0);
      expect(newLevel).toBe(0);
    });
  });

  describe('checkChargingReminder', () => {
    it('returns urgent reminder when battery is low and not charging', () => {
      const reminder = WatchNotificationService.checkChargingReminder(mockWatch);
      expect(reminder).not.toBeNull();
      expect(reminder?.priority).toBe('urgent');
      expect(reminder?.message).toContain('15%');
    });

    it('returns null when battery is high', () => {
      const watch: WatchDevice = { ...mockWatch, batteryLevel: 80 };
      const reminder = WatchNotificationService.checkChargingReminder(watch);
      expect(reminder).toBeNull();
    });

    it('returns null when charging', () => {
      const watch: WatchDevice = { ...mockWatch, batteryLevel: 15, isCharging: true };
      const reminder = WatchNotificationService.checkChargingReminder(watch);
      expect(reminder).toBeNull();
    });
  });

  describe('WATCH_SUBSCRIPTION_TIERS', () => {
    it('has all tier definitions', () => {
      expect(WATCH_SUBSCRIPTION_TIERS.free).toBeDefined();
      expect(WATCH_SUBSCRIPTION_TIERS.pro).toBeDefined();
      expect(WATCH_SUBSCRIPTION_TIERS.exec).toBeDefined();
      expect(WATCH_SUBSCRIPTION_TIERS.enterprise).toBeDefined();
    });

    it('free tier has 0 price', () => {
      expect(WATCH_SUBSCRIPTION_TIERS.free.monthlyPrice).toBe(0);
    });

    it('exec tier has priority support', () => {
      expect(WATCH_SUBSCRIPTION_TIERS.exec.prioritySupport).toBe(true);
    });
  });
});
