import { Link } from 'react-router-dom';
import {
  AVAILABLE_INTERFACE_LANGUAGES,
  useLocalizationStore,
} from '@/features/localization';

export const TopNavBar = () => {
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);

  return (
    <nav className="flex items-center justify-between border-b border-[#d9d9e3] bg-background/80 backdrop-blur-xl px-4 py-3 sm:px-6">
      <Link to="/" className="flex items-center gap-2.5">
        <img
          src="/brand/logo.png"
          alt="EngVox"
          className="h-8 w-8 rounded-[4px] border border-[#d9d9e3]"
        />
        <span className="text-sm font-bold tracking-tight">EngVox</span>
      </Link>
      <div className="flex items-center gap-3">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'tr')}
          aria-label="Select Interface Language"
          className="rounded-[4px] border border-[#d9d9e3] bg-white px-2 py-1.5 text-xs text-foreground outline-none cursor-pointer hover:bg-[#0047bb]/5 font-bold uppercase tracking-wider"
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
