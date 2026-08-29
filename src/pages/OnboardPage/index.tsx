import { useCallback, useEffect, useState } from 'react';

import { ArrowLeft, ArrowRight, Moon, Sun, Wrench, Globe } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { useTheme } from '@/features/theme/ThemeProvider';
import { useLocalizationStore } from '@/features/localization';
import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { useLearningStore } from '@/core/learning';
import { storage } from '@/shared/storage';
import { CLERK_SIGN_IN_URL } from '@/features/auth/clerk.config';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

/* ------------------------------------------------------------------ */
/* Discipline / Language data                                         */
/* ------------------------------------------------------------------ */
const DISCIPLINES = [
  { id: 'architecture' as EngineeringDiscipline, full: 'Architecture', icon: '🏛️' },
  { id: 'chemical' as EngineeringDiscipline, full: 'Chemical Eng.', icon: '⚗️' },
  { id: 'civil' as EngineeringDiscipline, full: 'Civil Eng.', icon: '🏗️' },
  { id: 'electrical' as EngineeringDiscipline, full: 'Electrical Eng.', icon: '⚡' },
  { id: 'electronics' as EngineeringDiscipline, full: 'Electronics Eng.', icon: '🔌' },
  { id: 'software' as EngineeringDiscipline, full: 'Software Eng.', icon: '💻' },
  { id: 'mechatronics' as EngineeringDiscipline, full: 'Mechatronics', icon: '🤖' },
  { id: 'mechanical' as EngineeringDiscipline, full: 'Mechanical Eng.', icon: '⚙️' },
  { id: 'industrial' as EngineeringDiscipline, full: 'Industrial Eng.', icon: '🏭' },
  { id: 'hse' as EngineeringDiscipline, full: 'HSE Eng.', icon: '🛡️' },
];

