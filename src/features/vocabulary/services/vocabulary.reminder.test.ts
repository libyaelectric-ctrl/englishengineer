import { beforeEach, describe, expect, it } from 'vitest';
import { ReviewReminderService } from './vocabulary.reminder';

describe('ReviewReminderService', () => {
  beforeEach(() => {
    localStorage.clear();
    ReviewReminderService.clearReminder();
  });

  describe('getSettings / saveSettings', () => {
    it('returns default settings when empty', () => {
      const settings = ReviewReminderService.getSettings();
      expect(settings.enabled).toBe(true);
      expect(settings.timeOfDay).toBe('09:00');
      expect(settings.lastNotifiedDate).toBe('');
    });

    it('persists settings', () => {
      ReviewReminderService.updateSettings({ enabled: false });
      expect(ReviewReminderService.getSettings().enabled).toBe(false);
    });
  });

  describe('checkAndNotify', () => {
    it('returns shouldNotify true when due words exist and time matches', () => {
      const now = new Date(2026, 6, 19, 9, 5, 0);
      const result = ReviewReminderService.checkAndNotify(5, 3, now);
      expect(result.shouldNotify).toBe(true);
      expect(result.wordsDue).toBe(5);
    });

    it('returns shouldNotify false when no due words', () => {
      const now = new Date(2026, 6, 19, 9, 5, 0);
      const result = ReviewReminderService.checkAndNotify(0, 3, now);
      expect(result.shouldNotify).toBe(false);
    });

    it('returns shouldNotify false when time does not match', () => {
      const now = new Date(2026, 6, 19, 14, 0, 0);
      const result = ReviewReminderService.checkAndNotify(5, 3, now);
      expect(result.shouldNotify).toBe(false);
    });

    it('does not notify twice on the same day', () => {
      const now = new Date(2026, 6, 19, 9, 5, 0);
      ReviewReminderService.checkAndNotify(5, 3, now);
      const second = ReviewReminderService.checkAndNotify(5, 3, now);
      expect(second.shouldNotify).toBe(false);
    });
  });

  describe('shouldShowBanner', () => {
    it('returns true when there are due words and not yet notified today', () => {
      expect(ReviewReminderService.shouldShowBanner(3, '2026-07-18')).toBe(
        true
      );
    });

    it('returns false when no due words', () => {
      expect(ReviewReminderService.shouldShowBanner(0, '2026-07-18')).toBe(
        false
      );
    });

    it('returns false when already notified today', () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      expect(ReviewReminderService.shouldShowBanner(3, todayStr)).toBe(false);
    });
  });

  describe('getReminderMessage', () => {
    it('returns completion message when no due words', () => {
      expect(ReviewReminderService.getReminderMessage(0, 5)).toBe(
        'All reviews complete! Great work.'
      );
    });

    it('returns streak message for long streaks', () => {
      const msg = ReviewReminderService.getReminderMessage(5, 10);
      expect(msg).toContain('10-day streak');
    });

    it('returns quick session message for few words', () => {
      const msg = ReviewReminderService.getReminderMessage(2, 3);
      expect(msg).toContain('quick session');
    });
  });

  describe('isReminderTime', () => {
    it('returns true within the 15-minute window', () => {
      const now = new Date(2026, 6, 19, 9, 10, 0);
      expect(ReviewReminderService.isReminderTime('09:00', now)).toBe(true);
    });

    it('returns false outside the window', () => {
      const now = new Date(2026, 6, 19, 9, 20, 0);
      expect(ReviewReminderService.isReminderTime('09:00', now)).toBe(false);
    });
  });
});
