import { PRODUCT_VERSION } from '@/config/product.config';
import { ArrowLeft, ArrowRight, Check, Globe2, Sparkles, Zap } from 'lucide-react';

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

interface DisciplineCardProps {
  id: EngineeringDiscipline;
  isSelected: boolean;
  onSelect: (id: EngineeringDiscipline) => void;
  translate: (key: string) => string;
}

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

const DisciplineCard = ({ id, isSelected, onSelect, translate }: DisciplineCardProps) => {
  const meta = DISCIPLINE_META[id];
  const Icon = getDisciplineIcon(id);
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={isSelected}
      className={cn(
        'group relative min-h-[9.25rem] overflow-hidden rounded-[1.6rem] border p-4 text-left shadow-sm backdrop-blur-2xl transition-all duration-300',
        isSelected
          ? 'border-cyan-400/70 bg-white/86 shadow-2xl shadow-cyan-500/15 ring-2 ring-cyan-300/40 dark:border-cyan-200/70 dark:bg-white/[0.13]'
          : 'border-slate-200 bg-white/66 hover:-translate-y-1 hover:border-cyan-300/70 hover:bg-white/86 dark:border-white/10 dark:bg-white/[0.065] dark:hover:border-cyan-200/45 dark:hover:bg-white/[0.1]'
      )}
    >
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${disciplineAccent[id]} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${disciplineAccent[id]} text-[#06101f] shadow-xl`}>
            <Icon className="h-6 w-6" />
          </div>
          {isSelected && <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-500 text-white dark:bg-cyan-200 dark:text-slate-950"><Check className="h-4 w-4" /></span>}
        </div>
        <div>
          <h3 className="text-base font-black leading-tight text-slate-950 dark:text-white">{translate(meta.labelKey)}</h3>
          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">{translate(meta.descriptionKey)}</p>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-100">{meta.wordCount.toLocaleString()} words</p>
        </div>
      </div>
    </button>
  );
};

const LanguageCard = ({ lang, isSelected, onSelect }: { lang: (typeof AVAILABLE_INTERFACE_LANGUAGES)[number]; isSelected: boolean; onSelect: (id: SupportedInterfaceLanguage) => void }) => (
  <button
    type="button"
    onClick={() => onSelect(lang.id)}
    aria-pressed={isSelected}
    className={cn(
      'flex items-center gap-3 rounded-2xl border p-3 text-left shadow-sm backdrop-blur-xl transition-all',
      isSelected
        ? 'border-cyan-400/70 bg-cyan-50 text-cyan-950 ring-2 ring-cyan-300/30 dark:border-cyan-200/60 dark:bg-cyan-200/12 dark:text-white'
        : 'border-slate-200 bg-white/62 text-slate-800 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.1]'
    )}
  >
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-sm dark:bg-black/20">{lang.flag}</span>
    <span className="min-w-0 flex-1"><span className="block text-sm font-black leading-tight">{lang.nativeLabel}</span><span className="block truncate text-xs font-semibold opacity-65">{lang.label}</span></span>
    {isSelected && <Check className="h-4 w-4 shrink-0" />}
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
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_48%,#eef4f8_100%)] dark:bg-[radial-gradient(circle_at_18%_8%,rgba(6,182,212,0.24),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(168,85,247,0.24),transparent_30%),linear-gradient(180deg,rgba(4,6,17,0.72),rgba(4,6,17,0.98))]" />
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/82 px-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#040611]/72 sm:px-6">
        <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/[0.07] dark:text-white/70 dark:hover:text-white"><ArrowLeft className="h-4 w-4" />{translate('common.back')}</button>
        <div className="flex items-center gap-2"><img src="/brand/logo.svg" alt="EngVox" className="h-9 w-9 rounded-xl" /><span className="text-xs font-black text-cyan-700 dark:text-cyan-100">v{PRODUCT_VERSION}</span></div>
      </header>

      <main className="relative z-10 h-[calc(100dvh-8rem)] overflow-hidden px-4 py-4 sm:px-6">
        <div className="mx-auto grid h-full max-w-7xl gap-4 lg:grid-cols-[1fr_20rem]">
          <section className="min-h-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/58 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div><span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-800 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100"><Sparkles className="h-3.5 w-3.5" /> Engineering cockpit</span><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Mesleğini seç, EngVox ona göre şekillensin.</h1><p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">Düz liste yok: her mühendislik alanı kendi kelime dünyası, senaryosu ve çalışma akışıyla gelir.</p></div>
            </div>
            <div className="grid h-[calc(100%-7.8rem)] min-h-0 grid-cols-1 gap-4 lg:grid-cols-[1fr_17rem]">
              <div className="min-h-0 overflow-y-auto pr-1"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{ENGINEERING_DISCIPLINES.map((id) => <DisciplineCard key={id} id={id} isSelected={selectedDiscipline === id} onSelect={setSelectedDiscipline} translate={translate} />)}</div></div>
              <div className="min-h-0 overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-white/66 p-3 dark:border-white/10 dark:bg-black/20"><div className="mb-3 flex items-center gap-2"><Globe2 className="h-4 w-4 text-cyan-700 dark:text-cyan-100" /><h2 className="text-sm font-black">Arayüz dili</h2></div><div className="space-y-2">{languageOptions.map((lang) => <LanguageCard key={lang.id} lang={lang} isSelected={selectedLanguage === lang.id} onSelect={handleSelectLanguage} />)}</div></div>
            </div>
          </section>

          <aside className="hidden min-h-0 rounded-[2rem] border border-slate-200 bg-white/70 p-5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07] lg:flex lg:flex-col">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative"><span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-100">Seçim özeti</span><div className={`mt-5 grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br ${selectedDiscipline ? disciplineAccent[selectedDiscipline] : 'from-cyan-300 to-fuchsia-300'} text-slate-950 shadow-2xl`}><PreviewIcon className="h-11 w-11" /></div><h2 className="mt-5 text-2xl font-black leading-tight">{disciplineMeta ? translate(disciplineMeta.labelKey) : 'Mühendislik alanı'}</h2><p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{disciplineMeta ? translate(disciplineMeta.descriptionKey) : 'Alanını seçtiğinde dersler, kelimeler ve senaryolar mesleğine göre kişiselleşir.'}</p>{disciplineMeta && <p className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">{disciplineMeta.wordCount.toLocaleString()} mesleki kelime</p>}<div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20"><p className="text-xs font-bold text-slate-500 dark:text-white/50">Dil</p><p className="mt-1 text-sm font-black">{languageMeta ? `${languageMeta.flag} ${languageMeta.nativeLabel}` : 'Henüz seçilmedi'}</p></div></div>
          </aside>
        </div>
      </main>

      <footer className="relative z-10 flex h-16 shrink-0 items-center justify-between border-t border-slate-200/80 bg-white/82 px-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#040611]/72 sm:px-6">
        <p className="hidden text-sm font-bold text-slate-600 dark:text-white/55 sm:block">{disciplineMeta ? translate(disciplineMeta.labelKey) : '1. Meslek'} · {languageMeta ? languageMeta.nativeLabel : '2. Dil'}</p>
        <button type="button" onClick={() => void handleEnter()} disabled={!canFinish || isSaving} className={cn('ml-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black transition-all', canFinish ? 'bg-slate-950 text-white hover:-translate-y-0.5 dark:bg-white dark:text-slate-950' : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-white/35')}><span>{isSaving ? translate('common.loading') : translate('common.next')}</span>{!isSaving && <ArrowRight className="h-4 w-4" />}</button>
      </footer>
    </div>
  );
};

export default NeuralOrbPanel;