const LANGUAGES = [
  { id: 'en' as SupportedInterfaceLanguage, label: 'English', flag: '🇬🇧' },
  { id: 'tr' as SupportedInterfaceLanguage, label: 'Türkçe', flag: '🇹🇷' },
  { id: 'ar' as SupportedInterfaceLanguage, label: 'العربية', flag: '🇸🇦' },
  { id: 'de' as SupportedInterfaceLanguage, label: 'Deutsch', flag: '🇩🇪' },
  { id: 'es' as SupportedInterfaceLanguage, label: 'Español', flag: '🇪🇸' },
  { id: 'fr' as SupportedInterfaceLanguage, label: 'Français', flag: '🇫🇷' },
  { id: 'pt' as SupportedInterfaceLanguage, label: 'Português', flag: '🇧🇷' },
  { id: 'ru' as SupportedInterfaceLanguage, label: 'Русский', flag: '🇷🇺' },
  { id: 'zh' as SupportedInterfaceLanguage, label: '中文', flag: '🇨🇳' },
  { id: 'ja' as SupportedInterfaceLanguage, label: '日本語', flag: '🇯🇵' },
  { id: 'it' as SupportedInterfaceLanguage, label: 'Italiano', flag: '🇮🇹' },
  { id: 'vi' as SupportedInterfaceLanguage, label: 'Tiếng Việt', flag: '🇻🇳' },
  { id: 'pl' as SupportedInterfaceLanguage, label: 'Polski', flag: '🇵🇱' },
  { id: 'id' as SupportedInterfaceLanguage, label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { id: 'nl' as SupportedInterfaceLanguage, label: 'Nederlands', flag: '🇳🇱' },
];

/* ------------------------------------------------------------------ */
/* Pending onboard helper (global, survives auth redirect)            */
/* ------------------------------------------------------------------ */
const PENDING_ONBOARD_KEY = 'engvox-pending-onboard';
interface PendingOnboard {
  discipline: EngineeringDiscipline;
  language: SupportedInterfaceLanguage;
}

function savePendingOnboard(discipline: EngineeringDiscipline, language: SupportedInterfaceLanguage) {
  storage.globalSet(PENDING_ONBOARD_KEY, { discipline, language } satisfies PendingOnboard);
}

export function consumePendingOnboard(): PendingOnboard | null {
  const data = storage.globalGet<PendingOnboard>(PENDING_ONBOARD_KEY);
  if (data) storage.globalRemove(PENDING_ONBOARD_KEY);
  return data;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const OnboardPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage | null>(null);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEnter = useCallback(async () => {
    if (!selectedDiscipline || !selectedLanguage || saving) return;
    setSaving(true);
    try {
      if (currentUser) {
        /* ---- Authenticated: save directly to profile repo ---- */
        setLanguage(selectedLanguage);
        LearningProfileRepository.updatePreferences(currentUser.id, {
          discipline: selectedDiscipline,
          professionalTrack: selectedDiscipline as never,
          interfaceLanguage: selectedLanguage,
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
        /* ---- Not authenticated: save pending + go to sign-in ---- */
        savePendingOnboard(selectedDiscipline, selectedLanguage);
        navigate(`${CLERK_SIGN_IN_URL}?redirect=/onboard`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  }, [selectedDiscipline, selectedLanguage, saving, currentUser, setLanguage, navigate]);

  const handleBack = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleBack();
      if (e.key === 'Enter' && selectedDiscipline && selectedLanguage) {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleBack, handleEnter, selectedDiscipline, selectedLanguage]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark
          ? 'bg-[#04080f] text-gray-100'
          : 'bg-gradient-to-br from-gray-50 via-white to-cyan-50 text-gray-900'
      }`}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-20 ${
            isDark ? 'bg-cyan-600' : 'bg-cyan-300'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-15 ${
            isDark ? 'bg-blue-600' : 'bg-blue-300'
          }`}
        />
      </div>

      {/* Header */}
      <header
        className={`relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b backdrop-blur-md ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200/60 bg-white/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <img src="/brand/logo.svg" alt="EngVox" className="h-7 w-7" />
          <span className={`text-sm font-bold tracking-wide ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
            EngVox
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isDark
                ? 'border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 bg-white/[0.03]'
                : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-white/60'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all border ${
              isDark
                ? 'border-white/10 text-gray-400 hover:text-yellow-400 hover:border-yellow-400/30 bg-white/[0.03]'
                : 'border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 bg-white/60'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8">
        <div className={`text-center mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Choose Your Path
          </h1>
          <p className={`mt-3 text-sm max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Select your engineering discipline and preferred language
          </p>
        </div>

        <div className={`w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* LEFT: Professions */}
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Wrench className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Professions
              </h2>
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? 'bg-cyan-950 text-cyan-400' : 'bg-cyan-100 text-cyan-600'}`}>
                {DISCIPLINES.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {DISCIPLINES.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDiscipline(d.id)}
                  className={`group relative w-full text-left rounded-xl border p-3.5 transition-all duration-300 cursor-pointer
                    ${selectedDiscipline === d.id
                      ? isDark
                        ? 'border-cyan-400/60 bg-cyan-950/50 shadow-[0_0_24px_rgba(34,211,238,0.15)]'
                        : 'border-cyan-500/50 bg-cyan-50/80 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                      : isDark
                        ? 'border-white/8 bg-white/[0.03] hover:border-cyan-400/30 hover:bg-cyan-950/20'
                        : 'border-gray-200 bg-white/60 hover:border-cyan-300/50 hover:bg-cyan-50/40'
                    }
                    backdrop-blur-sm`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{d.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-semibold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {d.full}
                      </div>
                    </div>
                    {selectedDiscipline === d.id && (
                      <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Languages */}
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Globe className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Languages
              </h2>
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? 'bg-blue-950 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                {LANGUAGES.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {LANGUAGES.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLanguage(l.id)}
                  className={`group relative w-full text-left rounded-xl border p-3.5 transition-all duration-300 cursor-pointer
                    ${selectedLanguage === l.id
                      ? isDark
                        ? 'border-blue-400/60 bg-blue-950/50 shadow-[0_0_24px_rgba(96,165,250,0.15)]'
                        : 'border-blue-500/50 bg-blue-50/80 shadow-[0_0_20px_rgba(96,165,250,0.12)]'
                      : isDark
                        ? 'border-white/8 bg-white/[0.03] hover:border-blue-400/30 hover:bg-blue-950/20'
                        : 'border-gray-200 bg-white/60 hover:border-blue-300/50 hover:bg-blue-50/40'
                    }
                    backdrop-blur-sm`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{l.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-semibold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {l.label}
                      </div>
                    </div>
                    {selectedLanguage === l.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Enter */}
      <footer
        className={`relative z-10 flex items-center justify-center px-4 sm:px-8 py-5 border-t backdrop-blur-md ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200/60 bg-white/50'
        }`}
      >
        <button
          onClick={handleEnter}
          disabled={!selectedDiscipline || !selectedLanguage || saving}
          className={`flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300
            ${
              selectedDiscipline && selectedLanguage && !saving
                ? isDark
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:shadow-[0_0_40px_rgba(34,211,238,0.35)] hover:scale-105'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : isDark
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }
          `}
        >
          {saving ? 'Loading...' : 'Enter EngVox'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>

      {/* Floating selection summary */}
      {(selectedDiscipline || selectedLanguage) && (
        <div
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-5 py-2.5 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
            isDark
              ? 'border-white/10 bg-white/[0.04] text-gray-300'
              : 'border-gray-200/60 bg-white/70 text-gray-600'
          }`}
        >
          {selectedDiscipline && (
            <span className="flex items-center gap-2 text-xs">
              <span className="text-lg">{DISCIPLINES.find((d) => d.id === selectedDiscipline)?.icon}</span>
              <span className="font-medium">{DISCIPLINES.find((d) => d.id === selectedDiscipline)?.full}</span>
            </span>
          )}
          {selectedDiscipline && selectedLanguage && (
            <span className={`w-px h-4 ${isDark ? 'bg-white/15' : 'bg-gray-300'}`} />
          )}
          {selectedLanguage && (
            <span className="flex items-center gap-2 text-xs">
              <span className="text-lg">{LANGUAGES.find((l) => l.id === selectedLanguage)?.flag}</span>
              <span className="font-medium">{LANGUAGES.find((l) => l.id === selectedLanguage)?.label}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default OnboardPage;
