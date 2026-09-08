import { PRODUCT_VERSION } from '@/config/product.config';
import { ArrowLeft, ArrowRight, Check, Globe2, Sparkles } from 'lucide-react';

import { useCallback, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import { getDisciplineIcon } from '@/shared/icons/registry';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { AVAILABLE_INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

const disciplineAccent: Record<EngineeringDiscipline, string> = {
  architecture: 'from-orange-300 to-amber-500',
  chemical: 'from-emerald-300 to-teal-500',
  civil: 'from-yellow-300 to-orange-500',
  electrical: 'from-cyan-300 to-blue-500',
  electronics: 'from-indigo-300 to-violet-500',
  hse: 'from-green-300 to-emerald-500',
  industrial: 'from-slate-300 to-slate-500',
  mechanical: 'from-zinc-300 to-cyan-500',
  mechatronics: 'from-fuchsia-300 to-purple-500',
  software: 'from-sky-300 to-indigo-500',
};

const DisciplineTile = ({ id, selected, onSelect, translate }: { id: EngineeringDiscipline; selected: boolean; onSelect: (id: EngineeringDiscipline) => void; translate: (key: string) => string }) => {
  const meta = DISCIPLINE_META[id];
  const Icon = getDisciplineIcon(id);
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className={cn(
        'group relative flex min-h-[7rem] flex-col justify-between overflow-hidden rounded-3xl border p-3 text-left transition-all',
        selected
          ? 'border-cyan-300 bg-cyan-50 shadow-lg ring-2 ring-cyan-200 dark:border-cyan-200/60 dark:bg-cyan-200/10 dark:ring-cyan-200/20'
          : 'border-slate-200 bg-white/75 hover:border-cyan-200 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-cyan-200/35 dark:hover:bg-white/[0.09]'
      )}
    >
      <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${disciplineAccent[id]} opacity-18 blur-2xl group-hover:opacity-30`} />
      <div className="relative flex items-start justify-between gap-2">
        <span className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${disciplineAccent[id]} text-slate-950 shadow-sm`}>
          <Icon className="h-5 w-5" />
        </span>
        {selected && <span className="grid h-6 w-6 place-items-center rounded-full bg-cyan-600 text-white dark:bg-cyan-200 dark:text-slate-950"><Check className="h-3.5 w-3.5" /></span>}
      </div>
      <div className="relative">
        <h3 className="text-sm font-black leading-tight text-slate-950 dark:text-white">{translate(meta.labelKey)}</h3>
        <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">{translate(meta.descriptionKey)}</p>
      </div>
    </button>
  );
};

