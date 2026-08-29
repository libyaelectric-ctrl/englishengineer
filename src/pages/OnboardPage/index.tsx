import { useCallback, useEffect, useMemo, useState } from 'react';

import { ArrowLeft, ArrowRight, Moon, Sun, Wrench, Globe } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { useTheme } from '@/features/theme/ThemeProvider';

/* ── Discipline data (matches beta.helpers.ts) ── */
const DISCIPLINES = [
  { code: 'AR', full: 'Architecture', id: 'architecture' as EngineeringDiscipline, icon: '🏛️' },
  { code: 'CH', full: 'Chemical Eng.', id: 'chemical' as EngineeringDiscipline, icon: '⚗️' },
  { code: 'CI', full: 'Civil Eng.', id: 'civil' as EngineeringDiscipline, icon: '🏗️' },
  { code: 'EL', full: 'Electrical Eng.', id: 'electrical' as EngineeringDiscipline, icon: '⚡' },
  { code: 'EC', full: 'Electronics Eng.', id: 'electronics' as EngineeringDiscipline, icon: '🔌' },
  { code: 'SO', full: 'Software Eng.', id: 'software' as EngineeringDiscipline, icon: '💻' },
  { code: 'MT', full: 'Mechatronics', id: 'mechatronics' as EngineeringDiscipline, icon: '🤖' },
  { code: 'MC', full: 'Mechanical Eng.', id: 'mechanical' as EngineeringDiscipline, icon: '⚙️' },
  { code: 'IN', full: 'Industrial Eng.', id: 'industrial' as EngineeringDiscipline, icon: '🏭' },
  { code: 'HS', full: 'HSE Eng.', id: 'hse' as EngineeringDiscipline, icon: '🛡️' },
];

/* ── Language data ── */
const LANGUAGES = INTERFACE_LANGUAGES.filter((l) => l.available).map((l) => ({
  id: l.id as SupportedInterfaceLanguage,
  label: l.label,
  nativeLabel: l.nativeLabel,
  flag: l.flag,
}));

