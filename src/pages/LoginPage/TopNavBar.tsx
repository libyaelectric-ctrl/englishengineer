import { Link } from 'react-router-dom';
import {
  AVAILABLE_INTERFACE_LANGUAGES,
  useLocalizationStore,
} from '@/features/localization';

export const TopNavBar = () => {
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);

  return (
    <nav className="flex items-center justify-between border-b border-border-soft px-4 py-3 sm:px-6">
      <Link to="/" className="flex items-center gap-2.5">
        <img
          src="/brand/logo.png"
          alt="EngVox"
          className="h-8 w-8 rounded-lg"
        />
        <span className="text-sm font-semibold">EngVox</span>
      </Link>
      <div className="flex items-center gap-3">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'tr')}
          className="rounded-lg border border-border-soft bg-surface px-2 py-1.5 text-xs text-foreground outline-none"
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
