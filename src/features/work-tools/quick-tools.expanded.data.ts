import type { MeetingPhrase, SiteDictionaryTerm } from './quick-tools.data';

const MEETING_TOPICS = [
  [
    'Interrupt',
    'add one technical point before the discussion moves on',
    'konu ilerlemeden önce bir teknik nokta eklemek',
  ],
  [
    'Agree',
    'confirm that the proposed sequence is workable',
    'önerilen sıranın uygulanabilir olduğunu teyit etmek',
  ],
  [
    'Disagree',
    'explain a technical concern without creating conflict',
    'çatışma oluşturmadan teknik kaygıyı açıklamak',
  ],
  [
    'Clarify',
    'separate a confirmed commitment from an indicative date',
    'kesin taahhüt ile tahmini tarihi ayırmak',
  ],
  [
    'Summarize',
    'close the discussion with decisions and open actions',
    'görüşmeyi kararlar ve açık aksiyonlarla özetlemek',
  ],
  [
    'Ask for confirmation',
    'turn the discussion into a recorded commitment',
    'görüşmeyi kayıtlı bir taahhüde dönüştürmek',
  ],
  [
    'Push back politely',
    'set a safe and realistic delivery boundary',
    'güvenli ve gerçekçi bir teslim sınırı koymak',
  ],
  [
    'Explain delay',
    'state cause, impact and mitigation without blame',
    'suçlayıcı olmadan neden, etki ve telafiyi açıklamak',
  ],
  [
    'Report progress',
    'give measurable installation and testing status',
    'ölçülebilir montaj ve test durumu vermek',
  ],
  [
    'Close action item',
    'close an action only after evidence is accepted',
    'aksiyonu yalnızca kanıt kabul edildikten sonra kapatmak',
  ],
  [
    'Escalate issue politely',
    'request management support for a milestone risk',
    'kilometre taşı riski için yönetim desteği istemek',
  ],
  [
    'Request responsibility',
    'identify one accountable action owner',
    'tek bir sorumlu aksiyon sahibini belirlemek',
  ],
  [
    'Ask for deadline',
    'obtain a firm completion date',
    'kesin bir bitiş tarihi almak',
  ],
  [
    'Confirm scope',
    'define what is included and excluded',
    'kapsama dahil ve hariç olanları tanımlamak',
  ],
  [
    'Challenge unclear instruction',
    'request a written and technically complete instruction',
    'yazılı ve teknik olarak eksiksiz talimat istemek',
  ],
  [
    'Request site access',
    'secure a safe work window and access route',
    'güvenli çalışma zamanı ve erişim güzergâhı sağlamak',
  ],
  [
    'Ask for priority',
    'resolve competing work-front priorities',
    'çakışan çalışma alanı önceliklerini çözmek',
  ],
  [
    'Confirm next step',
    'record the immediate action after the meeting',
    'toplantı sonrası ilk aksiyonu kaydetmek',
  ],
  [
    'Handle consultant comment',
    'respond with evidence and a closure request',
    'kanıt ve kapanış talebiyle cevap vermek',
  ],
  [
    'Handle contractor excuse',
    'redirect an excuse toward recovery action',
    'mazereti telafi aksiyonuna yönlendirmek',
  ],
] as const;

const MEETING_PATTERNS = [
  {
    phrase: (topic: string) => `May I pause here so we can ${topic}?`,
    meaning: (topic: string) =>
      `Burada durup ${topic} için ilerleyebilir miyiz?`,
    example: (topic: string) =>
      `Before we close this item, may I pause here so we can ${topic}?`,
    tone: 'Polite and controlled',
  },
  {
    phrase: (topic: string) => `For the record, we need to ${topic}.`,
    meaning: (topic: string) => `Kayıt açısından ${topic} gerekiyor.`,
    example: (topic: string) =>
      `For the record, we need to ${topic} before the minutes are issued.`,
    tone: 'Formal and factual',
  },
  {
    phrase: (topic: string) => `Can we agree now to ${topic}?`,
    meaning: (topic: string) => `Şimdi ${topic} konusunda anlaşabilir miyiz?`,
    example: (topic: string) =>
      `Can we agree now to ${topic}, with the decision shown in the action log?`,
    tone: 'Collaborative',
  },
  {
    phrase: (topic: string) => `The project sequence requires us to ${topic}.`,
    meaning: (topic: string) => `Proje sırası ${topic} gerektiriyor.`,
    example: (topic: string) =>
      `The project sequence requires us to ${topic} before tomorrow’s work starts.`,
    tone: 'Firm and professional',
  },
];

