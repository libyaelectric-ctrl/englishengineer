import { ArrowRight, Globe, Moon, Sun, Wrench } from 'lucide-react';

import { useCallback, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { storage } from '@/shared/storage';
import type { CareerTrackId, InterfaceLanguage } from '@/shared/types/domain.types';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { AUTH_SIGN_IN_URL } from '@/features/auth/firebase.config';
import { useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { useTheme } from '@/features/theme/ThemeProvider';

const DISCIPLINES = [
  { id: 'architecture', full: 'Architecture', icon: 'ğŸ›ï¸' },
  { id: 'chemical', full: 'Chemical Eng.', icon: 'âš—ï¸' },
  { id: 'civil', full: 'Civil Eng.', icon: 'ğŸ—ï¸' },
  { id: 'electrical', full: 'Electrical Eng.', icon: 'âš¡' },
  { id: 'electronics', full: 'Electronics Eng.', icon: 'ğŸ”Œ' },
  { id: 'software', full: 'Software Eng.', icon: 'ğŸ’»' },
  { id: 'mechatronics', full: 'Mechatronics', icon: 'ğŸ¤–' },
  { id: 'mechanical', full: 'Mechanical Eng.', icon: 'âš™ï¸' },
  { id: 'industrial', full: 'Industrial Eng.', icon: 'ğŸ­' },
  { id: 'hse', full: 'HSE Eng.', icon: 'ğŸ›¡ï¸' },
];

const LANGUAGES = [
  { id: 'en', label: 'English', flag: 'ğŸ‡¬ğŸ‡§' },
  { id: 'tr', label: 'TÃ¼rkÃ§e', flag: 'ğŸ‡¹ğŸ‡·' },
  { id: 'ar', label: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©', flag: 'ğŸ‡¸ğŸ‡¦' },
  { id: 'de', label: 'Deutsch', flag: 'ğŸ‡©ğŸ‡ª' },
  { id: 'es', label: 'EspaÃ±ol', flag: 'ğŸ‡ªğŸ‡¸' },
  { id: 'fr', label: 'FranÃ§ais', flag: 'ğŸ‡«ğŸ‡·' },
  { id: 'pt', label: 'PortuguÃªs', flag: 'ğŸ‡§ğŸ‡·' },
  { id: 'ru', label: 'Ğ ÑƒÑÑĞºĞ¸Ğ¹', flag: 'ğŸ‡·ğŸ‡º' },
  { id: 'zh', label: 'ä¸­æ–‡', flag: 'ğŸ‡¨ğŸ‡³' },
  { id: 'ja', label: 'æ—¥æœ¬èª', flag: 'ğŸ‡¯ğŸ‡µ' },
  { id: 'it', label: 'Italiano', flag: 'ğŸ‡®ğŸ‡¹' },
  { id: 'vi', label: 'Tiáº¿ng Viá»‡t', flag: 'ğŸ‡»ğŸ‡³' },
  { id: 'pl', label: 'Polski', flag: 'ğŸ‡µğŸ‡±' },
  { id: 'id', label: 'Bahasa Indonesia', flag: 'ğŸ‡®ğŸ‡©' },
  { id: 'nl', label: 'Nederlands', flag: 'ğŸ‡³ğŸ‡±' },
];

export const consumePendingOnboard = () => {
  const pending = storage.globalGet('engvox-pending-onboard');
  if (pending) {
    storage.globalRemove('engvox-pending-onboard');
    return pending as { discipline: string; language: string };
  }
  return null;
};

const OnboardPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleEnter = useCallback(async () => {
    if (!selectedDiscipline || !selectedLanguage || saving) return;
    setSaving(true);
    try {
      if (currentUser) {
        setLanguage(selectedLanguage as SupportedInterfaceLanguage);
        await LearningProfileRepository.updatePreferences(currentUser.id, {
          discipline: selectedDiscipline as EngineeringDiscipline,
          professionalTrack: selectedDiscipline as CareerTrackId,
          interfaceLanguage: selectedLanguage as InterfaceLanguage,
          onboardingCompleted: true,
        });
        useAuthStore.setState({
          currentUser: {
            ...useAuthStore.getState().currentUser!,
            engineeringDiscipline: selectedDiscipline,
          },
        });
        useLearningStore.getState().resetAll();
        navigate('/dashboard', { replace: true });
      } else {
        storage.globalSet('engvox-pending-onboard', {
          discipline: selectedDiscipline,
          language: selectedLanguage,
        });
        navigate(`${AUTH_SIGN_IN_URL}?redirect=/onboard`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  }, [selectedDiscipline, selectedLanguage, saving, currentUser, setLanguage, navigate]);

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        isDark ? 'bg-[#04080f] text-gray-100' : 'bg-gray-50 text-gray-900'
      )}
    >
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <img src="/brand/logo.svg" className="h-6" alt="EngVox Logo" />
          <b>EngVox</b>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/')} className="px-3 py-1 border rounded text-xs">
            Back
          </button>
          <button onClick={toggleTheme} className="p-1 border rounded" aria-label="Toggle theme">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-8 max-w-6xl mx-auto w-full">
        <section>
          <h2 className="text-xs font-bold uppercase mb-4 flex items-center gap-2">
            <Wrench size={14} /> Professions
          </h2>
          <div className="grid gap-2">
            {DISCIPLINES.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDiscipline(d.id)}
                className={cn(
                  'p-3.5 sm:p-4 border rounded-xl text-left transition-all',
                  selectedDiscipline === d.id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-border-soft hover:bg-surface-hover'
                )}
              >
                {d.icon} {d.full}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xs font-bold uppercase mb-4 flex items-center gap-2">
            <Globe size={14} /> Languages
          </h2>
          <div className="grid gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLanguage(l.id)}
                className={cn(
                  'p-3.5 sm:p-4 border rounded-xl text-left transition-all',
                  selectedLanguage === l.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-border-soft hover:bg-surface-hover'
                )}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </section>
      </main>
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-md p-4 sm:p-6 border-t flex justify-center z-20">
        <button
          onClick={handleEnter}
          disabled={!selectedDiscipline || !selectedLanguage || saving}
          className={cn(
            'w-full sm:w-auto px-8 sm:px-12 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all',
            selectedDiscipline && selectedLanguage
              ? 'bg-primary text-white shadow-lg'
              : 'bg-gray-200 text-gray-400'
          )}
        >
          {saving ? 'Loading...' : 'Enter EngVox'}
          <ArrowRight size={18} />
        </button>
      </footer>
    </div>
  );
};

export default OnboardPage;