/* ── i18n strings ── */
const STRINGS = {
  en: {
    title: 'Choose Your Path',
    subtitle: 'Select your engineering discipline and preferred language',
    professions: 'Professions',
    languages: 'Languages',
    back: 'Back',
    enter: 'Enter EngVox',
    selectProfession: 'Select a profession',
    selectLanguage: 'Select a language',
    required: 'Please select both a profession and a language',
  },
  tr: {
    title: 'Yolunu Seç',
    subtitle: 'Mühendislik alanını ve tercih ettiğin dili seç',
    professions: 'Meslekler',
    languages: 'Diller',
    back: 'Geri',
    enter: 'EngVox\'a Gir',
    selectProfession: 'Bir meslek seç',
    selectLanguage: 'Bir dil seç',
    required: 'Hem meslek hem dil seçimi gerekli',
  },
  ar: {
    title: 'اختر مسارك',
    subtitle: 'اختر تخصصك الهندسي واللغة المفضلة',
    professions: 'المهن',
    languages: 'اللغات',
    back: 'رجوع',
    enter: 'ادخل EngVox',
    selectProfession: 'اختر مهنة',
    selectLanguage: 'اختر لغة',
    required: 'يرجى اختيار المهنة واللغة',
  },
  de: {
    title: 'Wähle deinen Weg',
    subtitle: 'Wähle deine Ingenieursrichtung und bevorzugte Sprache',
    professions: 'Berufe',
    languages: 'Sprachen',
    back: 'Zurück',
    enter: 'EngVox betreten',
    selectProfession: 'Beruf wählen',
    selectLanguage: 'Sprache wählen',
    required: 'Bitte wähle Beruf und Sprache',
  },
  es: {
    title: 'Elige tu camino',
    subtitle: 'Selecciona tu disciplina de ingeniería e idioma preferido',
    professions: 'Profesiones',
    languages: 'Idiomas',
    back: 'Volver',
    enter: 'Entrar a EngVox',
    selectProfession: 'Seleccionar profesión',
    selectLanguage: 'Seleccionar idioma',
    required: 'Selecciona profesión e idioma',
  },
  fr: {
    title: 'Choisis ton chemin',
    subtitle: 'Sélectionne ta discipline d\'ingénierie et ta langue préférée',
    professions: 'Métiers',
    languages: 'Langues',
    back: 'Retour',
    enter: 'Entrer dans EngVox',
    selectProfession: 'Choisir un métier',
    selectLanguage: 'Choisir une langue',
    required: 'Sélectionne métier et langue',
  },
  pt: {
    title: 'Escolha seu caminho',
    subtitle: 'Selecione sua disciplina de engenharia e idioma preferido',
    professions: 'Profissões',
    languages: 'Idiomas',
    back: 'Voltar',
    enter: 'Entrar no EngVox',
    selectProfession: 'Selecionar profissão',
    selectLanguage: 'Selecionar idioma',
    required: 'Selecione profissão e idioma',
  },
  ru: {
    title: 'Выбери свой путь',
    subtitle: 'Выбери свою инженерную специальность и язык',
    professions: 'Профессии',
    languages: 'Языки',
    back: 'Назад',
    enter: 'Войти в EngVox',
    selectProfession: 'Выбрать профессию',
    selectLanguage: 'Выбрать язык',
    required: 'Выберите профессию и язык',
  },
  zh: {
    title: '选择你的道路',
    subtitle: '选择你的工程专业和首选语言',
    professions: '专业',
    languages: '语言',
    back: '返回',
    enter: '进入 EngVox',
    selectProfession: '选择专业',
    selectLanguage: '选择语言',
    required: '请选择专业和语言',
  },
  ja: {
    title: 'パスを選択',
    subtitle: '工学分野と言語を選んでください',
    professions: '職業',
    languages: '言語',
    back: '戻る',
    enter: 'EngVoxに入る',
    selectProfession: '職業を選択',
    selectLanguage: '言語を選択',
    required: '職業と言語を選択してください',
  },
  it: {
    title: 'Scegli il tuo percorso',
    subtitle: 'Seleziona la tua disciplina e lingua preferita',
    professions: 'Professioni',
    languages: 'Lingue',
    back: 'Indietro',
    enter: 'Entra in EngVox',
    selectProfession: 'Seleziona professione',
    selectLanguage: 'Seleziona lingua',
    required: 'Seleziona professione e lingua',
  },
  vi: {
    title: 'Chọn con đường của bạn',
    subtitle: 'Chọn ngành kỹ thuật và ngôn ngữ ưa thích',
    professions: 'Nghề nghiệp',
    languages: 'Ngôn ngữ',
    back: 'Quay lại',
    enter: 'Vào EngVox',
    selectProfession: 'Chọn nghề',
    selectLanguage: 'Chọn ngôn ngữ',
    required: 'Vui lòng chọn nghề và ngôn ngữ',
  },
  pl: {
    title: 'Wybierz swoją drogę',
    subtitle: 'Wybierz swoją dyscyplinę i preferowany język',
    professions: 'Zawody',
    languages: 'Języki',
    back: 'Wstecz',
    enter: 'Wejdź do EngVox',
    selectProfession: 'Wybierz zawód',
    selectLanguage: 'Wybierz język',
    required: 'Wybierz zawód i język',
  },
  id: {
    title: 'Pilih Jalurmu',
    subtitle: 'Pilih disiplin teknik dan bahasa pilihanmu',
    professions: 'Profesi',
    languages: 'Bahasa',
    back: 'Kembali',
    enter: 'Masuk EngVox',
    selectProfession: 'Pilih profesi',
    selectLanguage: 'Pilih bahasa',
    required: 'Pilih profesi dan bahasa',
  },
  nl: {
    title: 'Kies je pad',
    subtitle: 'Kies je ingenieursdiscipline en voorkeurstaal',
    professions: 'Beroepen',
    languages: 'Talen',
    back: 'Terug',
    enter: 'Begin bij EngVox',
    selectProfession: 'Kies beroep',
    selectLanguage: 'Kies taal',
    required: 'Kies beroep en taal',
  },
} as const;

type StrKey = keyof typeof STRINGS;