export const EXPANDED_MEETING_PHRASES: MeetingPhrase[] = MEETING_TOPICS.flatMap(
  ([category, topic, turkishTopic], categoryIndex) =>
    MEETING_PATTERNS.map((pattern, patternIndex) => ({
      id: `meeting-expanded-${categoryIndex + 1}-${patternIndex + 1}`,
      category,
      phrase: pattern.phrase(topic),
      turkishMeaning: pattern.meaning(turkishTopic),
      whenToUse: topic.charAt(0).toUpperCase() + topic.slice(1),
      example: pattern.example(topic),
      tone: pattern.tone,
      tags: [category.toLowerCase(), 'meeting', 'site communication'],
    }))
);

const TERM_PACKS: Record<string, string> = {
  Electrical:
    'busbar|bara;earthing|topraklama;grounding|topraklama sistemi;bonding|eş potansiyel kuşaklama;cable tray|kablo tavası;cable ladder|kablo merdiveni;trunking|kablo kanalı;conduit|boru tesisatı;containment|kablo taşıma sistemi;termination|kablo sonlandırma;gland|kablo rakoru;lug|kablo pabucu;ferrule|kablo yüksüğü;insulation resistance|yalıtım direnci;continuity test|süreklilik testi;phase sequence|faz sırası;energization|enerjilendirme;isolation|izolasyon;lockout/tagout|kilitleme ve etiketleme;switchgear|şalt sistemi;LV panel|AG panosu;MV panel|OG panosu;transformer|transformatör;generator|jeneratör;ATS|otomatik transfer panosu;UPS|kesintisiz güç kaynağı;distribution board|dağıtım panosu;lighting circuit|aydınlatma devresi;fire alarm loop|yangın alarm çevrimi;cause-and-effect matrix|sebep-sonuç matrisi;protective relay|koruma rölesi;circuit breaker|devre kesici;earth fault|toprak arızası;voltage drop|gerilim düşümü;selectivity study|selektivite çalışması',
  Mechanical:
    'chilled water|soğutulmuş su;hydronic balancing|hidronik dengeleme;valve|vana;actuator|aktüatör;damper|damper;fire damper|yangın damperi;pump|pompa;AHU|klima santrali;FCU|fan coil ünitesi;ductwork|hava kanalı;pipework|borulama;insulation|yalıtım;pressure test|basınç testi;flushing|yıkama işlemi;commissioning|devreye alma;BMS interface|BMS arayüzü;mechanical clearance|mekanik açıklık;strainer|pislik tutucu;expansion vessel|genleşme tankı;heat exchanger|ısı eşanjörü;balancing valve|balans vanası;control valve|kontrol vanası;flexible connection|esnek bağlantı;vibration isolator|titreşim izolatörü;static pressure|statik basınç;differential pressure|diferansiyel basınç;flow rate|debi;design temperature|tasarım sıcaklığı;airflow measurement|hava debisi ölçümü;duct leakage test|kanal sızdırmazlık testi;water treatment|su şartlandırma;drainage slope|drenaj eğimi;refrigerant line|soğutucu akışkan hattı;condensate drain|yoğuşma drenajı;sequence of operation|çalışma senaryosu',
  Civil:
    'slab|döşeme;beam|kiriş;column|kolon;foundation|temel;reinforcement|donatı;formwork|kalıp;concrete cover|beton örtüsü;construction joint|inşaat derzi;expansion joint|genleşme derzi;anchor bolt|ankraj cıvatası;grouting|harç doldurma;survey point|ölçüm noktası;level benchmark|kot röperi;excavation|kazı;backfilling|dolgu;compaction|sıkıştırma;retaining wall|istinat duvarı;waterproofing|su yalıtımı;screed|şap;curing|beton kürü;core drilling|karot delme;embedded plate|gömülü plaka;starter bar|filiz donatısı;pile cap|kazık başlığı;blinding concrete|grobeton;soil bearing capacity|zemin taşıma kapasitesi;settlement|oturma;deflection|sehim;load test|yük testi;concrete cube test|beton küp testi;rebar schedule|donatı açılımı;method statement|yöntem beyanı;temporary works|geçici işler;structural opening|yapısal boşluk;as-built survey|uygulama sonrası ölçüm',
  Architectural:
    'shaft|şaft;sleeve|manşon;opening|boşluk;blockwork|duvar örme;plastering|sıva;false ceiling|asma tavan;access panel|erişim kapağı;penetration|geçiş;fire stopping|yangın durdurucu uygulama;finishing works|ince işler;partition wall|bölme duvar;door schedule|kapı çizelgesi;ironmongery|kapı donanımı;floor finish|zemin kaplaması;wall finish|duvar kaplaması;ceiling grid|tavan taşıyıcı sistemi;skirting|süpürgelik;sealant|mastik;acoustic insulation|akustik yalıtım;thermal insulation|ısı yalıtımı;facade access|cephe erişimi;curtain wall|giydirme cephe;mock-up|numune uygulama;sample board|malzeme numune panosu;room data sheet|mahal bilgi föyü;reflected ceiling plan|tavan planı;architectural detail|mimari detay;clear opening|net geçiş açıklığı;finished floor level|bitmiş döşeme kotu;threshold|eşik;waterproof membrane|su yalıtım membranı;movement joint|hareket derzi;paint system|boya sistemi;tile layout|seramik yerleşimi;snagging|kusur tespiti',
  'QA/QC':
    'NCR|uygunsuzluk raporu;MIR|malzeme kontrol talebi;WIR|iş kontrol talebi;ITP|kontrol ve test planı;hold point|bekletme noktası;witness point|şahitlik noktası;inspection request|kontrol talebi;checklist|kontrol listesi;snag|kusur;punch list|eksik işler listesi;corrective action|düzeltici faaliyet;preventive action|önleyici faaliyet;re-inspection|yeniden kontrol;approval|onay;rejection|ret;compliance|uygunluk;deviation|sapma;nonconformity|uygunsuzluk;traceability|izlenebilirlik;calibration certificate|kalibrasyon sertifikası;material certificate|malzeme sertifikası;test record|test kaydı;inspection lot|kontrol partisi;acceptance criteria|kabul kriteri;method statement review|yöntem beyanı incelemesi;document status|doküman durumu;comment response sheet|yorum cevap formu;close-out evidence|kapanış kanıtı;quality observation|kalite gözlemi;root cause|kök neden;verification|doğrulama;validation|geçerleme;release note|serbest bırakma notu;red-line drawing|kırmızı işaretli çizim;quality dossier|kalite dosyası',
  HSE: 'permit to work|çalışma izni;toolbox talk|işbaşı güvenlik konuşması;risk assessment|risk değerlendirmesi;method statement|yöntem beyanı;lifting plan|kaldırma planı;hot work|sıcak çalışma;confined space|kapalı alan;PPE|kişisel koruyucu donanım;isolation|izolasyon;barricade|bariyer;hazard|tehlike;incident|olay;near miss|ramak kala;working at height|yüksekte çalışma;scaffold tag|iskele etiketi;rescue plan|kurtarma planı;emergency route|acil durum güzergâhı;fire watch|yangın gözcüsü;gas test|gaz testi;lifting gear|kaldırma ekipmanı;safe working load|güvenli çalışma yükü;exclusion zone|yasaklı bölge;spotter|işaretçi;housekeeping|düzen ve temizlik;unsafe act|güvensiz hareket;unsafe condition|güvensiz durum;job safety analysis|iş güvenliği analizi;energy isolation|enerji izolasyonu;arc flash boundary|ark parlaması sınırı;fall protection|düşmeye karşı koruma;chemical handling|kimyasal madde kullanımı;spill response|dökülme müdahalesi;emergency drill|acil durum tatbikatı;safety observation|güvenlik gözlemi;stop work authority|iş durdurma yetkisi',
  Commissioning:
    'pre-commissioning|ön devreye alma;functional test|fonksiyon testi;integrated test|entegre test;SAT|saha kabul testi;FAT|fabrika kabul testi;load test|yük testi;energization permit|enerjilendirme izni;test report|test raporu;cause-and-effect test|sebep-sonuç testi;sequence of operation|çalışma senaryosu;testing procedure|test prosedürü;commissioning checklist|devreye alma kontrol listesi;point-to-point test|noktadan noktaya test;loop check|çevrim kontrolü;interface test|arayüz testi;performance test|performans testi;reliability run|güvenilirlik çalışması;witness test|şahitli test;test instrument|test cihazı;temporary power|geçici güç;system readiness|sistem hazırlığı;commissioning plan|devreye alma planı;test pack|test paketi;defect log|kusur kaydı;issue register|sorun kaydı;set point|ayar değeri;alarm simulation|alarm simülasyonu;trip test|açma testi;interlock test|kilitleme testi;black start test|kara başlatma testi;load bank|yük bankası;handover certificate|teslim sertifikası;training record|eğitim kaydı;O&M manual|işletme ve bakım kılavuzu;seasonal testing|mevsimsel test',
  Procurement:
    'lead time|tedarik süresi;purchase order|satın alma siparişi;delivery note|teslimat irsaliyesi;material approval|malzeme onayı;technical submittal|teknik sunum;compliance statement|uygunluk beyanı;certificate|sertifika;warranty|garanti;spare parts|yedek parçalar;vendor|tedarikçi;manufacturer|üretici;alternative proposal|alternatif teklif;request for quotation|fiyat talebi;technical bid evaluation|teknik teklif değerlendirmesi;commercial offer|ticari teklif;ex-works date|fabrika çıkış tarihi;shipping document|sevkiyat belgesi;packing list|çeki listesi;country of origin|menşe ülke;material release|malzeme serbest bırakma;expediting|tedarik hızlandırma;factory inspection|fabrika kontrolü;approved supplier|onaylı tedarikçi;sample approval|numune onayı;batch certificate|parti sertifikası;data sheet|teknik föy;delivery schedule|teslimat programı;required-on-site date|sahada gerekli tarih;partial delivery|kısmi teslimat;storage requirement|depolama gereksinimi;procurement log|tedarik kaydı;vendor drawing|tedarikçi çizimi;manufacturing status|üretim durumu;freight forwarder|nakliye organizatörü;customs clearance|gümrük işlemleri',
  'Site Management':
    'look-ahead programme|kısa vadeli iş programı;critical path|kritik yol;progress report|ilerleme raporu;manpower|iş gücü;productivity|verimlilik;coordination meeting|koordinasyon toplantısı;site instruction|saha talimatı;access issue|erişim sorunu;obstruction|engel;handover|teslim;milestone|kilometre taşı;delay mitigation|gecikme telafisi;work front|çalışma alanı;daily report|günlük rapor;weekly report|haftalık rapor;baseline programme|temel iş programı;recovery plan|telafi planı;resource loading|kaynak yüklemesi;site logistics|saha lojistiği;temporary facility|geçici tesis;material storage|malzeme depolama;work permit|çalışma izni;interface register|arayüz kaydı;action tracker|aksiyon takip listesi;constraint log|engel kaydı;progress measurement|ilerleme ölçümü;earned value|kazanılmış değer;site diary|saha günlüğü;mobilization|mobilizasyon;demobilization|demobilizasyon;area release|alan teslimi;work sequence|iş sırası;shift work|vardiyalı çalışma;completion certificate|tamamlama sertifikası;lessons learned|çıkarılan dersler',
};

