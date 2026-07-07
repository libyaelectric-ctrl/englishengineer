export type SupportedInterfaceLanguage = 'en' | 'tr';
export type PlannedInterfaceLanguage = 'ar' | 'es' | 'it' | 'fr';

export type InterfaceLanguageId =
  | SupportedInterfaceLanguage
  | PlannedInterfaceLanguage;

export interface InterfaceLanguageOption {
  id: InterfaceLanguageId;
  label: string;
  available: boolean;
}

export type TranslationKey =
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
  | 'common.language'
  | 'common.comingSoon'
  | 'onboarding.title'
  | 'onboarding.professionalTrack'
  | 'onboarding.electricalFocus'
  | 'onboarding.industry'
  | 'onboarding.roleContext'
  | 'profile.nameLanguage'
  | 'profile.firstName'
  | 'profile.lastName'
  | 'profile.save'
  | 'feedback.open'
  | 'feedback.title'
  | 'feedback.type'
  | 'feedback.message'
  | 'feedback.context'
  | 'feedback.cancel'
  | 'feedback.submit'
  | 'pricing.title'
  | 'pricing.currentPlan'
  | 'learningHub.title'
  | 'grammar.meaningFunction'
  | 'grammar.form'
  | 'grammar.practice'
  | 'vocabulary.search'
  | 'vocabulary.saveLearned'
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
  | 'landing.trustDesc';
