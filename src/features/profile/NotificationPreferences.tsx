import { useState } from 'react';
import { Bell } from 'lucide-react';

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle = ({ label, description, checked, onChange }: ToggleProps) => (
  <label className="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-surface p-4 cursor-pointer hover:bg-surface-hover/30 transition-colors">
    <div className="min-w-0">
      <p className="text-sm font-bold text-foreground">{label}</p>
      <p className="text-xs text-muted-copy mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-border-soft'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
);

export const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">
          Notification Preferences
        </h3>
      </div>
      <div className="space-y-3">
        <Toggle
          label="Daily Reminder"
          description="Get a reminder to practice every day"
          checked={prefs.dailyReminder}
          onChange={() => toggle('dailyReminder')}
        />
        <Toggle
          label="Weekly Report"
          description="Receive a summary of your weekly progress"
          checked={prefs.weeklyReport}
          onChange={() => toggle('weeklyReport')}
        />
        <Toggle
          label="Achievement Notifications"
          description="Celebrate when you unlock new achievements"
          checked={prefs.achievements}
          onChange={() => toggle('achievements')}
        />
      </div>
    </div>
  );
};
