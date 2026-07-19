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
    <nav className="flex items-center justify-between border-b border-border-soft bg-surface/80 backdrop-blur-xl px-4 py-3 sm:px-6">
      <Link to="/" className="flex items-center gap-2.5">
        <img
          src="/brand/logo.webp"
          alt="EngVox"
          className="h-8 w-8 rounded-[4px] border border-border-soft"
        />
        <span className="text-sm font-bold tracking-tight text-foreground">EngVox</span>
      </Link>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-border-soft bg-surface text-muted-copy transition hover:bg-surface-hover cursor-pointer"
        >
          {theme === 'dark' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'tr')}
          aria-label="Select Interface Language"
          className="rounded-[4px] border border-border-soft bg-surface px-2 py-1.5 text-xs text-foreground outline-none cursor-pointer hover:bg-surface-hover font-bold uppercase tracking-wider"
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
