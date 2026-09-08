import { PRODUCT_VERSION } from '@/config/product.config';
import { ArrowLeft, ArrowRight, Check, Moon, Sun } from 'lucide-react';

import { useCallback, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { AVAILABLE_INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { useTheme } from '@/features/theme/ThemeProvider';

type ChoiceButtonProps = {
  selected: boolean;
  primary: string;
  secondary?: string;
  onClick: () => void;
};

const ChoiceButton = ({ selected, primary, secondary, onClick }: ChoiceButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      'flex h-[4.7rem] w-full items-center justify-between gap-3 rounded-2xl border px-4 text-left transition-all',
      selected
        ? 'border-cyan-400 bg-cyan-50 text-slate-950 ring-2 ring-cyan-200 dark:border-cyan-200 dark:bg-cyan-200/12 dark:text-white dark:ring-cyan-200/20'
        : 'border-slate-200 bg-white text-slate-850 hover:border-cyan-300 hover:bg-cyan-50/45 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/85 dark:hover:border-cyan-200/35 dark:hover:bg-white/[0.09]'
    )}
  >
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-black leading-tight text-slate-950 dark:text-white">{primary}</span>
      {secondary && <span className="mt-1 block truncate text-xs font-semibold text-slate-500 dark:text-white/50">{secondary}</span>}
    </span>
    <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border', selected ? 'border-cyan-500 bg-cyan-500 text-white dark:border-cyan-200 dark:bg-cyan-200 dark:text-slate-950' : 'border-slate-300 text-transparent dark:border-white/20')}>
      <Check className="h-3.5 w-3.5" />
    </span>
  </button>
);

export const NeuralOrbPanel = ({ onComplete }: { onComplete?: () => void } = {}) => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((s) => s.translate);
  const currentLanguage = useLocalizationStore((s) => s.language);
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { theme, toggleTheme } = useTheme();
  const languageOptions = useMemo(() => AVAILABLE_INTERFACE_LANGUAGES.filter((lang) => lang.id !== 'en'), []);
  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage | null>(currentLanguage !== 'en' ? currentLanguage : null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectLanguage = (id: SupportedInterfaceLanguage) => { setSelectedLanguage(id); setLanguage(id); };
  const canFinish = Boolean(selectedDiscipline && selectedLanguage && currentUser);
  const handleBack = () => navigate('/');

  const handleEnter = useCallback(async () => {
    if (!selectedDiscipline || !selectedLanguage || !currentUser || isSaving) return;
    setIsSaving(true);
    try {
      LearningProfileRepository.updatePreferences(currentUser.id, { discipline: selectedDiscipline, professionalTrack: selectedDiscipline as never, onboardingCompleted: true, interfaceLanguage: selectedLanguage });
      useAuthStore.setState({ currentUser: { ...useAuthStore.getState().currentUser!, engineeringDiscipline: selectedDiscipline } });
      useLearningStore.getState().resetAll();
      if (onComplete) onComplete();
      else navigate('/dashboard', { replace: true });
    } finally { setIsSaving(false); }
  }, [selectedDiscipline, selectedLanguage, currentUser, isSaving, onComplete, navigate]);

  const disciplineMeta = selectedDiscipline ? DISCIPLINE_META[selectedDiscipline] : null;
  const languageMeta = selectedLanguage ? languageOptions.find((l) => l.id === selectedLanguage) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#f7f9fc] text-slate-950 dark:bg-[#040611] dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_52%,#eef4f8_100%)] dark:bg-[linear-gradient(180deg,#040611_0%,#070b18_54%,#040611_100%)]" />
      <header className="relative z-10 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#040611]/82 sm:px-6">
        <button type="button" onClick={handleBack} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.07] dark:text-white/70 dark:hover:text-white"><ArrowLeft className="h-4 w-4" />Geri</button>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.08] dark:text-white" aria-label="Tema değiştir">{theme === 'dark' ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-cyan-700" />}</button>
          <img src="/brand/logo.svg" alt="EngVox" className="h-8 w-8 rounded-xl" />
          <span className="text-xs font-black text-cyan-700 dark:text-cyan-100">v{PRODUCT_VERSION}</span>
        </div>
      </header>
      <main className="relative z-10 h-[calc(100dvh-7rem)] overflow-hidden px-4 py-4 sm:px-6">
        <div className="mx-auto flex h-full max-w-7xl flex-col rounded-[2rem] border border-slate-200 bg-white/82 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
          <div className="mb-4 shrink-0 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-100">Başlangıç ayarları</p>
            <h1 className="mt-2 text-[clamp(1.75rem,3.1vw,3rem)] font-black leading-none tracking-tight text-slate-950 dark:text-white">Meslek ve dili seç</h1>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-white/55">İki seçim de aynı formatta. Tek ekranda, sembolsüz ve net.</p>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="min-h-0 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-black/18">
              <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-slate-950 dark:text-white">Meslekler</h2><span className="text-xs font-bold text-slate-500 dark:text-white/45">{disciplineMeta ? translate(disciplineMeta.labelKey) : 'Seçilmedi'}</span></div>
              <div className="grid h-[calc(100%-2.1rem)] grid-cols-2 gap-2 xl:grid-cols-2">
                {ENGINEERING_DISCIPLINES.map((id) => {
                  const meta = DISCIPLINE_META[id];
                  return <ChoiceButton key={id} selected={selectedDiscipline === id} primary={translate(meta.labelKey)} secondary={translate(meta.descriptionKey)} onClick={() => setSelectedDiscipline(id)} />;
                })}
              </div>
            </section>
            <section className="min-h-0 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-black/18">
              <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-slate-950 dark:text-white">Diller</h2><span className="text-xs font-bold text-slate-500 dark:text-white/45">{languageMeta ? languageMeta.nativeLabel : 'Seçilmedi'}</span></div>
              <div className="grid h-[calc(100%-2.1rem)] grid-cols-2 gap-2 xl:grid-cols-2">
                {languageOptions.slice(0, 10).map((lang) => <ChoiceButton key={lang.id} selected={selectedLanguage === lang.id} primary={`${lang.flag} ${lang.nativeLabel}`} secondary={lang.label} onClick={() => handleSelectLanguage(lang.id)} />)}
              </div>
            </section>
          </div>
        </div>
      </main>
      <footer className="relative z-10 flex h-14 items-center justify-between border-t border-slate-200/80 bg-white/90 px-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#040611]/82 sm:px-6">
        <p className="truncate text-sm font-bold text-slate-600 dark:text-white/55">{disciplineMeta ? translate(disciplineMeta.labelKey) : 'Meslek seç'} · {languageMeta ? languageMeta.nativeLabel : 'Dil seç'}</p>
        <button type="button" onClick={() => void handleEnter()} disabled={!canFinish || isSaving} className={cn('ml-3 inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black transition-all', canFinish ? 'bg-slate-950 text-white hover:-translate-y-0.5 dark:bg-white dark:text-slate-950' : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-white/35')}><span>{isSaving ? translate('common.loading') : 'İleri'}</span>{!isSaving && <ArrowRight className="h-4 w-4" />}</button>
      </footer>
    </div>
  );
};

export default NeuralOrbPanel;
