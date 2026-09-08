import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

export interface LandingTranslations {
  heroBadge: string;
  heroTitle1: string;
  heroTitleHighlight: string;
  heroTitle2: string;
  heroSubtitle: string;
  ctaSelectBranch: string;
  ctaTryDemo: string;
  ctaViewPlans: string;
  badgeNoCard: string;
  badgeLanguages: string;
  slideHero: string;
  slideDisciplines: string;
  slideHowItWorks: string;
  slideFeatures: string;
  carouselPause: string;
  carouselPlay: string;
  disciplinesTitle: string;
  featuresHeaderBadge: string;
  featuresTitle: string;
  featuresSubtitle: string;
  featureDescription: string;
  cockpitLabel: string;
  cockpitTitle: string;
  cockpitStatus: string;
  metricCoach: string;
  metricCefr: string;
  metricMode: string;
  skillMap: string;
  disciplinesBadge: string;
  placementTest: string;
  learningHub: string;
  progress: string;
  vocabularyPricing: string;
  grammarPricing: string;
  translator: string;
  readingPricing: string;
  writingPricing: string;
  speakingPricing: string;
  listening: string;
  tool: string;
  aiCopilot: string;
}

const EN: LandingTranslations = {
  heroBadge: 'AI English built for engineers',
  heroTitle1: 'Speak the language of',
  heroTitleHighlight: 'modern engineering',
  heroTitle2: 'with confidence',
  heroSubtitle:
    'Practice real engineering conversations, technical vocabulary, reports, meetings, and interviews with an AI coach that adapts to your field.',
  ctaSelectBranch: 'Choose your engineering field',
  ctaTryDemo: 'Start demo lesson',
  ctaViewPlans: 'See plans',
  badgeNoCard: 'Start without a card',
  badgeLanguages: '15 interface languages',
  slideHero: 'Intro',
  slideDisciplines: 'Fields',
  slideHowItWorks: 'How it works',
  slideFeatures: 'Skills',
  carouselPause: 'Pause carousel',
  carouselPlay: 'Play carousel',
  disciplinesTitle: 'Pick the engineering world you work in',
  featuresHeaderBadge: 'The learning cockpit',
  featuresTitle: 'Train every skill in one place',
  featuresSubtitle: 'Reading, writing, speaking, listening, vocabulary, and grammar become part of one focused engineering workflow.',
  featureDescription: 'Field-aware AI practice for real tasks, not generic textbook drills.',
  cockpitLabel: 'Live cockpit',
  cockpitTitle: 'Engineering English OS',
  cockpitStatus: 'ONLINE',
  metricCoach: 'AI coach',
  metricCefr: 'CEFR radar',
  metricMode: 'Engineer mode',
  skillMap: 'Skill neural map',
  disciplinesBadge: 'Choose your cockpit',
  placementTest: 'Placement Test',
  learningHub: 'Learning Hub',
  progress: 'Progress Tracking',
  vocabularyPricing: 'Vocabulary',
  grammarPricing: 'Grammar',
  translator: 'Translator',
  readingPricing: 'Reading',
  writingPricing: 'Writing',
  speakingPricing: 'Speaking',
  listening: 'Listening',
  tool: 'Work Tools',
  aiCopilot: 'AI Copilot',
};

const TR: LandingTranslations = {
  heroBadge: 'Mühendisler için AI İngilizce koçu',
  heroTitle1: 'Mühendislik İngilizcesini',
  heroTitleHighlight: 'iş hayatında kullan',
  heroTitle2: 'akıcı ve özgüvenli konuş',
  heroSubtitle:
    'Toplantı, teknik rapor, saha konuşması, mülakat ve mesleki kelimeleri; kendi mühendislik alanına uyarlanan AI koçla pratik et.',
  ctaSelectBranch: 'Mühendislik alanını seç',
  ctaTryDemo: 'Demo derse başla',
  ctaViewPlans: 'Planları incele',
  badgeNoCard: 'Kart gerekmeden başla',
  badgeLanguages: '15 arayüz dili',
  slideHero: 'Giriş',
  slideDisciplines: 'Alanlar',
  slideHowItWorks: 'Nasıl çalışır',
  slideFeatures: 'Beceriler',
  carouselPause: 'Slaytı duraklat',
  carouselPlay: 'Slaytı oynat',
  disciplinesTitle: 'Çalıştığın mühendislik alanını seç',
  featuresHeaderBadge: 'Öğrenme kokpiti',
  featuresTitle: 'Tüm becerileri tek yerde geliştir',
  featuresSubtitle: 'Okuma, yazma, konuşma, dinleme, kelime ve gramer; mühendislik odaklı tek bir çalışma akışında birleşir.',
  featureDescription: 'Ders kitabı kalıpları değil, gerçek iş görevleri için alanına uygun AI pratiği.',
  cockpitLabel: 'Canlı kokpit',
  cockpitTitle: 'Mühendislik İngilizcesi OS',
  cockpitStatus: 'AKTİF',
  metricCoach: 'AI koç',
  metricCefr: 'CEFR seviye radarı',
  metricMode: 'Mühendis modu',
  skillMap: 'Beceri sinir haritası',
  disciplinesBadge: 'Kokpitini seç',
  placementTest: 'Seviye Testi',
  learningHub: 'Öğrenme Merkezi',
  progress: 'İlerleme Takibi',
  vocabularyPricing: 'Kelime',
  grammarPricing: 'Gramer',
  translator: 'Çevirmen',
  readingPricing: 'Okuma',
  writingPricing: 'Yazma',
  speakingPricing: 'Konuşma',
  listening: 'Dinleme',
  tool: 'İş Araçları',
  aiCopilot: 'AI Yardımcı',
};

const AR: LandingTranslations = { ...EN, heroBadge: 'مدرّب إنجليزية بالذكاء الاصطناعي للمهندسين' };
const DE: LandingTranslations = { ...EN, heroBadge: 'KI-Englischcoach für Ingenieurinnen und Ingenieure' };
const ES: LandingTranslations = { ...EN, heroBadge: 'Coach de inglés con IA para ingeniería' };

const TRANSLATIONS: Record<string, LandingTranslations> = {
  en: EN,
  tr: TR,
  ar: AR,
  de: DE,
  es: ES,
  pt: EN,
  fr: EN,
  ru: EN,
  zh: EN,
  ja: EN,
  it: EN,
  vi: EN,
  pl: EN,
  id: EN,
  nl: EN,
};

export function getLandingTranslations(language: SupportedInterfaceLanguage): LandingTranslations {
  return TRANSLATIONS[language] ?? EN;
}
