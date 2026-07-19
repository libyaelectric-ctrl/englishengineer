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
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <nav className="dark:bg-[#0B0E14]/80 flex items-center justify-between border-b border-[#E9ECEF] bg-white/80 backdrop-blur-xl px-4 py-3 sm:px-6 dark:border-[#2a2d35]">
      <Link to="/" className="flex items-center gap-2.5">
        <img
          src="/brand/logo.webp"
          alt="EngVox"
          className="h-8 w-8 rounded-[4px] border border-[#E9ECEF] dark:border-[#2a2d35]"
        />
        <span className="text-sm font-bold tracking-tight text-[#1c1d22] dark:text-[#E2E4E7]">EngVox</span>
      </Link>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#E9ECEF] bg-white text-[#5b5d72] transition hover:bg-[#F1F3F5] dark:border-[#2a2d35] dark:bg-[#1C1F26] dark:text-[#949BA4] dark:hover:bg-[#252830] cursor-pointer"
        >
          {theme === 'dark' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'tr')}
          aria-label="Select Interface Language"
          className="rounded-[4px] border border-[#E9ECEF] bg-white px-2 py-1.5 text-xs text-[#1c1d22] outline-none cursor-pointer hover:bg-[#F1F3F5] font-bold uppercase tracking-wider dark:border-[#2a2d35] dark:bg-[#1C1F26] dark:text-[#E2E4E7] dark:hover:bg-[#252830]"
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
