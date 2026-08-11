import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'speaking' | 'writing' | 'listening';

export interface DuolingoQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  term: string;
  correctAnswer: string;
  options?: string[];
  turkishMeaning?: string;
  explanation?: string;
  audioText?: string;
}

export interface DuolingoLevel {
  id: string;
  unitId: string;
  title: string;
  orderIndex: number;
  xpReward: number;
  questionCount: number;
  iconName: string;
  questions: DuolingoQuestion[];
}

export interface DuolingoUnit {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  discipline: EngineeringDiscipline;
  colorHex: string;
  bgGradient: string;
  levels: DuolingoLevel[];
}

// Sample Curricula definitions per discipline
const DISCIPLINE_TITLES: Record<EngineeringDiscipline, { unit1: string; unit2: string; unit3: string }> = {
  civil: {
    unit1: 'Temel İnşaat Terimleri & Yapı',
    unit2: 'Geoteknik & Beton Teknolojisi',
    unit3: 'Proje Yönetimi & Şantiye Güvenliği',
  },
  electrical: {
    unit1: 'Temel Elektrik & Devre Elemanları',
    unit2: 'Güç Sistemleri & Transformatörler',
    unit3: 'Otomasyon & Yenilenebilir Enerji',
  },
  mechanical: {
    unit1: 'Termodinamik & Akışkanlar Mekaniği',
    unit2: 'Makine Elemanları & Üretim',
    unit3: 'HVAC & Isıl İşlemler',
  },
  software: {
    unit1: 'Algoritmalar & Veri Yapıları',
    unit2: 'Web & Veritabanı Sistemleri',
    unit3: 'Bulut Bilişim & AI Mühendisliği',
  },
  architecture: {
    unit1: 'Mimari Tasarım & Yapı Elemanları',
    unit2: 'İç Mimari & Restorasyon',
    unit3: 'Sürdürülebilir Mimarlık & BIM',
  },
  chemical: {
    unit1: 'Kimyasal Reaksiyonlar & Laboratuvar',
    unit2: 'Kütle & Isı Transferi',
    unit3: 'Polimer & Proses Güvenliği',
  },
  electronics: {
    unit1: 'Mikrodenetleyiciler & Yarı İletkenler',
    unit2: 'Sinyal İşleme & Haberleşme',
    unit3: 'Gömülü Sistemler & PCB Tasarımı',
  },
  industrial: {
    unit1: 'Yöneylem Araştırması & Lojistik',
    unit2: 'Kalite Kontrol & Yalın Üretim',
    unit3: 'Tedarik Zinciri & Ergonomi',
  },
  mechatronics: {
    unit1: 'Sensörler & Aktüatörler',
    unit2: 'Robotik Kontrol & Kinematik',
    unit3: 'PLC & Endüstriyel Otomasyon',
  },
  hse: {
    unit1: 'İş Sağlığı & Güvenliği Temelleri',
    unit2: 'Risk Değerlendirme & Risk Yönetimi',
    unit3: 'Çevre Sağlığı & Atık Yönetimi',
  },
};

const SAMPLE_TERMS_BY_DISCIPLINE: Record<
  EngineeringDiscipline,
  Array<{ term: string; tr: string; def: string; sentence: string }>
