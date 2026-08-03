/**
 * Localization types — supports 12 interface languages.
 *
 * Supported: EN, TR (fully translated)
 * Planned: AR, ES, IT, FR, DE, PT, RU, ZH, JA, KO
 */

export type SupportedInterfaceLanguage = 'en' | 'tr';
export type PlannedInterfaceLanguage =
  'ar' | 'es' | 'it' | 'fr' | 'de' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

export type InterfaceLanguageId = SupportedInterfaceLanguage | PlannedInterfaceLanguage;

export interface InterfaceLanguageOption {
  id: InterfaceLanguageId;
  label: string;
  nativeLabel: string;
  available: boolean;
  /** Language flag emoji for UI display. */
  flag: string;
}

export type TranslationKey =
  // Navigation
  | 'nav.home'
  | 'nav.learningHub'
  | 'nav.skills'
  | 'nav.reading'
  | 'nav.writing'
  | 'nav.listening'
  | 'nav.speaking'
  | 'nav.vocabulary'
  | 'nav.grammar'
  | 'nav.tools'
  | 'nav.profile'
  // Common
  | 'common.language'
  | 'common.comingSoon'
  | 'common.cancel'
  | 'common.close'
  | 'common.submit'
  | 'common.loading'
  | 'common.error'
  | 'common.retry'
  | 'common.save'
  | 'common.delete'
  | 'common.confirm'
  | 'common.back'
  | 'common.next'
  | 'common.copy'
  | 'common.copied'
  // Translator
  | 'translator.title'
  | 'translator.sourcePlaceholder'
  | 'translator.outputPlaceholder'
  | 'translator.translating'
  | 'translator.translateNow'
  | 'translator.copyResult'
  | 'translator.audio'
  | 'translator.playing'
  | 'translator.listenAudio'
  | 'translator.quickAdd'
  // Onboarding
  | 'onboarding.title'
  | 'onboarding.selectDiscipline'
  | 'onboarding.selectLanguage'
  | 'onboarding.professionalTrack'
  | 'onboarding.electricalFocus'
  | 'onboarding.industry'
  | 'onboarding.roleContext'
  | 'onboarding.giftedModules'
  | 'onboarding.giftedModulesDesc'
  // Profile
  | 'profile.nameLanguage'
  | 'profile.firstName'
  | 'profile.lastName'
  | 'profile.save'
  // Feedback
  | 'feedback.open'
  | 'feedback.title'
  | 'feedback.type'
  | 'feedback.message'
  | 'feedback.context'
  | 'feedback.cancel'
  | 'feedback.submit'
  // Pricing
  | 'pricing.title'
  | 'pricing.currentPlan'
  | 'pricing.free'
  | 'pricing.pro'
  | 'pricing.project'
  | 'pricing.baseIncludes'
  | 'pricing.addons'
  | 'pricing.monthly'
  | 'pricing.annual'
  // Learning Hub
  | 'learningHub.title'
  // Grammar
  | 'grammar.meaningFunction'
  | 'grammar.form'
  | 'grammar.practice'
  // Vocabulary
  | 'vocabulary.search'
  | 'vocabulary.saveLearned'
  // Landing
  | 'landing.heroTag'
  | 'landing.heroTitle'
  | 'landing.heroSubtitle'
  | 'landing.startFree'
  | 'landing.seeFeatures'
  | 'landing.features'
  | 'landing.featuresDesc'
  | 'landing.howItWorks'
  | 'landing.step1'
  | 'landing.step1Desc'
  | 'landing.step2'
  | 'landing.step2Desc'
  | 'landing.step3'
  | 'landing.step3Desc'
  | 'landing.pricing'
  | 'landing.startFreeUpgrade'
  | 'landing.faq'
  | 'landing.trust'
  | 'landing.trustDesc'
  // Disciplines
  | 'discipline.architecture'
  | 'discipline.chemical'
  | 'discipline.civil'
  | 'discipline.electrical'
  | 'discipline.electronics'
  | 'discipline.hse'
  | 'discipline.industrial'
  | 'discipline.mechanical'
  | 'discipline.mechatronics'
  | 'discipline.software'
  | 'discipline.architecture.desc'
  | 'discipline.chemical.desc'
  | 'discipline.civil.desc'
  | 'discipline.electrical.desc'
  | 'discipline.electronics.desc'
  | 'discipline.hse.desc'
  | 'discipline.industrial.desc'
  | 'discipline.mechanical.desc'
  | 'discipline.mechatronics.desc'
  | 'discipline.software.desc';
