import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

export interface LandingTranslations {
  // Hero
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

  // Slides
  slideHero: string;
  slideDisciplines: string;
  slideFeatures: string;

  // Disciplines
  disciplinesTitle: string;

  // Features
  featuresHeaderBadge: string;
  featuresTitle: string;
  featuresSubtitle: string;

  // Pricing feature labels
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
  heroBadge: 'AI-Powered Engineering English',
  heroTitle1: 'Master English for',
  heroTitleHighlight: 'Your Engineering Discipline',
  heroTitle2: 'Professional English, Tailored to You',
  heroSubtitle:
    'Structured learning paths, real-time AI coaching, and discipline-specific vocabulary for engineers.',
  ctaSelectBranch: 'Select Your Branch',
  ctaTryDemo: 'Try a Sample Lesson',
  ctaViewPlans: 'View Plans',
  badgeNoCard: 'No credit card required',
  badgeLanguages: '15 interface languages',

  slideHero: 'Hero',
  slideDisciplines: 'Disciplines',
  slideFeatures: 'Features',

  disciplinesTitle: 'Choose Your Engineering Discipline',

  featuresHeaderBadge: 'Why EngineerOS?',
  featuresTitle: 'Everything You Need',
  featuresSubtitle:
    'Six core skills, one platform — each module powered by AI and tailored to your discipline.',

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
  heroBadge: 'Yapay Zeka Destekli Mühendislik İngilizcesi',
  heroTitle1: 'İngilizceyi',
  heroTitleHighlight: 'Mühendislik Dalında Ustalaş',
  heroTitle2: 'Profesyonel İngilizce, Sana Özel',
  heroSubtitle:
    'Yapılandırılmış öğrenme yolları, gerçek zamanlı AI koçluk ve disipline özgü kelime hazinesi.',
  ctaSelectBranch: 'Dalınızı Seçin',
  ctaTryDemo: 'Örneği Dene',
  ctaViewPlans: 'Planları Görüntüle',
  badgeNoCard: 'Kredi kartı gerekmez',
  badgeLanguages: '15 arayüz dili',

  slideHero: 'Giriş',
  slideDisciplines: 'Dallar',
  slideFeatures: 'Özellikler',

  disciplinesTitle: 'Mühendislik Dalınızı Seçin',

  featuresHeaderBadge: 'Neden EngineerOS?',
  featuresTitle: 'İhtiyacınız Her Şey',
  featuresSubtitle: 'Altı temel beceri, tek platform — her modül AI tarafından desteklenir.',

  placementTest: 'Seviye Testi',
  learningHub: 'Öğrenme Merkezi',
  progress: 'İlerleme Takibi',
  vocabularyPricing: 'Kelime Bilgisi',
  grammarPricing: 'Dilbilgisi',
  translator: 'Çevirmen',
  readingPricing: 'Okuma',
  writingPricing: 'Yazma',
  speakingPricing: 'Konuşma',
  listening: 'Dinleme',
  tool: 'Çalışma Araçları',
  aiCopilot: 'AI Copilot',
};

const AR: LandingTranslations = {
  heroBadge: 'الإنجليزية الهندسية بالذكاء الاصطناعي',
  heroTitle1: 'أتقن الإنجليزية',
  heroTitleHighlight: 'لتخصصك الهندسي',
  heroTitle2: 'إنجليزية مهنية مصممة لك',
  heroSubtitle: 'مسارات تعلم منظمة وتدريب بالذكاء الاصطناعي ومفردات متخصصة للمهندسين.',
  ctaSelectBranch: 'اختر تخصصك',
  ctaTryDemo: 'جرّب درساً تجريبياً',
  ctaViewPlans: 'عرض الخطط',
  badgeNoCard: 'لا حاجة لبطاقة ائتمان',
  badgeLanguages: '15 لغة واجهة',

  slideHero: 'رئيسي',
  slideDisciplines: 'التخصصات',
  slideFeatures: 'الميزات',

  disciplinesTitle: 'اختر تخصصك الهندسي',

  featuresHeaderBadge: 'لماذا EngineerOS؟',
  featuresTitle: 'كل ما تحتاجه',
  featuresSubtitle: 'ستة مهارات أساسية، منصة واحدة — كل وحدة مدعومة بالذكاء الاصطناعي.',

  placementTest: 'اختبار تحديد المستوى',
  learningHub: 'مركز التعلم',
  progress: 'تتبع التقدم',
  vocabularyPricing: 'المفردات',
  grammarPricing: 'القواعد',
  translator: 'المترجم',
  readingPricing: 'القراءة',
  writingPricing: 'الكتابة',
  speakingPricing: 'التحدث',
  listening: 'الاستماع',
  tool: 'أدوات العمل',
  aiCopilot: 'مساعد الذكاء الاصطناعي',
};

