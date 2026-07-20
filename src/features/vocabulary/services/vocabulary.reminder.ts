const REMINDER_STORAGE_KEY = 'EngVox_review_reminder';
const REMINDER_CHECK_KEY = 'EngVox_review_reminder_last_check';

export interface ReviewReminderSettings {
  enabled: boolean;
  timeOfDay: string;
  lastNotifiedDate: string;
  streakMaintained: boolean;
}

export interface ReviewReminderStatus {
  shouldNotify: boolean;
  wordsDue: number;
  currentStreak: number;
  lastNotifiedDate: string;
}

const defaultSettings = (): ReviewReminderSettings => ({
  enabled: true,
  timeOfDay: '09:00',
  lastNotifiedDate: '',
  streakMaintained: true,
});

export const ReviewReminderService = {
  getSettings(): ReviewReminderSettings {
    try {
      const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
      return stored
        ? { ...defaultSettings(), ...JSON.parse(stored) }
        : defaultSettings();
    } catch {
      return defaultSettings();
    }
  },

  saveSettings(settings: ReviewReminderSettings): void {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  },

  updateSettings(partial: Partial<ReviewReminderSettings>): void {
    this.saveSettings({ ...this.getSettings(), ...partial });
  },

  checkAndNotify(
    dueCount: number,
    currentStreak: number,
    now = new Date()
  ): ReviewReminderStatus {
    const settings = this.getSettings();
    const today = now.toISOString().split('T')[0];
    const lastChecked = localStorage.getItem(REMINDER_CHECK_KEY) ?? '';

    if (lastChecked === today && settings.lastNotifiedDate === today) {
      return {
        shouldNotify: false,
        wordsDue: dueCount,
        currentStreak,
        lastNotifiedDate: settings.lastNotifiedDate,
      };
    }

    localStorage.setItem(REMINDER_CHECK_KEY, today);

    if (!settings.enabled || dueCount === 0) {
      return {
        shouldNotify: false,
        wordsDue: dueCount,
        currentStreak,
        lastNotifiedDate: settings.lastNotifiedDate,
      };
    }

    const shouldNotify = this.isReminderTime(settings.timeOfDay, now);

    if (shouldNotify && settings.lastNotifiedDate !== today) {
      this.updateSettings({ lastNotifiedDate: today });
    }

    return {
      shouldNotify,
      wordsDue: dueCount,
      currentStreak,
      lastNotifiedDate: shouldNotify ? today : settings.lastNotifiedDate,
    };
  },

  isReminderTime(timeOfDay: string, now = new Date()): boolean {
    const [hours, minutes] = timeOfDay.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return (
      currentHour === hours &&
      currentMinute >= minutes &&
      currentMinute < minutes + 15
    );
  },

  shouldShowBanner(
    dueCount: number,
    lastNotifiedDate: string,
    now = new Date()
  ): boolean {
    if (dueCount === 0) return false;
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return lastNotifiedDate !== today;
  },

  getReminderMessage(dueCount: number, streak: number): string {
    if (dueCount === 0) return 'All reviews complete! Great work.';
    if (streak > 7) {
      return `${dueCount} words due today — keep your ${streak}-day streak alive!`;
    }
    if (dueCount <= 3) {
      return `${dueCount} words due today — quick session!`;
    }
    return `${dueCount} words due for review today.`;
  },

  formatNextReminder(timeOfDay: string): string {
    const [hours] = timeOfDay.split(':').map(Number);
    if (hours < 12) return `Next reminder at ${timeOfDay} AM`;
    return `Next reminder at ${timeOfDay} PM`;
  },

  clearReminder(): void {
    localStorage.removeItem(REMINDER_STORAGE_KEY);
    localStorage.removeItem(REMINDER_CHECK_KEY);
  },
};
