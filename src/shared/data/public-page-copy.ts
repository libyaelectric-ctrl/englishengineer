import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

export type PricingTierId = 'junior' | 'senior' | 'specialist' | 'master' | 'team';

interface PublicPageCopy {
  activeEngineers: string;
  disciplines: string;
  languages: string;
  technicalTerms: string;
  freeDescription: string;
  tierDescriptions: Record<PricingTierId, string>;
}

const ENGLISH_COPY: PublicPageCopy = {
  activeEngineers: 'Active Engineers',
  disciplines: 'Disciplines',
  languages: 'Languages',
  technicalTerms: 'Technical Terms',
  freeDescription: 'Core vocabulary and grammar practice to start your engineering English path.',
  tierDescriptions: {
    junior: 'Essential learning core for daily engineering English practice.',
    senior: 'Expand your skills with reading, writing, and translation.',
    specialist: 'Add speaking and listening to complete your communication skills.',
    master: 'Full access: all modules including AI Copilot and tools.',
    team: 'Enterprise solution for engineering organizations.',
  },
};

const COPY: Partial<Record<SupportedInterfaceLanguage, PublicPageCopy>> = {
  tr: {
    activeEngineers: 'Aktif mühendisler',
    disciplines: 'Mühendislik dalları',
    languages: 'Diller',
    technicalTerms: 'Teknik terimler',
    freeDescription: 'Mühendislik İngilizcesine başlamak için temel kelime ve dil bilgisi pratiği.',
    tierDescriptions: {
      junior: 'Günlük mühendislik İngilizcesi pratiği için temel öğrenme paketi.',
      senior: 'Okuma, yazma ve çeviri ile becerilerinizi geliştirin.',
      specialist: 'İletişim becerilerinizi tamamlamak için konuşma ve dinlemeyi ekleyin.',
      master: 'AI Copilot ve araçlar dahil tüm modüllere tam erişim.',
      team: 'Mühendislik kuruluşları için kurumsal çözüm.',
    },
  },
  ar: {
    activeEngineers: 'المهندسون النشطون',
    disciplines: 'التخصصات',
    languages: 'اللغات',
    technicalTerms: 'المصطلحات الفنية',
    freeDescription: 'تدريب أساسي على المفردات والقواعد لبدء الإنجليزية الهندسية.',
    tierDescriptions: {
      junior: 'أساسيات التعلم للممارسة اليومية للإنجليزية الهندسية.',
      senior: 'طوّر مهاراتك بالقراءة والكتابة والترجمة.',
      specialist: 'أضف التحدث والاستماع لإكمال مهارات التواصل.',
      master: 'وصول كامل إلى جميع الوحدات، بما فيها Copilot والأدوات.',
      team: 'حل مؤسسي لمنظمات الهندسة.',
    },
  },
  de: {
    activeEngineers: 'Aktive Ingenieure',
    disciplines: 'Fachbereiche',
    languages: 'Sprachen',
    technicalTerms: 'Technische Begriffe',
    freeDescription: 'Grundlegendes Vokabel- und Grammatiktraining für den Einstieg.',
    tierDescriptions: {
      junior: 'Die Lernbasis für tägliches technisches Englisch.',
      senior: 'Erweitern Sie Ihre Fähigkeiten mit Lesen, Schreiben und Übersetzen.',
      specialist: 'Ergänzen Sie Sprechen und Hören für vollständige Kommunikation.',
      master: 'Vollzugriff auf alle Module einschließlich Copilot und Tools.',
      team: 'Unternehmenslösung für Ingenieurorganisationen.',
    },
  },
  es: {
    activeEngineers: 'Ingenieros activos',
    disciplines: 'Disciplinas',
    languages: 'Idiomas',
    technicalTerms: 'Términos técnicos',
    freeDescription: 'Práctica básica de vocabulario y gramática para comenzar.',
    tierDescriptions: {
      junior: 'Base esencial para practicar inglés técnico a diario.',
      senior: 'Amplía tus habilidades con lectura, escritura y traducción.',
      specialist: 'Añade expresión oral y comprensión auditiva.',
      master: 'Acceso completo a todos los módulos, Copilot y herramientas.',
      team: 'Solución empresarial para organizaciones de ingeniería.',
    },
  },
  pt: {
    activeEngineers: 'Engenheiros ativos',
    disciplines: 'Disciplinas',
    languages: 'Idiomas',
    technicalTerms: 'Termos técnicos',
    freeDescription: 'Prática essencial de vocabulário e gramática para começar.',
    tierDescriptions: {
      junior: 'Base essencial para a prática diária de inglês de engenharia.',
      senior: 'Amplie suas habilidades com leitura, escrita e tradução.',
      specialist: 'Adicione fala e escuta para completar sua comunicação.',
      master: 'Acesso completo a todos os módulos, Copilot e ferramentas.',
      team: 'Solução empresarial para organizações de engenharia.',
    },
  },
  fr: {
    activeEngineers: 'Ingénieurs actifs',
    disciplines: 'Disciplines',
    languages: 'Langues',
    technicalTerms: 'Termes techniques',
    freeDescription: "Pratique essentielle du vocabulaire et de la grammaire pour commencer.",
    tierDescriptions: {
      junior: "Base essentielle pour pratiquer l'anglais technique au quotidien.",
      senior: 'Développez vos compétences en lecture, écriture et traduction.',
      specialist: "Ajoutez l'expression orale et l'écoute.",
      master: 'Accès complet à tous les modules, Copilot et outils.',
      team: "Solution d'entreprise pour les organisations d'ingénierie.",
    },
  },
  ru: {
    activeEngineers: 'Активные инженеры',
    disciplines: 'Дисциплины',
    languages: 'Языки',
    technicalTerms: 'Технические термины',
    freeDescription: 'Базовая практика словарного запаса и грамматики для начала.',
    tierDescriptions: {
      junior: 'Основа для ежедневной практики инженерного английского.',
      senior: 'Развивайте навыки чтения, письма и перевода.',
      specialist: 'Добавьте разговорную речь и аудирование.',
      master: 'Полный доступ ко всем модулям, Copilot и инструментам.',
      team: 'Корпоративное решение для инженерных организаций.',
    },
  },
  zh: {
    activeEngineers: '活跃工程师',
    disciplines: '工程领域',
    languages: '语言',
    technicalTerms: '技术术语',
    freeDescription: '通过核心词汇和语法练习开始工程英语学习。',
    tierDescriptions: {
      junior: '用于日常工程英语练习的基础学习核心。',
      senior: '通过阅读、写作和翻译扩展技能。',
      specialist: '加入口语和听力，完善沟通能力。',
      master: '完整访问所有模块、Copilot 和工具。',
      team: '面向工程组织的企业解决方案。',
    },
  },
  ja: {
    activeEngineers: 'アクティブなエンジニア',
    disciplines: '専門分野',
    languages: '言語',
    technicalTerms: '技術用語',
    freeDescription: '基本語彙と文法練習でエンジニアリング英語を始めます。',
    tierDescriptions: {
      junior: '毎日のエンジニアリング英語練習に必要な基本コース。',
      senior: '読解、作文、翻訳でスキルを広げます。',
      specialist: 'スピーキングとリスニングを加えて完成させます。',
      master: 'Copilot とツールを含む全モジュールに完全アクセス。',
      team: 'エンジニアリング組織向けの法人ソリューション。',
    },
  },
  it: {
    activeEngineers: 'Ingegneri attivi',
    disciplines: 'Discipline',
    languages: 'Lingue',
    technicalTerms: 'Termini tecnici',
    freeDescription: 'Pratica di vocabolario e grammatica per iniziare.',
    tierDescriptions: {
      junior: "Base essenziale per la pratica quotidiana dell'inglese tecnico.",
      senior: 'Amplia le competenze con lettura, scrittura e traduzione.',
      specialist: 'Aggiungi parlato e ascolto per completare la comunicazione.',
      master: 'Accesso completo a tutti i moduli, Copilot e strumenti.',
      team: 'Soluzione aziendale per organizzazioni di ingegneria.',
    },
  },
  vi: {
    activeEngineers: 'Kỹ sư đang hoạt động',
    disciplines: 'Chuyên ngành',
    languages: 'Ngôn ngữ',
    technicalTerms: 'Thuật ngữ kỹ thuật',
    freeDescription: 'Luyện từ vựng và ngữ pháp cốt lõi để bắt đầu.',
    tierDescriptions: {
      junior: 'Nền tảng thiết yếu cho tiếng Anh kỹ thuật hằng ngày.',
      senior: 'Mở rộng kỹ năng đọc, viết và dịch thuật.',
      specialist: 'Thêm nói và nghe để hoàn thiện giao tiếp.',
      master: 'Truy cập đầy đủ mọi mô-đun, Copilot và công cụ.',
      team: 'Giải pháp doanh nghiệp cho các tổ chức kỹ thuật.',
    },
  },
  pl: {
    activeEngineers: 'Aktywni inżynierowie',
    disciplines: 'Dziedziny',
    languages: 'Języki',
    technicalTerms: 'Terminy techniczne',
    freeDescription: 'Podstawowa praktyka słownictwa i gramatyki na start.',
    tierDescriptions: {
      junior: 'Podstawa codziennej praktyki angielskiego technicznego.',
      senior: 'Rozwijaj czytanie, pisanie i tłumaczenie.',
      specialist: 'Dodaj mówienie i słuchanie dla pełnej komunikacji.',
      master: 'Pełny dostęp do modułów, Copilota i narzędzi.',
      team: 'Rozwiązanie dla organizacji inżynieryjnych.',
    },
  },
  id: {
    activeEngineers: 'Insinyur aktif',
    disciplines: 'Disiplin',
    languages: 'Bahasa',
    technicalTerms: 'Istilah teknis',
    freeDescription: 'Latihan kosakata dan tata bahasa inti untuk memulai.',
    tierDescriptions: {
      junior: 'Dasar penting untuk latihan bahasa Inggris teknik harian.',
      senior: 'Kembangkan keterampilan membaca, menulis, dan menerjemahkan.',
      specialist: 'Tambahkan berbicara dan menyimak untuk komunikasi lengkap.',
      master: 'Akses penuh ke semua modul, Copilot, dan alat.',
      team: 'Solusi perusahaan untuk organisasi teknik.',
    },
  },
  nl: {
    activeEngineers: 'Actieve ingenieurs',
    disciplines: 'Vakgebieden',
    languages: 'Talen',
    technicalTerms: 'Technische termen',
    freeDescription: 'Oefen basiswoordenschat en grammatica om te beginnen.',
    tierDescriptions: {
      junior: 'Essentiële basis voor dagelijkse technische Engelse oefening.',
      senior: 'Breid vaardigheden uit met lezen, schrijven en vertalen.',
      specialist: 'Voeg spreken en luisteren toe voor complete communicatie.',
      master: 'Volledige toegang tot alle modules, Copilot en tools.',
      team: 'Enterpriseoplossing voor technische organisaties.',
    },
  },
};

export const getPublicPageCopy = (language: SupportedInterfaceLanguage): PublicPageCopy => {
  return COPY[language] ?? ENGLISH_COPY;
};
