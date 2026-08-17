import { useState } from 'react';

import { useLearningStore } from '@/core/learning';

import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
} from '@/shared/constants/engineering-disciplines';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { getDisciplineIcon } from '@/shared/icons/registry';

import { useAuthStore } from '@/features/auth';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import type { TranslationKey } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

/**
 * Per-discipline accent tints so the selection grid feels alive instead of a
 * flat wall of identical grey tiles. Static class strings keep Tailwind
 * compilation intact.
 */
const DISCIPLINE_ACCENTS: Record<EngineeringDiscipline, string> = {
  architecture: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  chemical: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  civil: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  electrical: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500',
  electronics: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  hse: 'bg-lime-500/10 text-lime-600 dark:text-lime-400',
  industrial: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  mechanical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  mechatronics: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
  software: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
};

/**
 * Mandatory first-run selection: the user picks an engineering discipline and
 * an interface language on a single page (no wizard steps) before the app
 * unlocks. Styled after the Clerk palette (indigo/violet) so the first-run
 * experience feels consistent with sign-in.
 */
export const OnboardingPanel = () => {
  const translate = useLocalizationStore((state) => state.translate);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);
  const currentUser = useAuthStore((state) => state.currentUser);

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage>('tr');
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async () => {
    if (!selectedDiscipline || !currentUser) return;
    setIsSaving(true);
    try {
      setLanguage(selectedLanguage);
      LearningProfileRepository.updatePreferences(currentUser.id, {
        discipline: selectedDiscipline,
        professionalTrack: selectedDiscipline as never,
        onboardingCompleted: true,
        interfaceLanguage: selectedLanguage,
      });
      useAuthStore.setState({
        currentUser: {
          ...useAuthStore.getState().currentUser!,
          engineeringDiscipline: selectedDiscipline,
        },
      });
      useLearningStore.getState().resetAll();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-zinc-200/70 animate-in fade-in zoom-in-50 duration-200 dark:bg-zinc-900 dark:ring-zinc-700/60">
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-7 text-white sm:px-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-white/10 blur-sm"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-white/10"
            />
            <h1 className="relative text-xl font-bold sm:text-2xl">
              {translate('onboarding.title')}
            </h1>
            <p className="relative mt-1 max-w-md text-sm text-white/80">
              {translate('onboarding.selectDisciplineDesc')}
            </p>
          </div>

          <div className="grid gap-7 p-6 sm:p-8 md:grid-cols-[1.15fr_1fr]">
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {translate('onboarding.selectDiscipline')}
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {ENGINEERING_DISCIPLINES.map((id) => {
                  const Icon = getDisciplineIcon(id);
                  const meta = DISCIPLINE_META[id];
                  const isSelected = selectedDiscipline === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedDiscipline(id)}
                      aria-pressed={isSelected}
                      className={`flex items-center gap-2.5 rounded-xl p-2.5 text-left transition-all cursor-pointer select-none ring-1 ${
                        isSelected
                          ? 'bg-indigo-500/10 ring-2 ring-indigo-500 shadow-sm'
                          : 'bg-zinc-50 ring-zinc-200 hover:ring-indigo-300 dark:bg-zinc-800/60 dark:ring-zinc-700'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${DISCIPLINE_ACCENTS[id]}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-bold text-foreground">
                          {translate(meta.labelKey as TranslationKey)}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-muted-copy">
                          {translate(meta.descriptionKey as TranslationKey)}
                        </p>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {translate('onboarding.selectLanguageTitle')}
              </h2>
              <p className="mt-1 text-[11px] text-muted-copy">
                {translate('onboarding.selectLanguage')} (
                {translate('onboarding.englishFixedTarget')})
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ...INTERFACE_LANGUAGES.filter((l) => l.available && l.id !== 'en'),
                  {
                    id: 'en' as SupportedInterfaceLanguage,
                    label: 'English',
                    nativeLabel: 'English',
                    available: true,
                    flag: 'EN',
                  },
                ].map((lang) => {
                  const isSelected = selectedLanguage === lang.id;
                  const isEnglish = lang.id === 'en';
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.id as SupportedInterfaceLanguage)}
                      aria-pressed={isSelected}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 transition-all cursor-pointer select-none ring-1 ${
                        isSelected
                          ? 'bg-indigo-500/10 ring-2 ring-indigo-500 shadow-sm'
                          : 'bg-zinc-50 ring-zinc-200 hover:ring-indigo-300 dark:bg-zinc-800/60 dark:ring-zinc-700'
                      }`}
                    >
                      {isEnglish ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          EN
                        </span>
                      ) : (
                        <span className="text-2xl leading-none">{lang.flag}</span>
                      )}
                      <span className="max-w-full truncate text-[11px] font-semibold text-foreground">
                        {lang.nativeLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <button
              type="button"
              onClick={handleFinish}
              disabled={!selectedDiscipline || isSaving}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none cursor-pointer"
            >
              {translate('onboarding.start')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPanel;