const LanguageChip = ({ lang, selected, onSelect }: { lang: (typeof AVAILABLE_INTERFACE_LANGUAGES)[number]; selected: boolean; onSelect: (id: SupportedInterfaceLanguage) => void }) => (
  <button
    type="button"
    onClick={() => onSelect(lang.id)}
    aria-pressed={selected}
    className={cn(
      'flex h-11 items-center gap-2 rounded-2xl border px-3 text-left transition-all',
      selected
        ? 'border-cyan-300 bg-cyan-50 text-cyan-950 ring-2 ring-cyan-200/60 dark:border-cyan-200/50 dark:bg-cyan-200/10 dark:text-white dark:ring-cyan-200/15'
        : 'border-slate-200 bg-white/75 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75 dark:hover:bg-white/[0.09]'
    )}
  >
    <span className="text-base leading-none">{lang.flag}</span>
    <span className="min-w-0 flex-1 truncate text-xs font-black">{lang.nativeLabel}</span>
    {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
  </button>
);

export const NeuralOrbPanel = ({ onComplete }: { onComplete?: () => void } = {}) => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((s) => s.translate);
  const currentLanguage = useLocalizationStore((s) => s.language);
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);
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
  const PreviewIcon = selectedDiscipline ? getDisciplineIcon(selectedDiscipline) : Sparkles;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#f7f9fc] text-slate-950 dark:bg-[#040611] dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_52%,#eef4f8_100%)] dark:bg-[radial-gradient(circle_at_18%_8%,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(168,85,247,0.18),transparent_30%),linear-gradient(180deg,rgba(4,6,17,0.76),rgba(4,6,17,0.98))]" />

      <header className="relative z-10 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/86 px-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#040611]/76 sm:px-6">
        <button type="button" onClick={handleBack} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.07] dark:text-white/70 dark:hover:text-white"><ArrowLeft className="h-4 w-4" />Geri</button>
        <div className="flex items-center gap-2"><img src="/brand/logo.svg" alt="EngVox" className="h-8 w-8 rounded-xl" /><span className="text-xs font-black text-cyan-700 dark:text-cyan-100">v{PRODUCT_VERSION}</span></div>
      </header>

      <main className="relative z-10 h-[calc(100dvh-7rem)] overflow-hidden px-4 py-4 sm:px-6">
        <div className="mx-auto grid h-full max-w-7xl gap-4 lg:grid-cols-[1fr_18rem]">
          <section className="min-h-0 rounded-[2rem] border border-slate-200 bg-white/66 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-800 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100"><Sparkles className="h-3.5 w-3.5" /> Engineering cockpit</span>
                <h1 className="mt-2 text-[clamp(1.7rem,3.4vw,3rem)] font-black leading-none tracking-tight">Mesleğini seç.</h1>
                <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Dersler, kelimeler ve senaryolar seçtiğin mühendislik alanına göre hazırlanır.</p>
              </div>
              <div className="hidden min-w-[15rem] rounded-3xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20 md:block">
                <div className="mb-2 flex items-center gap-2"><Globe2 className="h-4 w-4 text-cyan-700 dark:text-cyan-100" /><h2 className="text-sm font-black">Arayüz dili</h2></div>
                <div className="grid grid-cols-2 gap-2">{languageOptions.slice(0, 8).map((lang) => <LanguageChip key={lang.id} lang={lang} selected={selectedLanguage === lang.id} onSelect={handleSelectLanguage} />)}</div>
              </div>
            </div>
            <div className="grid h-[calc(100%-8.25rem)] min-h-0 grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {ENGINEERING_DISCIPLINES.map((id) => <DisciplineTile key={id} id={id} selected={selectedDiscipline === id} onSelect={setSelectedDiscipline} translate={translate} />)}
            </div>
          </section>

          <aside className="hidden rounded-[2rem] border border-slate-200 bg-white/72 p-5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07] lg:block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-100">Özet</span>
            <div className={`mt-4 grid h-20 w-20 place-items-center rounded-[1.7rem] bg-gradient-to-br ${selectedDiscipline ? disciplineAccent[selectedDiscipline] : 'from-cyan-300 to-fuchsia-300'} text-slate-950 shadow-xl`}><PreviewIcon className="h-9 w-9" /></div>
            <h2 className="mt-4 text-xl font-black leading-tight">{disciplineMeta ? translate(disciplineMeta.labelKey) : 'Mühendislik alanı'}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{disciplineMeta ? translate(disciplineMeta.descriptionKey) : 'Bir alan seçtiğinde içerikler mesleğine göre kişiselleşir.'}</p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20"><p className="text-xs font-bold text-slate-500 dark:text-white/50">Dil</p><p className="mt-1 text-sm font-black">{languageMeta ? `${languageMeta.flag} ${languageMeta.nativeLabel}` : 'Seçilmedi'}</p></div>
          </aside>
        </div>
      </main>

      <footer className="relative z-10 flex h-14 items-center justify-between border-t border-slate-200/80 bg-white/86 px-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#040611]/76 sm:px-6">
        <p className="truncate text-sm font-bold text-slate-600 dark:text-white/55">{disciplineMeta ? translate(disciplineMeta.labelKey) : 'Meslek seç'} · {languageMeta ? languageMeta.nativeLabel : 'Dil seç'}</p>
        <button type="button" onClick={() => void handleEnter()} disabled={!canFinish || isSaving} className={cn('ml-3 inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black transition-all', canFinish ? 'bg-slate-950 text-white hover:-translate-y-0.5 dark:bg-white dark:text-slate-950' : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-white/35')}><span>{isSaving ? translate('common.loading') : translate('common.next')}</span>{!isSaving && <ArrowRight className="h-4 w-4" />}</button>
      </footer>
    </div>
  );
};

export default NeuralOrbPanel;
