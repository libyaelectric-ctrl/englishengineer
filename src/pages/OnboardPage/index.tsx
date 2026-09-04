import { ArrowRight, Globe, Moon, Sun, Wrench } from 'lucide-react';

import { useCallback, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { storage } from '@/shared/storage';
import type { CareerTrackId, InterfaceLanguage } from '@/shared/types/domain.types';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { CLERK_SIGN_IN_URL } from '@/features/auth/clerk.config';
import { useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { useTheme } from '@/features/theme/ThemeProvider';

const DISCIPLINES = [
  { id: 'architecture', full: 'Architecture', icon: '🏛️' },
  { id: 'chemical', full: 'Chemical Eng.', icon: '⚗️' },
  { id: 'civil', full: 'Civil Eng.', icon: '🏗️' },
  { id: 'electrical', full: 'Electrical Eng.', icon: '⚡' },
  { id: 'electronics', full: 'Electronics Eng.', icon: '🔌' },
  { id: 'software', full: 'Software Eng.', icon: '💻' },
  { id: 'mechatronics', full: 'Mechatronics', icon: '🤖' },
  { id: 'mechanical', full: 'Mechanical Eng.', icon: '⚙️' },
  { id: 'industrial', full: 'Industrial Eng.', icon: '🏭' },
  { id: 'hse', full: 'HSE Eng.', icon: '🛡️' },
];

const LANGUAGES = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'pt', label: 'Português', flag: '🇧🇷' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'zh', label: '中文', flag: '🇨🇳' },
  { id: 'ja', label: '日本語', flag: '🇯🇵' },
  { id: 'it', label: 'Italiano', flag: '🇮🇹' },
  { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { id: 'pl', label: 'Polski', flag: '🇵🇱' },
  { id: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { id: 'nl', label: 'Nederlands', flag: '🇳🇱' },
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
        navigate(`${CLERK_SIGN_IN_URL}?redirect=/onboard`, { replace: true });
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
