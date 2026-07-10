import type {
  InterfaceLanguageOption,
  SupportedInterfaceLanguage,
  TranslationKey,
} from './localization.types';

export const INTERFACE_LANGUAGES: InterfaceLanguageOption[] = [
  { id: 'en', label: 'English', available: true },
  { id: 'tr', label: 'Türkçe', available: true },
  { id: 'ar', label: 'العربية', available: false },
  { id: 'es', label: 'Español', available: false },
  { id: 'it', label: 'Italiano', available: false },
  { id: 'fr', label: 'Français', available: false },
];

export const AVAILABLE_INTERFACE_LANGUAGES = INTERFACE_LANGUAGES.filter(
  (
    language
  ): language is InterfaceLanguageOption & {
    id: SupportedInterfaceLanguage;
  } => language.available
);

export const UI_TRANSLATIONS: Record<
  SupportedInterfaceLanguage,
  Partial<Record<TranslationKey, string>>
> = {
  en: {
    'nav.home': 'Home',
    'nav.learningHub': 'Learning Hub',
    'nav.skills': 'Skills',
    'nav.reading': 'Reading',
    'nav.writing': 'Writing',
    'nav.listening': 'Listening',
    'nav.speaking': 'Speaking',
    'nav.vocabulary': 'Vocabulary',
    'nav.grammar': 'Grammar',
    'nav.tools': 'Tools',
    'nav.profile': 'Profile',
    'common.language': 'Language',
    'common.comingSoon': 'Coming Soon',
    'onboarding.title': 'Build your learning workspace',
    'onboarding.professionalTrack': 'Professional track',
    'onboarding.electricalFocus': 'Electrical focus',
    'onboarding.industry': 'Industry',
    'onboarding.roleContext':
      'Your focus changes the work context, not the CEFR difficulty.',
    'profile.nameLanguage': 'Name and language',
    'profile.firstName': 'First name',
    'profile.lastName': 'Last name',
    'profile.save': 'Save Profile',
    'feedback.open': 'Feedback',
    'feedback.title': 'Closed Beta Feedback',
    'feedback.type': 'Feedback type',
    'feedback.message': 'Feedback message',
    'feedback.context': 'Page or context (optional)',
    'feedback.cancel': 'Cancel',
    'feedback.submit': 'Submit Feedback',
    'pricing.title': 'Pricing',
    'pricing.currentPlan': 'Current plan',
    'learningHub.title': 'Learning Hub',
    'grammar.meaningFunction': 'Meaning and function',
    'grammar.form': 'Form',
    'grammar.practice': 'Mini practice',
    'vocabulary.search': 'Search Vocabulary',
    'vocabulary.saveLearned': 'Save to Learned',
    'landing.heroTag': 'Built for engineers on international projects',
    'landing.heroTitle':
      'Master the emails, RFIs, and site meetings that shape your engineering career.',
    'landing.heroSubtitle':
      'The only platform built specifically for engineering communication — with AI feedback on every attempt.',
    'landing.startFree': 'Start Free',
    'landing.seeFeatures': 'See Features',
    'landing.features': 'Features',
    'landing.featuresDesc':
      'Six specialized modules designed for real-world engineering scenarios.',
    'landing.howItWorks': 'How it works',
    'landing.step1': 'Set your profile',
    'landing.step1Desc':
      'Choose your discipline, current level, and career goals. The system builds a personalized curriculum.',
    'landing.step2': 'Practice real scenarios',
    'landing.step2Desc':
      'Work through authentic engineering communication tasks — from daily reports to client presentations.',
    'landing.step3': 'Track and improve',
    'landing.step3Desc':
      'AI-powered analytics identify weak areas. Spaced repetition ensures you retain what you learn.',
    'landing.pricing': 'Pricing',
    'landing.startFreeUpgrade': 'Start free. Upgrade when ready.',
    'landing.faq': 'FAQ',
    'landing.trust': 'Your data stays local',
    'landing.trustDesc':
      'Progress stored in your browser. No account required to start.',
  },
  tr: {
    'nav.home': 'Ana Sayfa',
    'nav.learningHub': 'Öğrenme Merkezi',
    'nav.skills': 'Beceriler',
    'nav.reading': 'Okuma',
    'nav.writing': 'Yazma',
    'nav.listening': 'Dinleme',
    'nav.speaking': 'Konuşma',
    'nav.vocabulary': 'Kelime',
    'nav.grammar': 'Dil Bilgisi',
    'nav.tools': 'Araçlar',
    'nav.profile': 'Profil',
    'common.language': 'Dil',
    'common.comingSoon': 'Yakında',
    'onboarding.title': 'Öğrenme alanını oluştur',
    'onboarding.professionalTrack': 'Mesleki alan',
    'onboarding.electricalFocus': 'Elektrik uzmanlık alanı',
    'onboarding.industry': 'Sektör',
    'onboarding.roleContext':
      'Uzmanlık seçimin iş konusunu değiştirir, CEFR zorluğunu değiştirmez.',
    'profile.nameLanguage': 'İsim ve dil',
    'profile.firstName': 'Ad',
    'profile.lastName': 'Soyad',
    'profile.save': 'Profili Kaydet',
    'feedback.open': 'Geri Bildirim',
    'feedback.title': 'Kapalı Beta Geri Bildirimi',
    'feedback.type': 'Geri bildirim türü',
    'feedback.message': 'Geri bildirim mesajı',
    'feedback.context': 'Sayfa veya bağlam (isteğe bağlı)',
    'feedback.cancel': 'İptal',
    'feedback.submit': 'Gönder',
    'pricing.title': 'Fiyatlandırma',
    'pricing.currentPlan': 'Mevcut plan',
    'learningHub.title': 'Öğrenme Merkezi',
    'grammar.meaningFunction': 'Anlam ve işlev',
    'grammar.form': 'Yapı',
    'grammar.practice': 'Mini alıştırma',
    'vocabulary.search': 'Kelime Ara',
    'vocabulary.saveLearned': 'Öğrenilenlere Kaydet',
    'landing.heroTag': 'Uluslararası projelerde çalışan mühendisler için',
    'landing.heroTitle':
      "Mühendislik kariyerinizi şekillendiren e-postaları, RFI'leri ve saha toplantılarını öğrenin.",
    'landing.heroSubtitle':
      'Mühendislik iletişimi için özel olarak oluşturulmuş tek platform — her denemede yapay zeka geri bildirimi ile.',
    'landing.startFree': 'Ücretsiz Başla',
    'landing.seeFeatures': 'Özellikleri Gör',
    'landing.features': 'Özellikler',
    'landing.featuresDesc':
      'Gerçek dünya mühendislik senaryoları için tasarlanmış altı özel modül.',
    'landing.howItWorks': 'Nasıl çalışır',
    'landing.step1': 'Profilini oluştur',
    'landing.step1Desc':
      'Uzmanlık alanınızı, mevcut seviyenizi ve kariyer hedeflerinizi seçin. Sistem size özel bir müfredat oluşturur.',
    'landing.step2': 'Gerçek senaryolarda pratik yapın',
    'landing.step2Desc':
      'Günlük raporlardan müşteri sunumlarına kadar otantik mühendislik iletişim görevlerinde çalışın.',
    'landing.step3': 'Takip edin ve geliştirin',
    'landing.step3Desc':
      'Yapay zeka destekli analizler zayıf alanları belirler. Aralıklı tekrar öğrendiklerinizi korumanızı sağlar.',
    'landing.pricing': 'Fiyatlandırma',
    'landing.startFreeUpgrade': 'Ücretsiz başla, hazır olunca yükselt.',
    'landing.faq': 'SSS',
    'landing.trust': 'Verileriniz yerel kalır',
    'landing.trustDesc':
      'İlerlemeniz tarayıcınızda saklanır. Başlamak için hesap gerekmez.',
  },
};

export const NAVIGATION_TRANSLATIONS: Record<
  SupportedInterfaceLanguage,
  Record<string, string>
> = {
  en: {},
  tr: {
    Home: 'Ana Sayfa',
    'Learning Hub': 'Öğrenme Merkezi',
    Skills: 'Beceriler',
    Reading: 'Okuma',
    Writing: 'Yazma',
    Listening: 'Dinleme',
    Speaking: 'Konuşma',
    Vocabulary: 'Kelime',
    Grammar: 'Dil Bilgisi',
    Tools: 'İş Araçları',
    Profile: 'Profil',
  },
};
