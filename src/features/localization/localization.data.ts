import type {
  InterfaceLanguageOption,
  SupportedInterfaceLanguage,
  TranslationKey,
} from './localization.types';

export const INTERFACE_LANGUAGES: InterfaceLanguageOption[] = [
  { id: 'en', label: 'English', nativeLabel: 'English', available: true, flag: '🇬🇧' },
  { id: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', available: true, flag: '🇹🇷' },
  { id: 'ar', label: 'Arabic', nativeLabel: 'العربية', available: false, flag: '🇸🇦' },
  { id: 'es', label: 'Spanish', nativeLabel: 'Español', available: false, flag: '🇪🇸' },
  { id: 'it', label: 'Italian', nativeLabel: 'Italiano', available: false, flag: '🇮🇹' },
  { id: 'fr', label: 'French', nativeLabel: 'Français', available: false, flag: '🇫🇷' },
  { id: 'de', label: 'German', nativeLabel: 'Deutsch', available: false, flag: '🇩🇪' },
  { id: 'pt', label: 'Portuguese', nativeLabel: 'Português', available: false, flag: '🇧🇷' },
  { id: 'ru', label: 'Russian', nativeLabel: 'Русский', available: false, flag: '🇷🇺' },
  { id: 'zh', label: 'Chinese', nativeLabel: '中文', available: false, flag: '🇨🇳' },
  { id: 'ja', label: 'Japanese', nativeLabel: '日本語', available: false, flag: '🇯🇵' },
  { id: 'ko', label: 'Korean', nativeLabel: '한국어', available: false, flag: '🇰🇷' },
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
    // Navigation
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
    // Common
    'common.language': 'Language',
    'common.comingSoon': 'Coming Soon',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try Again',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    // Translator
    'translator.title': 'Translate Text Now',
    'translator.sourcePlaceholder': 'Source Text / Technical Document',
    'translator.outputPlaceholder': 'Translated output will appear here automatically...',
    'translator.translating': 'Translating...',
    'translator.translateNow': 'Translate Text Now',
    'translator.copyResult': 'Copy Result',
    'translator.audio': 'Audio',
    'translator.playing': 'Playing...',
    'translator.listenAudio': 'Listen Translated Audio',
    'translator.quickAdd': 'Quick Add:',
    // Onboarding
    'onboarding.title': 'Build your learning workspace',
    'onboarding.selectDiscipline': 'Select your engineering discipline',
    'onboarding.selectLanguage': 'Select your interface language',
    'onboarding.professionalTrack': 'Professional track',
    'onboarding.electricalFocus': 'Electrical focus',
    'onboarding.industry': 'Industry',
    'onboarding.roleContext': 'Your focus changes the work context, not the CEFR difficulty.',
    'onboarding.giftedModules': 'Included with your discipline',
    'onboarding.giftedModulesDesc':
      'Vocabulary and grammar modules are included free for your selected discipline.',
    // Profile
    'profile.nameLanguage': 'Name and language',
    'profile.firstName': 'First name',
    'profile.lastName': 'Last name',
    'profile.save': 'Save Profile',
    // Feedback
    'feedback.open': 'Feedback',
    'feedback.title': 'Closed Beta Feedback',
    'feedback.type': 'Feedback type',
    'feedback.message': 'Feedback message',
    'feedback.context': 'Page or context (optional)',
    'feedback.cancel': 'Cancel',
    'feedback.submit': 'Submit Feedback',
    // Pricing
    'pricing.title': 'Pricing',
    'pricing.currentPlan': 'Current plan',
    'pricing.free': 'Free',
    'pricing.pro': 'Pro',
    'pricing.project': 'Project',
    'pricing.baseIncludes': 'Vocabulary + Grammar included',
    'pricing.addons': 'Add-ons available',
    'pricing.monthly': 'Monthly',
    'pricing.annual': 'Annual',
    // Learning Hub
    'learningHub.title': 'Learning Hub',
    // Grammar
    'grammar.meaningFunction': 'Meaning and function',
    'grammar.form': 'Form',
    'grammar.practice': 'Mini practice',
    // Vocabulary
    'vocabulary.search': 'Search Vocabulary',
    'vocabulary.saveLearned': 'Save to Learned',
    // Landing
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
    'landing.trustDesc': 'Progress stored in your browser. No account required to start.',
    // Disciplines
    'discipline.architecture': 'Architecture',
    'discipline.chemical': 'Chemical Engineering',
    'discipline.civil': 'Civil Engineering',
    'discipline.electrical': 'Electrical Engineering',
    'discipline.electronics': 'Electronics Engineering',
    'discipline.hse': 'HSE Engineering',
    'discipline.industrial': 'Industrial Engineering',
    'discipline.mechanical': 'Mechanical Engineering',
    'discipline.mechatronics': 'Mechatronics / Robotics',
    'discipline.software': 'Software Engineering',
    'discipline.architecture.desc': 'Design, Spatial & BIM',
    'discipline.chemical.desc': 'Process, Refining & Safety',
    'discipline.civil.desc': 'Infrastructure & Structures',
    'discipline.electrical.desc': 'Power Systems & Grid',
    'discipline.electronics.desc': 'Semiconductors & Embedded',
    'discipline.hse.desc': 'Safety, Health & Compliance',
    'discipline.industrial.desc': 'Lean, Operations & Supply Chain',
    'discipline.mechanical.desc': 'HVAC, Fluid Dynamics & Machinery',
    'discipline.mechatronics.desc': 'Automation, Control & Robotics',
    'discipline.software.desc': 'Architecture, Cloud & Code',
  },
  tr: {
    // Navigation
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
    // Common
    'common.language': 'Dil',
    'common.comingSoon': 'Yakında',
    'common.cancel': 'İptal',
    'common.close': 'Kapat',
    'common.submit': 'Gönder',
    'common.loading': 'Yükleniyor...',
    'common.error': 'Bir hata oluştu',
    'common.retry': 'Tekrar Dene',
    'common.save': 'Kaydet',
    'common.delete': 'Sil',
    'common.confirm': 'Onayla',
    'common.back': 'Geri',
    'common.next': 'İleri',
    'common.copy': 'Kopyala',
    'common.copied': 'Kopyalandı!',
    // Translator
    'translator.title': 'Metni Çevir',
    'translator.sourcePlaceholder': 'Kaynak Metin / Teknik Döküman',
    'translator.outputPlaceholder': 'Çevrilmiş çıktı otomatik olarak burada görünecek...',
    'translator.translating': 'Çevriliyor...',
    'translator.translateNow': 'Metni Şimdi Çevir',
    'translator.copyResult': 'Sonucu Kopyala',
    'translator.audio': 'Ses',
    'translator.playing': 'Çalınıyor...',
    'translator.listenAudio': 'Çevrilmiş Sesi Dinle',
    'translator.quickAdd': 'Hızlı Ekle:',
    // Onboarding
    'onboarding.title': 'Öğrenme alanını oluştur',
    'onboarding.selectDiscipline': 'Mühendislik alanınızı seçin',
    'onboarding.selectLanguage': 'Arayüz dilinizi seçin',
    'onboarding.professionalTrack': 'Mesleki alan',
    'onboarding.electricalFocus': 'Elektrik uzmanlık alanı',
    'onboarding.industry': 'Sektör',
    'onboarding.roleContext':
      'Uzmanlık seçimin iş konusunu değiştirir, CEFR zorluğunu değiştirmez.',
    'onboarding.giftedModules': 'Alanınızla birlikte gelen modüller',
    'onboarding.giftedModulesDesc':
      'Kelime ve dil bilgisi modüleri seçtiğiniz alan için ücretsizdir.',
    // Profile
    'profile.nameLanguage': 'İsim ve dil',
    'profile.firstName': 'Ad',
    'profile.lastName': 'Soyad',
    'profile.save': 'Profili Kaydet',
    // Feedback
    'feedback.open': 'Geri Bildirim',
    'feedback.title': 'Kapalı Beta Geri Bildirimi',
    'feedback.type': 'Geri bildirim türü',
    'feedback.message': 'Geri bildirim mesajı',
    'feedback.context': 'Sayfa veya bağlam (isteğe bağlı)',
    'feedback.cancel': 'İptal',
    'feedback.submit': 'Gönder',
    // Pricing
    'pricing.title': 'Fiyatlandırma',
    'pricing.currentPlan': 'Mevcut plan',
    'pricing.free': 'Ücretsiz',
    'pricing.pro': 'Pro',
    'pricing.project': 'Proje',
    'pricing.baseIncludes': 'Kelime + Dil Bilgisi dahil',
    'pricing.addons': 'Ek modüller mevcut',
    'pricing.monthly': 'Aylık',
    'pricing.annual': 'Yıllık',
    // Learning Hub
    'learningHub.title': 'Öğrenme Merkezi',
    // Grammar
    'grammar.meaningFunction': 'Anlam ve işlev',
    'grammar.form': 'Yapı',
    'grammar.practice': 'Mini alıştırma',
    // Vocabulary
    'vocabulary.search': 'Kelime Ara',
    'vocabulary.saveLearned': 'Öğrenilenlere Kaydet',
    // Landing
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
    'landing.trustDesc': 'İlerlemeniz tarayıcınızda saklanır. Başlamak için hesap gerekmez.',
    // Disciplines
    'discipline.architecture': 'Mimarlık',
    'discipline.chemical': 'Kimya Mühendisliği',
    'discipline.civil': 'İnşaat Mühendisliği',
    'discipline.electrical': 'Elektrik Mühendisliği',
    'discipline.electronics': 'Elektronik Mühendisliği',
    'discipline.hse': 'İş Güvenliği Mühendisliği',
    'discipline.industrial': 'Endüstri Mühendisliği',
    'discipline.mechanical': 'Makine Mühendisliği',
    'discipline.mechatronics': 'Mekatronik / Robotik',
    'discipline.software': 'Yazılım Mühendisliği',
    'discipline.architecture.desc': 'Tasarım, Mekansal & BIM',
    'discipline.chemical.desc': 'Proses, Rafineri & Güvenlik',
    'discipline.civil.desc': 'Altyapı & Yapılar',
    'discipline.electrical.desc': 'Güç Sistemleri & Şebeke',
    'discipline.electronics.desc': 'Yarı İletkenler & Gömülü Sistemler',
    'discipline.hse.desc': 'Güvenlik, Sağlık & Uyumluluk',
    'discipline.industrial.desc': 'İnce İşlemler, Operasyon & Tedarik Zinciri',
    'discipline.mechanical.desc': 'HVAC, Akışkan Dinamiği & Makineler',
    'discipline.mechatronics.desc': 'Otomasyon, Kontrol & Robotik',
    'discipline.software.desc': 'Mimari, Bulut & Kod',
  },
};

export const NAVIGATION_TRANSLATIONS: Record<SupportedInterfaceLanguage, Record<string, string>> = {
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
    Team: 'Takım & Şirket',
    'Placement Test': 'Seviye Sınavı',
    'Beta Program': 'Beta & Topluluk',
    'Admin Panel': 'Yönetim Paneli',
  },
};