const CATEGORY_EXPLANATION: Record<string, string> = {
  Electrical: 'electrical distribution, installation, protection or testing',
  Mechanical: 'mechanical services, HVAC, water systems or equipment operation',
  Civil: 'structural, concrete, earthwork or civil construction',
  Architectural:
    'architectural coordination, access, finishes or life-safety detailing',
  'QA/QC': 'inspection, traceability, acceptance and quality close-out',
  HSE: 'hazard control, safe systems of work and incident prevention',
  Commissioning: 'system readiness, testing, integration and handover',
  Procurement:
    'technical procurement, manufacturing, delivery and vendor control',
  'Site Management':
    'programme, resources, coordination and site delivery control',
};

const EXAMPLE_PATTERNS = [
  (term: string) =>
    `Confirm the ${term} requirement against the approved drawing before work starts.`,
  (term: string) =>
    `The supervisor recorded the ${term} status in today’s site report.`,
  (term: string) =>
    `Please include the ${term} evidence in the inspection package.`,
  (term: string) =>
    `The coordination team must close the ${term} issue before the next activity.`,
  (term: string) =>
    `Verify the ${term} during the joint site walk and record any exception.`,
];

export const EXPANDED_SITE_DICTIONARY: SiteDictionaryTerm[] = Object.entries(
  TERM_PACKS
).flatMap(([category, packed], categoryIndex) =>
  packed.split(';').map((pair, termIndex) => {
    const [term, turkishMeaning] = pair.split('|');
    return {
      id: `dictionary-expanded-${categoryIndex + 1}-${termIndex + 1}`,
      term,
      turkishMeaning,
      technicalExplanation: `${term} is a professional term used when documenting ${CATEGORY_EXPLANATION[category]}. Its acceptance must follow the applicable project drawing, specification, method or test criteria.`,
      siteExample: EXAMPLE_PATTERNS[termIndex % EXAMPLE_PATTERNS.length](term),
      commonWrongUsage: `Do not use “${term}” as a general substitute for a different component, activity or approval status; keep the project-specific meaning.`,
      relatedTerms: packed
        .split(';')
        .slice(Math.max(0, termIndex - 1), termIndex + 2)
        .map((item) => item.split('|')[0])
        .filter((item) => item !== term),
      category,
      tags: [category.toLowerCase(), 'site dictionary', 'engineering term'],
    };
  })
);