const DE: LandingTranslations = {
  heroBadge: 'KI-gestütztes Ingenieur-Englisch',
  heroTitle1: 'Englisch meistern für',
  heroTitleHighlight: 'Ihr Ingenieur-Fachgebiet',
  heroTitle2: 'Professionelles Englisch, maßgeschneidert',
  heroSubtitle: 'Strukturierte Lernpfade, Echtzeit-KI-Coaching und fachspezifisches Vokabular.',
  ctaSelectBranch: 'Fachgebiet wählen',
  ctaTryDemo: 'Beispiellektion testen',
  ctaViewPlans: 'Pläne ansehen',
  badgeNoCard: 'Keine Kreditkarte nötig',
  badgeLanguages: '15 Oberflächensprachen',

  slideHero: 'Start',
  slideDisciplines: 'Fachgebiete',
  slideFeatures: 'Funktionen',

  disciplinesTitle: 'Wählen Sie Ihr Ingenieur-Fachgebiet',

  featuresHeaderBadge: 'Warum EngineerOS?',
  featuresTitle: 'Alles was Sie brauchen',
  featuresSubtitle: 'Sechs Kernkompetenzen, eine Plattform — jedes Modul von KI gestützt.',

  placementTest: 'Einstufungstest',
  learningHub: 'Lernzentrum',
  progress: 'Fortschrittsverfolgung',
  vocabularyPricing: 'Vokabular',
  grammarPricing: 'Grammatik',
  translator: 'Übersetzer',
  readingPricing: 'Lesen',
  writingPricing: 'Schreiben',
  speakingPricing: 'Sprechen',
  listening: 'Hören',
  tool: 'Arbeitswerkzeuge',
  aiCopilot: 'KI-Assistent',
};

const ES: LandingTranslations = {
  heroBadge: 'Inglés de Ingeniería con IA',
  heroTitle1: 'Domina el inglés para',
  heroTitleHighlight: 'Tu rama de ingeniería',
  heroTitle2: 'Inglés profesional, adaptado a ti',
  heroSubtitle: 'Rutas de aprendizaje estructuradas, coaching con IA y vocabulario específico.',
  ctaSelectBranch: 'Elige tu rama',
  ctaTryDemo: 'Probar una lección',
  ctaViewPlans: 'Ver planes',
  badgeNoCard: 'Sin tarjeta de crédito',
  badgeLanguages: '15 idiomas de interfaz',

  slideHero: 'Inicio',
  slideDisciplines: 'Ramas',
  slideFeatures: 'Características',

  disciplinesTitle: 'Elige tu rama de ingeniería',

  featuresHeaderBadge: '¿Por qué EngineerOS?',
  featuresTitle: 'Todo lo que necesitas',
  featuresSubtitle: 'Seis habilidades clave, una plataforma — cada módulo impulsado por IA.',

  placementTest: 'Test de nivel',
  learningHub: 'Centro de aprendizaje',
  progress: 'Seguimiento del progreso',
  vocabularyPricing: 'Vocabulario',
  grammarPricing: 'Gramática',
  translator: 'Traductor',
  readingPricing: 'Lectura',
  writingPricing: 'Escritura',
  speakingPricing: 'Habla',
  listening: 'Escucha',
  tool: 'Herramientas de trabajo',
  aiCopilot: 'Asistente IA',
};

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
