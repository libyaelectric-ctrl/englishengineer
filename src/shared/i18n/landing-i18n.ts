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
  slideHowItWorks: string;
  slideFeatures: string;

  // Disciplines
  disciplinesTitle: string;

  // Features
  featuresHeaderBadge: string;
  featuresTitle: string;
  featuresSubtitle: string;

  // How It Works
  howItWorksHeaderBadge: string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  howItWorksStep1Title: string;
  howItWorksStep1Desc: string;
  howItWorksStep2Title: string;
  howItWorksStep2Desc: string;
  howItWorksStep3Title: string;
  howItWorksStep3Desc: string;

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
  slideHowItWorks: 'How It Works',
  slideFeatures: 'Features',

  disciplinesTitle: 'Choose Your Engineering Discipline',

  featuresHeaderBadge: 'Why EngineerOS?',
  featuresTitle: 'Everything You Need',
  featuresSubtitle:
    'Six core skills, one platform — each module powered by AI and tailored to your discipline.',

  howItWorksHeaderBadge: 'How It Works',
  howItWorksTitle: 'Learn in 3 Steps',
  howItWorksSubtitle:
    'Pick your discipline, practice with AI, track your progress — all in one flow.',
  howItWorksStep1Title: 'Choose Your Path',
  howItWorksStep1Desc: 'Select your engineering discipline and target English level.',
  howItWorksStep2Title: 'Practice with AI',
  howItWorksStep2Desc: 'Real-time coaching in vocabulary, grammar, speaking, and writing.',
  howItWorksStep3Title: 'Track & Grow',
  howItWorksStep3Desc: 'Streak, XP, and skill analytics keep you moving forward.',

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
  slideHowItWorks: 'Nasıl Çalışır',
  slideFeatures: 'Özellikler',

  disciplinesTitle: 'Mühendislik Dalınızı Seçin',

  featuresHeaderBadge: 'Neden EngineerOS?',
  featuresTitle: 'İhtiyacınız Her Şey',
  featuresSubtitle: 'Altı temel beceri, tek platform — her modül AI tarafından desteklenir.',

  howItWorksHeaderBadge: 'Nasıl Çalışır',
  howItWorksTitle: '3 Adımda Öğren',
  howItWorksSubtitle: 'Dalinizi seçin, AI ile pratiğin, ilerleyi takip et — hepsi tek akışta.',
  howItWorksStep1Title: 'Yolunuzu Seçin',
  howItWorksStep1Desc: 'Mühendislik dalınızı ve hedef İngilizce seviyenizi belirleyin.',
  howItWorksStep2Title: 'AI ile Pratik Yapın',
  howItWorksStep2Desc: 'Kelime, dilbilgisi, konuşma ve yazmada gerçek zamanlı koçluk.',
  howItWorksStep3Title: 'Takip Edin ve Büyüyün',
  howItWorksStep3Desc: 'Seri, XP ve beceri analitikleri sizi ileri taşır.',

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
  slideHowItWorks: 'كيف يعمل',
  slideFeatures: 'الميزات',

  disciplinesTitle: 'اختر تخصصك الهندسي',

  featuresHeaderBadge: 'لماذا EngineerOS؟',
  featuresTitle: 'كل ما تحتاجه',
  featuresSubtitle: 'ستة مهارات أساسية، منصة واحدة — كل وحدة مدعومة بالذكاء الاصطناعي.',

  howItWorksHeaderBadge: 'كيف يعمل',
  howItWorksTitle: 'تعلم في 3 خطوات',
  howItWorksSubtitle: 'اختر تخصصك، تدرب مع الذكاء الاصطناعي، وتابع تقدمك — كل ذلك في تدفق واحد.',
  howItWorksStep1Title: 'اختر مسارك',
  howItWorksStep1Desc: 'اختر تخصصك الهندسي ومستوى الإنجليزية المستهدف.',
  howItWorksStep2Title: 'تدرب مع الذكاء الاصطناعي',
  howItWorksStep2Desc: 'تدريب فوري في المفردات، القواعد، التحدث، والكتابة.',
  howItWorksStep3Title: 'تتبع وتطور',
  howItWorksStep3Desc: 'السلاسل، XP، وتحليلات المهارات تبقيك تتقدم.',

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
  slideHowItWorks: 'Wie es funktioniert',
  slideFeatures: 'Funktionen',

  disciplinesTitle: 'Wählen Sie Ihr Ingenieur-Fachgebiet',

  featuresHeaderBadge: 'Warum EngineerOS?',
  featuresTitle: 'Alles was Sie brauchen',
  featuresSubtitle: 'Sechs Kernkompetenzen, eine Plattform — jedes Modul von KI gestützt.',

  howItWorksHeaderBadge: 'Wie es funktioniert',
  howItWorksTitle: 'In 3 Schritten lernen',
  howItWorksSubtitle:
    'Fachgebiet wählen, mit KI üben, Fortschritt verfolgen — alles in einem Fluss.',
  howItWorksStep1Title: 'Pfad wählen',
  howItWorksStep1Desc: 'Ihr Ingenieur-Fachgebiet und Ziel-Englisch-Level auswählen.',
  howItWorksStep2Title: 'Mit KI üben',
  howItWorksStep2Desc: 'Echtzeit-Coaching bei Vokabular, Grammatik, Sprechen und Schreiben.',
  howItWorksStep3Title: 'Fortschritt & Wachsen',
  howItWorksStep3Desc: 'Serien, XP und Skill-Analysen halten Sie auf Kurs.',

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
  slideHowItWorks: 'Cómo funciona',
  slideFeatures: 'Características',

  disciplinesTitle: 'Elige tu rama de ingeniería',

  featuresHeaderBadge: '¿Por qué EngineerOS?',
  featuresTitle: 'Todo lo que necesitas',
  featuresSubtitle: 'Seis habilidades clave, una plataforma — cada módulo impulsado por IA.',

  howItWorksHeaderBadge: 'Cómo funciona',
  howItWorksTitle: 'Aprende en 3 pasos',
  howItWorksSubtitle: 'Elige tu rama, practica con IA, sigue tu progreso — todo en un flujo.',
  howItWorksStep1Title: 'Elige tu camino',
  howItWorksStep1Desc: 'Selecciona tu rama de ingeniería y nivel de inglés objetivo.',
  howItWorksStep2Title: 'Practica con IA',
  howItWorksStep2Desc: 'Coaching en tiempo real en vocabulario, gramática, habla y escritura.',
  howItWorksStep3Title: 'Rastrea y crece',
  howItWorksStep3Desc: 'Rachas, XP y analíticas de habilidades te mantienen avanzando.',

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
