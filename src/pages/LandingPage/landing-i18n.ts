import { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

export interface LandingTranslations {
  // Hero
  heroBadge: string;
  heroTitle1: string;
  heroTitleHighlight: string;
  heroTitle2: string;
  heroSubtitle: string;
  ctaSelectBranch: string;
  ctaViewPlans: string;
  badgeNoCard: string;
  badgeLanguages: string;

  // Features
  featuresHeaderBadge: string;
  featuresTitle: string;
  featuresSubtitle: string;
  featureVocabularyDesc: string;
  featureReadingDesc: string;
  featureWritingDesc: string;
  featureSpeakingDesc: string;
  featureListeningDesc: string;
  featureGrammarDesc: string;

  // Final CTA
  finalCtaTitle: string;
  finalCtaTitleHighlight: string;
  finalCtaSub: string;
  finalCtaButton: string;

  // Pricing feature labels (used by PricingCard)
  placementTest?: string;
  learningHub?: string;
  progress?: string;
  vocabularyPricing?: string;
  grammarPricing?: string;
  translator?: string;
  readingPricing?: string;
  writingPricing?: string;
  speakingPricing?: string;
  listening?: string;
  tool?: string;
  aiCopilot?: string;
}

export const LANDING_I18N: Record<SupportedInterfaceLanguage, LandingTranslations> = {
  en: {
    heroBadge: 'EngineerOS • 10 Engineering Disciplines × 15 Languages',
    heroTitle1: 'Master Professional',
    heroTitleHighlight: 'Engineering English',
    heroTitle2: 'For Global Projects',
    heroSubtitle:
      'Choose your dedicated engineering discipline, lock your curriculum, and build C1 communication fluency with daily smart practice.',
    ctaSelectBranch: 'Select Discipline & Start',
    ctaViewPlans: 'View Pricing Plans',
    badgeNoCard: 'No Credit Card Required',
    badgeLanguages: '15 Interface Languages',
    featuresHeaderBadge: 'Core Learning Modules',
    featuresTitle: 'Everything You Need, In One Place',
    featuresSubtitle: 'Six focused modules that build real, job-ready engineering English.',
    featureVocabularyDesc: '14,000+ technical terms, structured for your discipline.',
    featureReadingDesc: 'Read contracts, specs, and technical documents with confidence.',
    featureWritingDesc: 'Draft reports, emails, and technical documents like a pro.',
    featureSpeakingDesc: 'Practice pronunciation and speaking with instant feedback.',
    featureListeningDesc: 'Understand meetings and field conversations with ease.',
    featureGrammarDesc: 'Master the grammar engineers actually use on the job.',
    finalCtaTitle: 'Your Engineering Voice Starts',
    finalCtaTitleHighlight: 'Here',
    finalCtaSub:
      'Select your discipline, choose your interface language, and start mastering professional engineering English today.',
    finalCtaButton: 'Start Free',
    placementTest: 'Placement Test',
    learningHub: 'Learning Hub',
    progress: 'Progress',
    vocabularyPricing: 'Vocabulary',
    grammarPricing: 'Grammar',
    translator: 'Translator',
    readingPricing: 'Reading',
    writingPricing: 'Writing',
    speakingPricing: 'Speaking',
    listening: 'Listening',
    tool: 'Tool',
    aiCopilot: 'AI Copilot',
  },
  tr: {
    heroBadge: 'EngineerOS • 10 Mühendislik Dalı × 15 Dil Desteği',
    heroTitle1: 'Uluslararası Projeler İçin',
    heroTitleHighlight: 'Mühendislik İngilizcenizi',
    heroTitle2: 'Üst Seviyeye Taşıyın',
    heroSubtitle:
      'Mesleğinize özel tek bir mühendislik dalını seçin, kilitleyin ve günlük akıllı egzersizlerle küresel projelerde C1 seviyesinde yetkinlik kazanın.',
    ctaSelectBranch: 'Mühendislik Dalını Seç ve Başla',
    ctaViewPlans: 'Planları İncele',
    badgeNoCard: 'Kredi Kartı Gerektirmez',
    badgeLanguages: '15 Dilde Kullanıcı Arayüzü',
    featuresHeaderBadge: 'Temel Öğrenme Modülleri',
    featuresTitle: 'İhtiyacınız Olan Her Şey, Tek Yerde',
    featuresSubtitle:
      'Gerçek iş hayatına hazır mühendislik İngilizcesi geliştiren altı odaklı modül.',
    featureVocabularyDesc: 'Dalınıza özel yapılandırılmış 14.000+ teknik terim.',
    featureReadingDesc: 'Sözleşmeleri, şartnameleri ve teknik dokümanları güvenle okuyun.',
    featureWritingDesc: 'Rapor, e-posta ve teknik dokümanları profesyonelce yazın.',
    featureSpeakingDesc: 'Anında geri bildirimle telaffuz ve konuşma pratiği yapın.',
    featureListeningDesc: 'Toplantı ve saha konuşmalarını kolayca anlayın.',
    featureGrammarDesc: 'İş hayatında mühendislerin gerçekten kullandığı dilbilgisini öğrenin.',
    finalCtaTitle: 'Mühendislik Sesiniz',
    finalCtaTitleHighlight: 'Buradan Başlıyor',
    finalCtaSub:
      'Mesleğinizi seçin, arayüz dilinizi belirleyin ve profesyonel mühendislik İngilizcesini geliştirmeye bugün başlayın.',
    finalCtaButton: 'Ücretsiz Başla',
    placementTest: 'Yerleştirme Testi',
    learningHub: 'Öğrenme Merkezi',
    progress: 'İlerleme',
    vocabularyPricing: 'Kelime',
    grammarPricing: 'Dilbilgisi',
    translator: 'Çevirmen',
    readingPricing: 'Okuma',
    writingPricing: 'Yazma',
    speakingPricing: 'Konuşma',
    listening: 'Dinleme',
    tool: 'Araç',
    aiCopilot: 'AI Asistanı',
  },
  de: {
    heroBadge: 'EngineerOS • 10 Ingenieurdisziplinen × 15 Sprachen',
    heroTitle1: 'Perfektionieren Sie Ihr',
    heroTitleHighlight: 'Ingenieur-Englisch',
    heroTitle2: 'Für Globale Projekte',
    heroSubtitle:
      'Wählen Sie Ihre Ingenieurdisziplin, verankern Sie Ihren Lehrplan und erreichen Sie C1-Kommunikationskompetenz.',
    ctaSelectBranch: 'Disziplin Wählen & Starten',
    ctaViewPlans: 'Preise Ansehen',
    badgeNoCard: 'Keine Kreditkarte Erforderlich',
    badgeLanguages: '15 Benutzeroberflächen-Sprachen',
    featuresHeaderBadge: 'Kern-Lernmodule',
    featuresTitle: 'Alles, Was Sie Brauchen, an Einem Ort',
    featuresSubtitle: 'Sechs fokussierte Module für berufsreifes Ingenieur-Englisch.',
    featureVocabularyDesc: 'Über 14.000 technische Begriffe, auf Ihre Disziplin abgestimmt.',
    featureReadingDesc: 'Lesen Sie Verträge, Spezifikationen und technische Dokumente sicher.',
    featureWritingDesc: 'Verfassen Sie Berichte, E-Mails und technische Dokumente professionell.',
    featureSpeakingDesc: 'Üben Sie Aussprache und Sprechen mit sofortigem Feedback.',
    featureListeningDesc: 'Verstehen Sie Meetings und Feldgespräche mühelos.',
    featureGrammarDesc: 'Beherrschen Sie die Grammatik, die Ingenieure wirklich brauchen.',
    finalCtaTitle: 'Ihre Ingenieur-Stimme Beginnt',
    finalCtaTitleHighlight: 'Hier',
    finalCtaSub:
      'Wählen Sie Ihre Disziplin und Oberflächensprache und meistern Sie professionelles Ingenieur-Englisch.',
    finalCtaButton: 'Kostenlos Starten',
  },
  ar: {
    heroBadge: 'EngineerOS • 10 تخصصات هندسية × 15 لغة',
    heroTitle1: 'أتقن اللغة الإنجليزية',
    heroTitleHighlight: 'الهندسية الاحترافية',
    heroTitle2: 'للمشاريع العالمية',
    heroSubtitle:
      'اختر تخصصك الهندسي، وثبّت منهجك الدراسي، وحقق طلاقة التواصل بمستوى C1 من خلال التدريب اليومي.',
    ctaSelectBranch: 'اختر التخصص وابدأ الان',
    ctaViewPlans: 'عرض خطط الأسعار',
    badgeNoCard: 'لا تتطلب بطاقة ائتمان',
    badgeLanguages: '15 لغة واجهة',
    featuresHeaderBadge: 'وحدات التعلم الأساسية',
    featuresTitle: 'كل ما تحتاجه في مكان واحد',
    featuresSubtitle: 'ست وحدات مركزة تبني إنجليزية هندسية جاهزة للحياة العملية.',
    featureVocabularyDesc: 'أكثر من 14,000 مصطلح تقني منظم حسب تخصصك.',
    featureReadingDesc: 'اقرأ العقود والمواصفات والمستندات التقنية بثقة.',
    featureWritingDesc: 'صياغة التقارير والرسائل والمستندات التقنية باحترافية.',
    featureSpeakingDesc: 'تدرب على النطق والمحادثة مع تغذية راجعة فورية.',
    featureListeningDesc: 'افهم الاجتماعات والمحادثات الميدانية بسهولة.',
    featureGrammarDesc: 'أتقن القواعد التي يستخدمها المهندسون فعلاً في العمل.',
    finalCtaTitle: 'صوتك الهندسي يبدأ',
    finalCtaTitleHighlight: 'من هنا',
    finalCtaSub: 'اختر تخصصك ولغة الواجهة وابدأ إتقان الإنجليزية الهندسية الاحترافية اليوم.',
    finalCtaButton: 'ابدأ مجاناً',
  },
  es: {
    heroBadge: 'EngineerOS • 10 Disciplinas × 15 Idiomas',
    heroTitle1: 'Domine el Inglés',
    heroTitleHighlight: 'Técnico de Ingeniería',
    heroTitle2: 'Para Proyectos Globales',
    heroSubtitle:
      'Elija su disciplina de ingeniería, asegure su plan de estudios y alcance la fluidez C1 con práctica diaria.',
    ctaSelectBranch: 'Seleccionar Disciplina y Empezar',
    ctaViewPlans: 'Ver Planes de Precios',
    badgeNoCard: 'Sin Tarjeta de Crédito',
    badgeLanguages: '15 Idiomas de Interfaz',
    featuresHeaderBadge: 'Módulos de Aprendizaje Básicos',
    featuresTitle: 'Todo lo que Necesitas, en un Solo Lugar',
    featuresSubtitle: 'Seis módulos enfocados para un inglés técnico listo para el trabajo.',
    featureVocabularyDesc: 'Más de 14.000 términos técnicos, estructurados para tu disciplina.',
    featureReadingDesc: 'Lee contratos, especificaciones y documentos técnicos con confianza.',
    featureWritingDesc: 'Redacta informes, correos y documentos técnicos como un profesional.',
    featureSpeakingDesc: 'Practica pronunciación y conversación con feedback instantáneo.',
    featureListeningDesc: 'Entiende reuniones y conversaciones de campo con facilidad.',
    featureGrammarDesc: 'Domina la gramática que los ingenieros realmente usan en el trabajo.',
    finalCtaTitle: 'Tu Voz de Ingeniería Comienza',
    finalCtaTitleHighlight: 'Aquí',
    finalCtaSub:
      'Selecciona tu disciplina, elige el idioma de interfaz y domina el inglés técnico profesional hoy.',
    finalCtaButton: 'Empezar Gratis',
  },
  fr: {
    heroBadge: 'EngineerOS • 10 Disciplines × 15 Langues',
    heroTitle1: "Maîtrisez l'Anglais",
    heroTitleHighlight: 'Technique pour Ingénieurs',
    heroTitle2: 'Projets Internationaux',
    heroSubtitle:
      "Choisissez votre discipline d'ingénierie, verrouillez votre programme et atteignez le niveau C1.",
    ctaSelectBranch: 'Choisir la Discipline & Commencer',
    ctaViewPlans: 'Voir les Tarifs',
    badgeNoCard: 'Sans Carte de Crédit',
    badgeLanguages: 'Interface en 15 Langues',
    featuresHeaderBadge: "Modules d'Apprentissage Essentiels",
    featuresTitle: "Tout ce qu'il Vous Faut, au Même Endroit",
    featuresSubtitle: "Six modules ciblés pour un anglais technique prêt pour l'emploi.",
    featureVocabularyDesc: 'Plus de 14 000 termes techniques, structurés pour votre discipline.',
    featureReadingDesc:
      'Lisez contrats, cahiers des charges et documents techniques avec assurance.',
    featureWritingDesc: 'Rédigez rapports, e-mails et documents techniques comme un pro.',
    featureSpeakingDesc: 'Entraînez prononciation et expression avec un retour instantané.',
    featureListeningDesc: 'Comprenez réunions et conversations de terrain sans effort.',
    featureGrammarDesc: 'Maîtrisez la grammaire réellement utilisée par les ingénieurs.',
    finalCtaTitle: "Votre Voix d'Ingénieur Commence",
    finalCtaTitleHighlight: 'Ici',
    finalCtaSub:
      "Choisissez votre discipline et votre langue d'interface, et maîtrisez l'anglais technique dès aujourd'hui.",
    finalCtaButton: 'Commencer Gratuitement',
  },
  pt: {
    heroBadge: 'EngineerOS • 10 Disciplinas × 15 Idiomas',
    heroTitle1: 'Domine o Inglês',
    heroTitleHighlight: 'Técnico de Engenharia',
    heroTitle2: 'Para Projetos Globais',
    heroSubtitle:
      'Escolha sua disciplina de engenharia, fixe seu currículo e alcance a fluência C1.',
    ctaSelectBranch: 'Selecionar Disciplina e Começar',
    ctaViewPlans: 'Ver Planos e Preços',
    badgeNoCard: 'Sem Cartão de Crédito',
    badgeLanguages: '15 Idiomas de Interface',
    featuresHeaderBadge: 'Módulos Essenciais de Aprendizagem',
    featuresTitle: 'Tudo o que Você Precisa, em um Só Lugar',
    featuresSubtitle: 'Seis módulos focados para um inglês técnico pronto para o trabalho.',
    featureVocabularyDesc: 'Mais de 14.000 termos técnicos, estruturados para sua disciplina.',
    featureReadingDesc: 'Leia contratos, especificações e documentos técnicos com confiança.',
    featureWritingDesc: 'Redija relatórios, e-mails e documentos técnicos como um profissional.',
    featureSpeakingDesc: 'Pratique pronúncia e conversação com feedback imediato.',
    featureListeningDesc: 'Entenda reuniões e conversas de campo com facilidade.',
    featureGrammarDesc: 'Domine a gramática que os engenheiros realmente usam no trabalho.',
    finalCtaTitle: 'Sua Voz de Engenharia Começa',
    finalCtaTitleHighlight: 'Aqui',
    finalCtaSub:
      'Escolha sua disciplina e idioma de interface e domine o inglês técnico profissional hoje.',
    finalCtaButton: 'Começar Grátis',
  },
  ru: {
    heroBadge: 'EngineerOS • 10 Инженерных Направлений × 15 Языков',
    heroTitle1: 'Освойте Технический',
    heroTitleHighlight: 'Английский Язык',
    heroTitle2: 'Для Международных Проектов',
    heroSubtitle:
      'Выберите вашу инженерную специальность, зафиксируйте программу и достигните уровня C1.',
    ctaSelectBranch: 'Выбрать Специальность и Начать',
    ctaViewPlans: 'Посмотреть Тарифы',
    badgeNoCard: 'Без Банковской Карты',
    badgeLanguages: '15 Языков Интерфейса',
    featuresHeaderBadge: 'Основные Учебные Модули',
    featuresTitle: 'Всё Необходимое в Одном Месте',
    featuresSubtitle:
      'Шесть сфокусированных модулей для готового к работе технического английского.',
    featureVocabularyDesc: 'Более 14 000 технических терминов под вашу специальность.',
    featureReadingDesc: 'Читайте контракты, спецификации и техдокументацию уверенно.',
    featureWritingDesc: 'Составляйте отчёты, письма и техдокументы профессионально.',
    featureSpeakingDesc: 'Тренируйте произношение и разговор с мгновенной обратной связью.',
    featureListeningDesc: 'Понимайте встречи и рабочие разговоры без труда.',
    featureGrammarDesc: 'Освойте грамматику, которую инженеры реально используют.',
    finalCtaTitle: 'Ваш Инженерный Голос Начинается',
    finalCtaTitleHighlight: 'Здесь',
    finalCtaSub:
      'Выберите специальность и язык интерфейса и начните осваивать технический английский уже сегодня.',
    finalCtaButton: 'Начать Бесплатно',
  },
  zh: {
    heroBadge: 'EngineerOS • 10大工程专业 × 15种界面语言',
    heroTitle1: '掌握全球项目',
    heroTitleHighlight: '专业工程英语',
    heroTitle2: '达到C1母语级流利度',
    heroSubtitle: '选择并锁定您的专属工程专业，每天10分钟智能练习，提升国际项目沟通能力。',
    ctaSelectBranch: '选择专业并开始',
    ctaViewPlans: '查看价格方案',
    badgeNoCard: '无需信用卡',
    badgeLanguages: '支持15种界面语言',
    featuresHeaderBadge: '核心学习模块',
    featuresTitle: '您所需的一切，尽在一处',
    featuresSubtitle: '六大专注模块，打造真正能上手的工程英语。',
    featureVocabularyDesc: '14,000多个技术术语，按您的专业精准组织。',
    featureReadingDesc: '自信阅读合同、规范和各类技术文档。',
    featureWritingDesc: '专业撰写报告、邮件和技术文件。',
    featureSpeakingDesc: '即时反馈，练就发音与会话。',
    featureListeningDesc: '轻松听懂会议和现场沟通。',
    featureGrammarDesc: '掌握工程师真正用得上的语法。',
    finalCtaTitle: '您的工程之声',
    finalCtaTitleHighlight: '从这里开始',
    finalCtaSub: '选择专业与界面语言，今天就开始掌握专业工程英语。',
    finalCtaButton: '免费开始',
  },
  ja: {
    heroBadge: 'EngineerOS • 10の工学分野 × 15言語対応',
    heroTitle1: 'グローバルプロジェクトのための',
    heroTitleHighlight: '専門工学英語を',
    heroTitle2: 'C1レベルへ引き上げる',
    heroSubtitle:
      '専攻する工学分野を1つ選択・固定し、1日10分のスマート学習で国際プロジェクトでの実践力を身につけます。',
    ctaSelectBranch: '専攻分野を選択して開始',
    ctaViewPlans: '料金プランを見る',
    badgeNoCard: 'クレジットカード不要',
    badgeLanguages: '15言語UI対応',
    featuresHeaderBadge: 'コア学習モジュール',
    featuresTitle: '必要なものすべてを一か所に',
    featuresSubtitle: '実務で使える工学英語を磨く、6つの集中モジュール。',
    featureVocabularyDesc: '専攻分野に合わせて構成された14,000以上の専門用語。',
    featureReadingDesc: '契約書・仕様書・技術文書を自信を持って読む。',
    featureWritingDesc: 'レポート・メール・技術文書をプロ並みに書く。',
    featureSpeakingDesc: '即時フィードバックで発音と会話を練習。',
    featureListeningDesc: '会議や現場の会話をスムーズに理解。',
    featureGrammarDesc: 'エンジニアが実際に使う文法をマスター。',
    finalCtaTitle: 'あなたのエンジニアの声が',
    finalCtaTitleHighlight: 'ここから始まる',
    finalCtaSub: '専攻分野とUI言語を選び、プロフェッショナルな工学英語の習得を今日始めましょう。',
    finalCtaButton: '無料で始める',
  },
  it: {
    heroBadge: 'EngineerOS • 10 Discipline di Ingegneria × 15 Lingue',
    heroTitle1: "Perfeziona l'Inglese",
    heroTitleHighlight: 'Tecnico per Ingegneri',
    heroTitle2: 'Per Progetti Globali',
    heroSubtitle: 'Scegli la tua disciplina, blocca il tuo programma e raggiungi la fluidità C1.',
    ctaSelectBranch: 'Seleziona Disciplina e Inizia',
    ctaViewPlans: 'Vedi i Piani',
    badgeNoCard: 'Nessuna Carta di Credito Richiesta',
    badgeLanguages: 'Interfaccia in 15 Lingue',
    featuresHeaderBadge: 'Moduli di Apprendimento Essenziali',
    featuresTitle: 'Tutto Ciò che Ti Serve, in Un Unico Posto',
    featuresSubtitle: 'Sei moduli mirati per un inglese tecnico pronto per il lavoro.',
    featureVocabularyDesc: 'Oltre 14.000 termini tecnici, strutturati per la tua disciplina.',
    featureReadingDesc: 'Leggi contratti, specifiche e documenti tecnici con sicurezza.',
    featureWritingDesc: 'Scrivi report, e-mail e documenti tecnici come un professionista.',
    featureSpeakingDesc: 'Esercita pronuncia e conversazione con feedback immediato.',
    featureListeningDesc: 'Comprendi riunioni e conversazioni sul campo con facilità.',
    featureGrammarDesc: 'Padroneggia la grammatica che gli ingegneri usano davvero.',
    finalCtaTitle: 'La Tua Voce di Ingegnere Inizia',
    finalCtaTitleHighlight: 'Qui',
    finalCtaSub:
      "Scegli la tua disciplina e la lingua dell'interfaccia e inizia a padroneggiare l'inglese tecnico oggi.",
    finalCtaButton: 'Inizia Gratis',
  },
  vi: {
    heroBadge: 'EngineerOS • 10 Ngành Kỹ Thuật × 15 Ngôn Ngữ',
    heroTitle1: 'Thành Thạo Tiếng Anh',
    heroTitleHighlight: 'Kỹ Thuật Chuyên Ngành',
    heroTitle2: 'Cho Dự Án Toàn Cầu',
    heroSubtitle:
      'Chọn ngành kỹ thuật của bạn, khóa lộ trình học và đạt trình độ C1 qua thực hành mỗi ngày.',
    ctaSelectBranch: 'Chọn Ngành & Bắt Đầu',
    ctaViewPlans: 'Xem Bảng Giá',
    badgeNoCard: 'Không Cần Thẻ Tín Dụng',
    badgeLanguages: '15 Ngôn Ngữ Giao Diện',
    featuresHeaderBadge: 'Mô-đun Học Tập Cốt Lõi',
    featuresTitle: 'Mọi Thứ Bạn Cần, Tại Một Nơi',
    featuresSubtitle: 'Sáu mô-đun tập trung xây dựng tiếng Anh kỹ thuật sẵn sàng cho công việc.',
    featureVocabularyDesc: 'Hơn 14.000 thuật ngữ kỹ thuật, cấu trúc theo ngành của bạn.',
    featureReadingDesc: 'Đọc hợp đồng, thông số và tài liệu kỹ thuật một cách tự tin.',
    featureWritingDesc: 'Soạn báo cáo, email và tài liệu kỹ thuật chuyên nghiệp.',
    featureSpeakingDesc: 'Luyện phát âm và nói với phản hồi tức thì.',
    featureListeningDesc: 'Hiểu cuộc họp và hội thoại công trường dễ dàng.',
    featureGrammarDesc: 'Nắm vững ngữ pháp mà kỹ sư thực sự dùng trong công việc.',
    finalCtaTitle: 'Giọng Nói Kỹ Thuật Của Bạn Bắt Đầu',
    finalCtaTitleHighlight: 'Tại Đây',
    finalCtaSub:
      'Chọn ngành và ngôn ngữ giao diện, và bắt đầu thành thạo tiếng Anh kỹ thuật ngay hôm nay.',
    finalCtaButton: 'Bắt Đầu Miễn Phí',
  },
  pl: {
    heroBadge: 'EngineerOS • 10 Dziedzin Inżynierii × 15 Języków',
    heroTitle1: 'Opanuj Profesjonalny',
    heroTitleHighlight: 'Język Angielski Inżynieryjny',
    heroTitle2: 'Dla Projektów Globalnych',
    heroSubtitle:
      'Wybierz swoją specjalizację inżynieryjną, zablokuj program i osiągnij biegłość C1.',
    ctaSelectBranch: 'Wybierz Specjalizację i Rozpocznij',
    ctaViewPlans: 'Zobacz Cennik',
    badgeNoCard: 'Karta Kredytowa Nie Jest Wymagana',
    badgeLanguages: '15 Języków Interfejsu',
    featuresHeaderBadge: 'Podstawowe Moduły Nauki',
    featuresTitle: 'Wszystko, Czego Potrzebujesz, w Jednym Miejscu',
    featuresSubtitle:
      'Sześć ukierunkowanych modułów budujących gotowy do pracy angielski techniczny.',
    featureVocabularyDesc: 'Ponad 14 000 terminów technicznych dla Twojej dziedziny.',
    featureReadingDesc: 'Czytaj umowy, specyfikacje i dokumenty techniczne pewnie.',
    featureWritingDesc: 'Twórz raporty, e-maile i dokumenty techniczne jak profesjonalista.',
    featureSpeakingDesc: 'Ćwicz wymowę i mówienie z natychmiastową informacją zwrotną.',
    featureListeningDesc: 'Rozumiej spotkania i rozmowy w terenie bez wysiłku.',
    featureGrammarDesc: 'Opanuj gramatykę, której inżynierowie naprawdę używają.',
    finalCtaTitle: 'Twój Inżynierski Głos Zaczyna Się',
    finalCtaTitleHighlight: 'Tutaj',
    finalCtaSub:
      'Wybierz specjalizację i język interfejsu, i zacznij opanowywać techniczny angielski już dziś.',
    finalCtaButton: 'Zacznij Za Darmo',
  },
  id: {
    heroBadge: 'EngineerOS • 10 Disiplin Teknik × 15 Bahasa',
    heroTitle1: 'Kuasai Bahasa Inggris',
    heroTitleHighlight: 'Teknik Profesional',
    heroTitle2: 'Untuk Proyek Global',
    heroSubtitle:
      'Pilih disiplin teknik Anda, kunci kurikulum Anda, dan capai kelancaran C1 dengan latihan harian.',
    ctaSelectBranch: 'Pilih Disiplin & Mulai',
    ctaViewPlans: 'Lihat Paket Harga',
    badgeNoCard: 'Tanpa Kartu Kredit',
    badgeLanguages: '15 Bahasa Antarmuka',
    featuresHeaderBadge: 'Modul Pembelajaran Inti',
    featuresTitle: 'Semua yang Anda Butuhkan, di Satu Tempat',
    featuresSubtitle: 'Enam modul terfokus yang membangun bahasa Inggris teknik siap kerja.',
    featureVocabularyDesc: 'Lebih dari 14.000 istilah teknis, terstruktur untuk disiplin Anda.',
    featureReadingDesc: 'Baca kontrak, spesifikasi, dan dokumen teknis dengan percaya diri.',
    featureWritingDesc: 'Susun laporan, email, dan dokumen teknis secara profesional.',
    featureSpeakingDesc: 'Latih pelafalan dan berbicara dengan umpan balik instan.',
    featureListeningDesc: 'Pahami rapat dan percakapan lapangan dengan mudah.',
    featureGrammarDesc: 'Kuasai tata bahasa yang benar-benar digunakan insinyur.',
    finalCtaTitle: 'Suara Teknik Anda Dimulai',
    finalCtaTitleHighlight: 'Di Sini',
    finalCtaSub:
      'Pilih disiplin dan bahasa antarmuka Anda, dan mulailah menguasai bahasa Inggris teknik hari ini.',
    finalCtaButton: 'Mulai Gratis',
  },
  nl: {
    heroBadge: 'EngineerOS • 10 Ingenieursdisciplines × 15 Talen',
    heroTitle1: 'Beheers Professioneel',
    heroTitleHighlight: 'Engels voor Ingenieurs',
    heroTitle2: 'Voor Globale Projecten',
    heroSubtitle:
      'Kies uw ingenieursdiscipline, vergrendel uw curriculum en bereik C1-communicatievaardigheid.',
    ctaSelectBranch: 'Kies Discipline & Start',
    ctaViewPlans: 'Bekijk Tarieven',
    badgeNoCard: 'Geen Creditcard Nodig',
    badgeLanguages: '15 Interfacetalen',
    featuresHeaderBadge: 'Kernleermodules',
    featuresTitle: 'Alles Wat U Nodig Heeft, op Één Plek',
    featuresSubtitle: 'Zes gerichte modules voor werkklare technisch Engels.',
    featureVocabularyDesc: 'Meer dan 14.000 technische termen, afgestemd op uw discipline.',
    featureReadingDesc: 'Lees contracten, specificaties en technische documenten vol vertrouwen.',
    featureWritingDesc: 'Schrijf rapporten, e-mails en technische documenten als een pro.',
    featureSpeakingDesc: 'Oefen uitspraak en spreken met directe feedback.',
    featureListeningDesc: 'Versta vergaderingen en veldgesprekken moeiteloos.',
    featureGrammarDesc: 'Beheers de grammatica die ingenieurs echt gebruiken.',
    finalCtaTitle: 'Uw Ingenieursstem Begint',
    finalCtaTitleHighlight: 'Hier',
    finalCtaSub:
      'Kies uw discipline en interfacetaal en beheers vandaag nog professioneel ingenieursengels.',
    finalCtaButton: 'Gratis Starten',
  },
};

export const getLandingTranslations = (lang: SupportedInterfaceLanguage): LandingTranslations => {
  return LANDING_I18N[lang] || LANDING_I18N.en;
};