> = {
  civil: [
    { term: 'Reinforced Concrete', tr: 'Betonarme', def: 'Beton ve çeliğin birlikte kullanıldığı yapı malzemesi', sentence: 'The beam is made of reinforced concrete.' },
    { term: 'Foundation', tr: 'Temel', def: 'Yapının yükünü zemine aktaran alt eleman', sentence: 'The foundation must be inspected before pouring concrete.' },
    { term: 'Beam', tr: 'Kiriş', def: 'Yatay taşıyıcı eleman', sentence: 'Steel beams support the floor panels.' },
    { term: 'Load-bearing', tr: 'Taşıyıcı', def: 'Yük taşıma kapasitesine sahip eleman', sentence: 'Do not remove this load-bearing wall.' },
    { term: 'Scaffolding', tr: 'İskele', def: 'Şantiyelerde kurulan geçici çalışma platformu', sentence: 'Workers erected scaffolding around the tower.' },
    { term: 'Retaining Wall', tr: 'Istinat Duvarı', def: 'Toprak kaymasını önleyen duvar', sentence: 'The retaining wall holds back the hillside.' },
  ],
  electrical: [
    { term: 'Transformer', tr: 'Transformatör', def: 'Gerilimi değiştiren elektrik ekipmanı', sentence: 'The transformer stepped down the voltage.' },
    { term: 'Circuit Breaker', tr: 'Devre Kesici', def: 'Aşırı akımda devreyi açan koruma elemanı', sentence: 'The circuit breaker tripped during the power surge.' },
    { term: 'Alternating Current', tr: 'Alternatif Akım', def: 'Yönü periyodik olarak değişen akım', sentence: 'Homes receive power via alternating current.' },
    { term: 'Impedance', tr: 'Empedans', def: 'Alternatif akıma karşı gösterilen toplam direnç', sentence: 'Measure the input impedance of the amplifier.' },
    { term: 'Short Circuit', tr: 'Kısa Devre', def: 'İki iletkenin istemeden temas etmesi', sentence: 'A short circuit caused the fuse to blow.' },
    { term: 'Substation', tr: 'Trafo Merkezi', def: 'Elektrik dağıtım ve dönüştürme tesisi', sentence: 'Power flows from the substation to the grid.' },
  ],
  software: [
    { term: 'API Endpoint', tr: 'API Uç Noktası', def: 'Sunucudaki belirli bir kaynağa erişim adresi', sentence: 'The mobile app calls the REST API endpoint.' },
    { term: 'Concurrency', tr: 'Eşzamanlılık', def: 'Birden fazla görevin aynı anda yürütülmesi', sentence: 'Go handles high concurrency efficiently.' },
    { term: 'Dependency Injection', tr: 'Bağımlılık Enjeksiyonu', def: 'Bileşenlerin bağımlılıklarının dışarıdan verilmesi', sentence: 'Use dependency injection for better testability.' },
    { term: 'Refactoring', tr: 'Kod İyileştirme (Refactoring)', def: 'Davranışı değiştirmeden kod yapısını düzenleme', sentence: 'Refactoring improved execution speed.' },
    { term: 'Middleware', tr: 'Ara Yazılım', def: 'İstek ile yanıt arasında çalışan yazılım katmanı', sentence: 'Authentication is handled by middleware.' },
    { term: 'Deployment', tr: 'Dağıtım / Yayına Alma', def: 'Uygulamanın sunucuya yüklenip çalıştırılması', sentence: 'Automated deployment reduces production bugs.' },
  ],
  mechanical: [
    { term: 'Torque', tr: 'Tork / Dönme Momenti', def: 'Döndürme kuvveti', sentence: 'The engine generates high torque at low RPM.' },
    { term: 'Fluid Mechanics', tr: 'Akışkanlar Mekaniği', def: 'Sıvı ve gazların hareketini inceleyen bilim', sentence: 'Fluid mechanics explains pressure drops in pipes.' },
    { term: 'Heat Exchanger', tr: 'Isı Değiştirici', def: 'İki akışkan arasında ısı transferi sağlayan cihaz', sentence: 'Clean the heat exchanger tubes regularly.' },
    { term: 'Bearing', tr: 'Rulman / Yatak', def: 'Sürtünmeyi azaltarak dönmeyi sağlayan makine elemanı', sentence: 'Replace the worn ball bearing immediately.' },
    { term: 'Turbine', tr: 'Türbin', def: 'Akışkan enerjisini mekanik enerjiye çeviren makine', sentence: 'Gas turbines power the generator.' },
    { term: 'Compressor', tr: 'Kompresör', def: 'Gazın basıncını artıran makine', sentence: 'The air compressor operates automatically.' },
  ],
  architecture: [
    { term: 'Facade', tr: 'Cephe', def: 'Binanın dışa bakan yüzü', sentence: 'The glass facade reflects the blue sky.' },
    { term: 'Blueprint', tr: 'Mimari Plan / Pafta', def: 'Teknik mimari çizim', sentence: 'Review the blueprint before starting construction.' },
    { term: 'Column', tr: 'Kolon / Sütun', def: 'Düşey taşıyıcı eleman', sentence: 'Marble columns line the main entrance.' },
    { term: 'Elevation', tr: 'Görünüş / Yükseklik Çizimi', def: 'Dikey düzlemdeki mimari çizim', sentence: 'Check the south elevation drawing.' },
    { term: 'Spatial Layout', tr: 'Mekansal Yerleşim', def: 'Alanların fonksiyonel düzeni', sentence: 'Efficient spatial layout improves natural lighting.' },
    { term: 'Atrium', tr: 'Avlu / Aydınlık', def: 'Bina merkezindeki geniş açık alan', sentence: 'Natural sunlight floods the central atrium.' },
  ],
  chemical: [
    { term: 'Distillation Column', tr: 'Distilasyon Kulesi', def: 'Ayırma işlemi yapılan dikey kule', sentence: 'Crude oil is separated in the distillation column.' },
    { term: 'Catalyst', tr: 'Katalizör', def: 'Tepkimeyi hızlandıran madde', sentence: 'The platinum catalyst speeds up hydrogenation.' },
    { term: 'Viscosity', tr: 'Vizkozite / Akışkanlık Direnci', def: 'Akışkanın akmaya karşı direnci', sentence: 'Heavy oil has high kinematic viscosity.' },
    { term: 'Titration', tr: 'Titrasyon', def: 'Derişim tayini için yapılan nicel analiz', sentence: 'Perform titration to determine acidity.' },
    { term: 'Exothermic Reaction', tr: 'Ekzotermik Tepkime', def: 'Dışarıya ısı veren kimyasal tepkime', sentence: 'Cooling is required during exothermic reaction.' },
    { term: 'Yield', tr: 'Verim', def: 'Elde edilen ürün miktarı oranı', sentence: 'Optimizing temperature increased chemical yield.' },
  ],
  electronics: [
    { term: 'Microcontroller', tr: 'Mikrodenetleyici', def: 'Tek çipli bilgisayar', sentence: 'Program the microcontroller via USB interface.' },
    { term: 'Semiconductor', tr: 'Yarı İletken', def: 'İletkenliği ayarlanabilen malzeme', sentence: 'Silicon is the most common semiconductor.' },
    { term: 'Oscilloscope', tr: 'Osiloskop', def: 'Sinyal dalga şeklini gösteren ölçüm cihazı', sentence: 'Observe signal noise on the oscilloscope screen.' },
    { term: 'Operational Amplifier', tr: 'Operasyonel Yükselteç (Op-Amp)', def: 'Yüksek kazançlı voltaj yükselteci', sentence: 'The op-amp amplifies low voltage signals.' },
    { term: 'Printed Circuit Board', tr: 'Baskı Devre Kartı (PCB)', def: 'Elektronik bileşenlerin bağlandığı kart', sentence: 'Solder components onto the double-sided PCB.' },
    { term: 'Capacitor', tr: 'Kapasitör / Kondansatör', def: 'Elektrik yükü depolayan eleman', sentence: 'The capacitor filters high frequency noise.' },
  ],
  industrial: [
    { term: 'Optimization', tr: 'Optimizasyon / En Uygunlama', def: 'En iyi sonucu elde etmek için süreç iyileştirme', sentence: 'Route optimization minimizes delivery costs.' },
    { term: 'Lean Manufacturing', tr: 'Yalın Üretim', def: 'İsrafı önleyen üretim felsefesi', sentence: 'Lean manufacturing reduced inventory lead times.' },
    { term: 'Supply Chain', tr: 'Tedarik Zinciri', def: 'Ürünün ham maddeden tüketiciye ulaşma ağı', sentence: 'Global supply chain disruptions delayed shipments.' },
    { term: 'Bottleneck', tr: 'Darboğaz', def: 'Üretim akışını yavaşlatan aşama', sentence: 'Identify the bottleneck in the assembly line.' },
    { term: 'Quality Assurance', tr: 'Kalite Güvencesi', def: 'Standartlara uygunluk sağlama süreci', sentence: 'Quality assurance team conducts daily audits.' },
    { term: 'Ergonomics', tr: 'Ergonomi', def: 'İnsan-makine uyum bilimi', sentence: 'Ergonomics prevents worker fatigue.' },
  ],
  mechatronics: [
    { term: 'Actuator', tr: 'Aktüatör / Eyleyici', def: 'Sinyali harekete dönüştüren eleman', sentence: 'Hydraulic actuators control the robotic arm.' },
    { term: 'Programmable Logic Controller', tr: 'PLC / Programlanabilir Mantıksal Denetleyici', def: 'Endüstriyel otomasyon beyni', sentence: 'Configure the PLC input module.' },
    { term: 'Kinematics', tr: 'Kinematik', def: 'Kuvvetleri hesaba katmadan hareketi inceleyen bilim', sentence: 'Inverse kinematics determines joint angles.' },
    { term: 'Encoder', tr: 'Enkoder / Açısal Konum Sensörü', def: 'Konum ve hız bilgisi üreten sensör', sentence: 'Optical encoder provides high resolution feedback.' },
    { term: 'Servomotor', tr: 'Servomotor', def: 'Hassas konum kontrolü sağlayan motor', sentence: 'The servomotor adjusts positional angle.' },
    { term: 'Closed-loop Control', tr: 'Kapalı Döngü Kontrol', def: 'Geri beslemeli otomatik kontrol sistemi', sentence: 'Closed-loop control maintains target temperature.' },
  ],
  hse: [
    { term: 'Hazardous Material', tr: 'Tehlikeli Madde', def: 'Sağlığa veya çevreye zararlı madde', sentence: 'Store hazardous materials in designated areas.' },
    { term: 'Personal Protective Equipment', tr: 'Kişisel Koruyucu Donanım (KKD)', def: 'Koruyucu ekipmanlar', sentence: 'Wear personal protective equipment at all times.' },
    { term: 'Risk Assessment', tr: 'Risk Değerlendirmesi', def: 'Olası tehlikeleri belirleme çalışması', sentence: 'Conduct risk assessment prior to hot work.' },
    { term: 'Emergency Evacuation', tr: 'Acil Durum Tahliyesi', def: 'Tehlike anında alanı boşaltma', sentence: 'Follow emergency evacuation routes.' },
    { term: 'Safety Audit', tr: 'Güvenlik Denetimi', def: 'İSG kurallarına uygunluk incelemesi', sentence: 'The safety audit revealed zero violations.' },
    { term: 'Ergonomic Hazard', tr: 'Ergonomik Tehlike', def: 'Fiziksel zorlanmaya neden olan faktör', sentence: 'Identify ergonomic hazards in heavy lifting.' },
  ],
};

