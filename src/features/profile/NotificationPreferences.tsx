import { useState } from 'react';
import { Bell } from 'lucide-react';

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle = ({ label, description, checked, onChange }: ToggleProps) => {
  const id = `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="flex items-center justify-between gap-4 rounded-[4px] border border-[#d9d9e3] bg-white p-4 cursor-pointer hover:bg-[#faf8ff] transition-colors shadow-sm">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-[10px] text-muted-copy mt-1 font-medium">
          {description}
        </p>
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-[4px] border transition-colors cursor-pointer ${
          checked
            ? 'bg-[#0047bb] border-[#0047bb]'
            : 'bg-[#faf8ff] border-[#d9d9e3]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-[2px] bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};

export const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-[#0047bb]" />
        <h3 className="text-[10px] font-bold text-foreground uppercase tracking-wider">
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