/* ── Single card ── */
const SelectionCard = ({
  selected,
  onClick,
  icon,
  label,
  sublabel,
  isDark,
  delay,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  sublabel?: string;
  isDark: boolean;
  delay: number;
}) => (
  <button
    onClick={onClick}
    className={`group relative w-full text-left rounded-xl border p-3.5 transition-all duration-300 cursor-pointer
      ${selected
        ? isDark
          ? 'border-cyan-400/60 bg-cyan-950/50 shadow-[0_0_24px_rgba(34,211,238,0.15)]'
          : 'border-cyan-500/50 bg-cyan-50/80 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
        : isDark
          ? 'border-white/8 bg-white/[0.03] hover:border-cyan-400/30 hover:bg-cyan-950/20'
          : 'border-gray-200 bg-white/60 hover:border-cyan-300/50 hover:bg-cyan-50/40'
      }
      backdrop-blur-sm`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-3">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-semibold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {label}
        </div>
        {sublabel && (
          <div className={`text-xs mt-0.5 truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {sublabel}
          </div>
        )}
      </div>
      {selected && (
        <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 animate-pulse" />
      )}
    </div>
  </button>
);

/* ── Main page ── */
const OnboardPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);
  const language = useLocalizationStore((s) => s.language);

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── i18n ── */
  const t = useMemo(() => {
    const key = (language || 'en') as StrKey;
    return STRINGS[key] ?? STRINGS.en;
  }, [language]);

  /* ── Handle save + enter ── */
  const handleEnter = useCallback(async () => {
    if (!selectedDiscipline || !selectedLanguage) {
      setError(t.required);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      /* Set interface language */
      setLanguage(selectedLanguage);

      /* Save profile */
      const userId = currentUser?.id || 'local-user';
      const existing = LearningProfileRepository.getProfile(userId);
      LearningProfileRepository.saveProfile({
        ...existing,
        discipline: selectedDiscipline,
        interfaceLanguage: selectedLanguage,
        onboardingCompleted: true,
      });

      /* Set auth store */
      useAuthStore.setState((state) => ({
        currentUser: state.currentUser
          ? { ...state.currentUser, engineeringDiscipline: selectedDiscipline }
          : state.currentUser,
      }));

      /* Navigate to dashboard */
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSaving(false);
    }
  }, [selectedDiscipline, selectedLanguage, setLanguage, currentUser, navigate, t]);

  /* ── Handle back ── */
  const handleBack = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  /* ── Keyboard ── */
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
      {/* ── Ambient glow (APEX-UI style) ── */}
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
        {isDark && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-8 bg-cyan-500"
          />
        )}
      </div>

      {/* ── Header ── */}
      <header
        className={`relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b backdrop-blur-md ${
          isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-200/60 bg-white/50'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/brand/logo.svg" alt="EngVox" className="h-7 w-7" />
          <span className={`text-sm font-bold tracking-wide ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
            EngVox
          </span>
        </div>

        {/* Back + Theme toggle */}
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
            {t.back}
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

      {/* ── Main content ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8">
        {/* Title */}
        <div className={`text-center mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.title}
          </h1>
          <p className={`mt-3 text-sm max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.subtitle}
          </p>
        </div>

        {/* Two-column grid */}
        <div className={`w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* ── LEFT: Professions ── */}
          <div>
            <div className={`flex items-center gap-2 mb-4 px-1`}>
              <Wrench className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.professions}
              </h2>
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
                isDark ? 'bg-cyan-950 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
              }`}>
                {DISCIPLINES.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {DISCIPLINES.map((d, i) => (
                <SelectionCard
                  key={d.id}
                  selected={selectedDiscipline === d.id}
                  onClick={() => {
                    setSelectedDiscipline(d.id);
                    setError(null);
                  }}
                  icon={d.icon}
                  label={d.full}
                  sublabel={d.code}
                  isDark={isDark}
                  delay={i * 40}
                />
              ))}
            </div>
          </div>

          {/* ── RIGHT: Languages ── */}
          <div>
            <div className={`flex items-center gap-2 mb-4 px-1`}>
              <Globe className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.languages}
              </h2>
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
                isDark ? 'bg-blue-950 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                {LANGUAGES.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {LANGUAGES.map((l, i) => (
                <SelectionCard
                  key={l.id}
                  selected={selectedLanguage === l.id}
                  onClick={() => {
                    setSelectedLanguage(l.id);
                    setError(null);
                  }}
                  icon={l.flag}
                  label={l.nativeLabel}
                  sublabel={l.label}
                  isDark={isDark}
                  delay={i * 40}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className={`mt-4 px-4 py-2 rounded-lg text-xs font-medium ${
            isDark ? 'bg-red-950/50 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {error}
          </div>
        )}
      </main>

      {/* ── Footer / Enter button ── */}
      <footer
        className={`relative z-10 flex items-center justify-center px-4 sm:px-8 py-5 border-t backdrop-blur-md ${
          isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-200/60 bg-white/50'
        }`}
      >
        <button
          onClick={handleEnter}
          disabled={!selectedDiscipline || !selectedLanguage || isSaving}
          className={`flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300
            ${
              selectedDiscipline && selectedLanguage
                ? isDark
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:shadow-[0_0_40px_rgba(34,211,238,0.35)] hover:scale-105'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : isDark
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }
          `}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {t.enter}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </footer>

      {/* ── Floating selection summary (APEX-UI HUD style) ── */}
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