const UNIT_COLORS = [
  { color: '#58CC02', bg: 'from-emerald-500/20 via-emerald-600/10 to-transparent' }, // Duolingo green
  { color: '#1CB0F6', bg: 'from-sky-500/20 via-sky-600/10 to-transparent' }, // Duolingo blue
  { color: '#FFC800', bg: 'from-amber-500/20 via-amber-600/10 to-transparent' }, // Duolingo yellow
];

/**
 * Generates Duolingo-style Units, Levels, and Questions for a specific discipline.
 */
export function generateDuolingoUnits(discipline: EngineeringDiscipline): DuolingoUnit[] {
  const titles = DISCIPLINE_TITLES[discipline] || DISCIPLINE_TITLES.civil;
  const terms = SAMPLE_TERMS_BY_DISCIPLINE[discipline] || SAMPLE_TERMS_BY_DISCIPLINE.civil;

  const unitTitles = [titles.unit1, titles.unit2, titles.unit3];

  return unitTitles.map((unitTitle, uIdx) => {
    const colorObj = UNIT_COLORS[uIdx % UNIT_COLORS.length];
    const unitId = `unit_${discipline}_${uIdx + 1}`;

    const levels: DuolingoLevel[] = [1, 2, 3, 4].map((lIndex) => {
      const levelId = `${unitId}_level_${lIndex}`;
      const levelTitle = `Seviye ${lIndex}: ${terms[(uIdx * 2 + lIndex - 1) % terms.length].term}`;

      // Generate 5 questions per level
      const questions: DuolingoQuestion[] = [];
      const primaryTerm = terms[(uIdx * 2 + lIndex - 1) % terms.length];

      // Question 1: Multiple Choice (English -> Turkish translation)
      const otherTerms = terms.filter((t) => t.term !== primaryTerm.term);
      const wrongOptions = otherTerms.slice(0, 3).map((t) => t.tr);
      const options = [primaryTerm.tr, ...wrongOptions].sort(() => Math.random() - 0.5);

      questions.push({
        id: `${levelId}_q1`,
        type: 'multiple_choice',
        prompt: `"${primaryTerm.term}" teriminin Türkçe karşılığı nedir?`,
        term: primaryTerm.term,
        correctAnswer: primaryTerm.tr,
        options,
        turkishMeaning: primaryTerm.tr,
        explanation: primaryTerm.def,
      });

      // Question 2: Fill in the Blank
      const blankSentence = primaryTerm.sentence.replace(
        new RegExp(primaryTerm.term, 'gi'),
        '_______'
      );
      const wrongTerms = otherTerms.slice(0, 3).map((t) => t.term);
      const fillOptions = [primaryTerm.term, ...wrongTerms].sort(() => Math.random() - 0.5);

      questions.push({
        id: `${levelId}_q2`,
        type: 'fill_blank',
        prompt: `Cümledeki boşluğu doğru mühendislik terimi ile doldurun:\n"${blankSentence}"`,
        term: primaryTerm.term,
        correctAnswer: primaryTerm.term,
        options: fillOptions,
        turkishMeaning: primaryTerm.tr,
        explanation: `Doğru cümle: "${primaryTerm.sentence}"`,
      });

      // Question 3: Listening
      const listeningOptions = [primaryTerm.term, ...wrongTerms].sort(() => Math.random() - 0.5);
      questions.push({
        id: `${levelId}_q3`,
        type: 'listening',
        prompt: 'Sesli okunan mühendislik terimini dinleyin ve doğru olanı seçin:',
        term: primaryTerm.term,
        correctAnswer: primaryTerm.term,
        options: listeningOptions,
        audioText: primaryTerm.term,
        turkishMeaning: primaryTerm.tr,
        explanation: `Telaffuz edilen terim: ${primaryTerm.term} (${primaryTerm.tr})`,
      });

      // Question 4: Writing / Translation
      questions.push({
        id: `${levelId}_q4`,
        type: 'writing',
        prompt: `"${primaryTerm.tr}" ifadesinin İngilizce teknik karşılığını yazın:`,
        term: primaryTerm.term,
        correctAnswer: primaryTerm.term,
        turkishMeaning: primaryTerm.tr,
        explanation: `Doğru yazım: "${primaryTerm.term}"`,
      });

      // Question 5: Speaking / Pronunciation
      questions.push({
        id: `${levelId}_q5`,
        type: 'speaking',
        prompt: `Aşağıdaki terimi yüksek sesle telaffuz edin: "${primaryTerm.term}"`,
        term: primaryTerm.term,
        correctAnswer: primaryTerm.term,
        audioText: primaryTerm.term,
        turkishMeaning: primaryTerm.tr,
        explanation: `Telaffuz: ${primaryTerm.term}`,
      });

      return {
        id: levelId,
        unitId,
        title: levelTitle,
        orderIndex: lIndex,
        xpReward: 20,
        questionCount: questions.length,
        iconName: lIndex === 4 ? 'Trophy' : lIndex === 1 ? 'Play' : 'Star',
        questions,
      };
    });

    return {
      id: unitId,
      title: unitTitle,
      description: `${discipline.toUpperCase()} alanına özel mesleki İngilizce kazanımları`,
      orderIndex: uIdx + 1,
      discipline,
      colorHex: colorObj.color,
      bgGradient: colorObj.bg,
      levels,
    };
  });
}
