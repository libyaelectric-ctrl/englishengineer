import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import {
  AVAILABLE_INTERFACE_LANGUAGES,
  useLocalizationStore,
} from '@/features/localization';
import { useAppStore } from '@/store/app.store';

export const TopNavBar = () => {
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);
  const theme = useAppStore((s) => s.theme);
  const autoTheme = useAppStore((s) => s.autoTheme);
  const setTheme = useAppStore((s) => s.setTheme);
  const setAutoTheme = useAppStore((s) => s.setAutoTheme);

  return (
    <nav className="dark:bg-[#0B0E14]/80 flex items-center justify-between border-b border-[#d9d9e3] bg-background/80 backdrop-blur-xl px-4 py-3 sm:px-6 dark:border-[#2a2d35]">
      <Link to="/" className="flex items-center gap-2.5">
        <img
          src="/brand/logo.webp"
          alt="EngVox"
          className="h-8 w-8 rounded-[4px] border border-[#d9d9e3] dark:border-[#2a2d35]"
        />
        <span className="text-sm font-bold tracking-tight">EngVox</span>
      </Link>
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => {
            if (autoTheme) {
              setAutoTheme(false);
              setTheme(theme === 'dark' ? 'light' : 'dark');
            } else {
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }
          }}
          title={autoTheme ? `Auto (${theme === 'dark' ? 'Night' : 'Day'}) — Click to manual` : `Manual — Click to auto`}
          className="relative flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#d9d9e3] bg-white/60 text-black/60 transition hover:bg-black/[0.04] dark:border-[#2a2d35] dark:bg-[#1C1F26] dark:text-[#949BA4] dark:hover:bg-[#252830] cursor-pointer"
        >
          {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          {autoTheme && (
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#0047bb] dark:bg-[#3b82f6]" />
          )}
        </button>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'tr')}
          aria-label="Select Interface Language"
          className="rounded-[4px] border border-[#d9d9e3] bg-white px-2 py-1.5 text-xs text-foreground outline-none cursor-pointer hover:bg-[#0047bb]/5 font-bold uppercase tracking-wider dark:border-[#2a2d35] dark:bg-[#1C1F26] dark:text-[#E2E4E7] dark:hover:bg-[#252830]"
        >
          {AVAILABLE_INTERFACE_LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
};
