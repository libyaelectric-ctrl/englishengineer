import { MissionDifficulty } from '@/core/learning';
import { VocabularyDiscipline, VocabularyEntry } from './vocabulary.types';
import { expansionCategories } from './vocabulary.expansion-categories';

type PartOfSpeech = VocabularyEntry['partOfSpeech'];

export interface VocabularyContentRow {
  word: string;
  partOfSpeech: PartOfSpeech;
  CEFR: VocabularyEntry['CEFR'];
  discipline: VocabularyDiscipline;
  meaning: string;
  definition: string;
  example: string;
  synonyms: string[];
  collocations: string[];
  difficulty: MissionDifficulty;
  tags: string[];
}

export const row = (
  word: string,
  partOfSpeech: PartOfSpeech,
  CEFR: VocabularyEntry['CEFR'],
  discipline: VocabularyDiscipline,
  meaning: string,
  definition: string,
  example: string,
  synonyms: string[],
  collocations: string[],
  difficulty: MissionDifficulty,
  tags: string[]
): VocabularyContentRow => ({
  word,
  partOfSpeech,
  CEFR,
  discipline,
  meaning,
  definition,
  example,
  synonyms,
  collocations,
  difficulty,
  tags,
});

const getMeaning = (term: string, discipline: string): string => {
  const meaningMap: Record<string, Record<string, string>> = {
    'Electrical Engineering': {
      'earthing conductor': 'topraklama iletkeni',
      'protective relay': 'koruma rölesi',
      'ring main unit': 'halka şebekesi ünitesi',
      'feeder pillar': 'besleyici direği',
      'cable gland': 'kablo pabucu',
      'gland plate': 'pabuc plakası',
      'neutral bar': 'nötr bara',
      'earth leakage': 'topraklama kaçağı',
      'short-circuit rating': 'kısa devre dayanımı',
      'fault level': 'ariza seviyesi',
      'selectivity study': 'selektiflik çalışması',
      'voltage drop': 'gerilim düşümü',
      'load plan': 'yük planı',
      'single line diagram': 'tek hat şeması',
      'panel schedule': 'pano programı',
      'cable schedule': 'kablo programı',
      'termination kit': 'uç bağlantı seti',
      'insulation tester': 'yalıtım test cihazı',
      'megger reading': 'megger okuması',
      'phase sequence': 'faz sırası',
      'surge protection': 'dalgalanma koruması',
      'harmonic distortion': 'harmonik bozulma',
      'power factor': 'güç faktörü',
      'capacitor bank': 'kondansatör bankı',
      'bus coupler': 'bara kuple',
      'incomer breaker': 'giriş devre kesici',
      'outgoing feeder': 'çıkış besleyici',
      'control wiring': 'kontrol kablajı',
      'interposing relay': 'ara röle',
      'auxiliary contact': 'yardımcı kontak',
    },
    'Mechanical Engineering': {
      'chilled water header': 'soğuk su manifoldu',
      'differential pressure': 'basınç farkı',
      'balancing valve': 'dengelerme vanası',
      'strainer basket': 'süzgeç sepeti',
      'flexible connector': 'esnek bağlantı',
      'expansion joint': 'genleşme derzi',
      'pump alignment': 'pompa hizalama',
      'vibration isolator': 'titreşim izolatörü',
      'air separator': 'hava ayırıcı',
      'chemical dosing': 'kimyasal dozlama',
      'pressure gauge': 'basınç ölçer',
      'temperature sensor': 'sıcaklık sensörü',
      'duct transition': 'kanal geçişi',
      'volume control damper': 'hacim kontrol kapısı',
      'fire damper': 'yangın kapısı',
      'access panel': 'erişim paneli',
      'condensate drain': 'yoğuşma gideri',
      'fan coil unit': 'fan-coil ünitesi',
      'air handling unit': 'hava işleme ünitesi',
      'static pressure': 'statik basınç',
      'flow rate': 'debi',
      'hydrostatic test': 'hidrostatik test',
      'flushing plan': 'temizleme planı',
      'commissioning valve': 'devreye alma vanası',
      'bypass line': 'by-pass hattı',
      'isolation valve': 'ayırma vanası',
      'pump curve': 'pompa eğrisi',
      'heat exchanger': 'ısı değiştirici',
      'thermal insulation': 'ısı yalıtımı',
      'pipe support': 'boru konsolu',
    },
    'Civil Engineering': {
      'blinding concrete': 'göz betonu',
      'reinforcement bar': 'donatı çubuğu',
      'rebar spacing': 'donatı aralığı',
      'concrete cover': 'beton örtüsü',
      'formwork release': 'kalıp sökme',
      'anchor bolt': 'ankraj cıvatası',
      'embedment plate': 'gömme plakası',
      'construction joint': 'inşaat derzi',
      'expansion joint': 'genleşme derzi',
      'level survey': 'kot ölçümü',
      'setting out': 'köy ölçümü',
      'compaction test': 'sıkıştırma deneyi',
      'backfilling layer': 'dolgu tabakası',
      'screed level': 'şap kotu',
      'plinth foundation': 'sokak temeli',
      'core drilling': 'karot delme',
      'sleeve opening': 'manşon açığı',
      'blockwork wall': 'blok duvar',
      'waterproofing membrane': 'su yalıtım membranı',
      'slope correction': 'eğim düzeltme',
      'drainage channel': 'drenaj kanalı',
      'manhole cover': 'rögar kapağı',
      'trench excavation': 'kanal kazısı',
      'shoring system': 'destek sistemi',
      'load-bearing wall': 'taşıyıcı duvar',
      'slab opening': 'döşeme boşluğu',
      'structural clearance': 'yapısal geçit',
      'grouting work': 'enjeksiyon çalışması',
      'as-built survey': 'yapıldığı gibi ölçüm',
      'site benchmark': 'saha referans noktası',
    },
    Architecture: {
      'finish schedule': 'bitiş programı',
      'ceiling void': 'tavan boşluğu',
      'access hatch': 'erişim kapağı',
      'wall penetration': 'duvar geçişi',
      'fire-rated wall': 'yangına dayanıklı duvar',
      'door hardware': 'kapı aksesuarı',
      'ironmongery schedule': 'kapı donanım programı',
      'room data sheet': 'oda veri sayfası',
      'mock-up approval': 'örnek uygulama onayı',
      'material sample': 'malzeme örneği',
      'joint sealant': 'derz mastarı',
      'skirting detail': 'süpürgelik detayı',
      'floor transition': 'zemin geçişi',
      'ceiling grid': 'tavan kafes sistemi',
      'paint system': 'boya sistemi',
      'tile layout': 'seramik yerleşim planı',
      'facade panel': 'cephe paneli',
      'cladding support': 'kaplama destek sistemi',
      'shopfront glazing': 'dükkan cephe camı',
      'acoustic panel': 'akustik panel',
      'signage zone': 'tabela bölgesi',
      'architectural opening': 'mimari açıklık',
      'finish interface': 'bitiş arayüzü',
      'room numbering': 'oda numaralandırma',
      'reflected ceiling plan': 'yansıtılmış tavan planı',
      'door swing': 'kapı açıklık yönü',
      'clear opening': 'temiz geçit',
      'fire stopping detail': 'yangın durdurma detayı',
      'snag item': 'kusur maddesi',
      'visual inspection': 'görsel muayene',
    },
    Construction: {
      'work front': 'çalışma cepheleri',
      'site access': 'saha girişi',
      'material delivery': 'malzeme teslimatı',
      'installation crew': 'montaj ekibi',
      'daily manpower': 'günlük iş gücü',
      'look-ahead plan': 'ileriye dönük plan',
      'site constraint': 'saha kısıtı',
      'temporary works': 'geçici işler',
      'permit to work': 'çalışma izni',
      'area handover': 'alan teslimi',
      'progress photo': 'ilerleme fotoğrafı',
      'inspection request': 'kontrol talebi',
      'work sequence': 'iş sırası',
      'site instruction': 'saha talimatı',
      'access scaffold': 'erişim iskelesi',
      'lifting area': 'vinç alanı',
      'storage area': 'depolama alanı',
      housekeeping: 'saha düzeni',
      'temporary lighting': 'geçici aydınlatma',
      'site clearance': 'saha temizliği',
      'work permit': 'çalışma izni',
      'toolbox briefing': 'saha brifingi',
      'supervisor approval': 'şef onayı',
      'material shortage': 'malzeme eksikliği',
      'installation delay': 'montaj gecikmesi',
      'site obstruction': 'saha engeli',
      'interface area': 'arayüz bölgesi',
      'daily report': 'günlük rapor',
      'shift handover': 'vardiya devir teslimi',
      'closeout action': 'kapanış eylemi',
    },
    Commissioning: {
      'pre-commissioning': 'devreye alma öncesi',
      'functional test': 'fonksiyonel test',
      'integrated systems test': 'entegre sistem testi',
      'cause-and-effect matrix': 'neden-sonuç matrisi',
      'sequence of operation': 'çalışma sırası',
      'commissioning dossier': 'devreye alma dosyası',
      'test script': 'test senaryosu',
      'witness test': 'tanık testi',
      'performance test': 'performans testi',
      'setpoint verification': 'setpoint doğrulaması',
      'loop check': 'çevrim kontrolü',
      'point-to-point test': 'noktadan noktaya test',
      'interface signal': 'arayüz sinyali',
      'alarm acknowledgement': 'alarm onayı',
      'trend log': 'trend kaydı',
      'operational readiness': 'operasyonel hazırlık',
      'energization permit': 'gerilim verme izni',
      'startup procedure': 'çalıştırma prosedürü',
      'load test': 'yük testi',
      'acceptance criteria': 'kabul kriterleri',
      'test sheet': 'test sayfası',
      'deficiency list': 'eksiklik listesi',
      'commissioning hold': 'devreye alma bekleme noktası',
      'retest record': 'yeniden test kaydı',
      'handover package': 'teslim paketi',
      'training record': 'eğitim kaydı',
      'O&M manual': 'işletme ve bakım kılavuzu',
      'spare parts list': 'yedek parça listesi',
      'system demonstration': 'sistem gösterimi',
      'final acceptance': 'final kabul',
    },
    'QA/QC': {
      'inspection request': 'kontrol talebi',
      'material inspection request': 'malzeme kontrol talebi',
      'non-conformance report': 'uygunsuzluk raporu',
      'corrective action': 'düzeltici faaliyet',
      'preventive action': 'önleyici faaliyet',
      'root cause': 'kök neden',
      'hold point': 'bekleme noktası',
      'witness point': 'tanık noktası',
      'inspection checklist': 'kontrol kontrol listesi',
      'approved sample': 'onaylı numune',
      'quality record': 'kalite kaydı',
      'closure evidence': 'kapanış kanıtı',
      'defect notice': 'kusur bildirimi',
      'snag closure': 'kusur kapanışı',
      'method statement': 'iş metodu',
      'ITP stage': 'ITP aşaması',
      'calibration certificate': 'kalibrasyon sertifikası',
      'traceability record': 'izlenebilirlik kaydı',
      'document control': 'doküman kontrolü',
      'inspection status': 'kontrol durumu',
      'acceptance criteria': 'kabul kriterleri',
      'rework instruction': 'yeniden iş talimatı',
      'quality observation': 'kalite gözlemi',
      'site surveillance': 'saha gözetimi',
      'punch item': 'punch maddesi',
      'verification record': 'doğrulama kaydı',
      'compliance matrix': 'uygunluk matrisi',
      'material approval': 'malzeme onayı',
      'test certificate': 'test sertifikası',
      'inspection release': 'kontrol serbest bırakma',
    },
    HSE: {
      'risk assessment': 'risk değerlendirmesi',
      'method statement briefing': 'iş metodu brifingi',
      'job safety analysis': 'iş güvenliği analizi',
      'lockout tagout': 'kilit etiketleme',
      'arc-flash boundary': 'ark çarpma sınırı',
      'confined space': 'kapalı alan',
      'working at height': 'yükseklikte çalışma',
      'lifting plan': 'vinç planı',
      'exclusion zone': 'yasak bölge',
      'hot work permit': 'sıcak çalışma izni',
      'emergency response': 'acil durum müdahalesi',
      'near miss': 'yaralanmalı kaza',
      'unsafe condition': 'güvensiz durum',
      'safety observation': 'güvenlik gözlemi',
      'PPE compliance': 'KKD uygunluğu',
      'first aid station': 'ilk yardım istasyonu',
      'fire watch': 'yangın gözetimi',
      'spill kit': 'sızıntı kiti',
      'environmental control': 'çevre kontrolü',
      'waste segregation': 'atık ayrıştırma',
      'manual handling': 'manüel taşıma',
      'scaffold tag': 'iskele etiketi',
      'fall arrest': 'düşüş engelleme',
      'isolation point': 'ayırma noktası',
      'danger tag': 'tehlike etiketi',
      'gas test': 'gaz testi',
      'incident report': 'olay raporu',
      'safety induction': 'güvenlik oryantasyonu',
      'evacuation route': 'tahliye yolu',
      'permit suspension': 'izin askıya alma',
    },
    'Project Management': {
      'baseline programme': 'başlangıç programı',
      'critical path': 'kritik yol',
      'progress curve': 'ilerleme eğrisi',
      'recovery plan': 'kurtarma planı',
      'delay notice': 'gecikme bildirimi',
      'extension of time': 'süre uzatımı',
      'milestone forecast': 'kilometre taşı tahmini',
      'constraint register': 'kısıt defteri',
      'risk register': 'risk defteri',
      'action tracker': 'eylem takipçisi',
      'decision log': 'karar kaydı',
      'interface matrix': 'arayüz matrisi',
      'stakeholder update': 'paydaş güncellemesi',
      'weekly dashboard': 'haftalık kontrol paneli',
      'earned value': 'kazanılan değer',
      'look-ahead schedule': 'ileriye dönük program',
      'resource histogram': 'kaynak histogramı',
      'cash flow forecast': 'nakit akışı tahmini',
      'change request': 'değişiklik talebi',
      'variation order': 'değişiklik emri',
      'site instruction': 'saha talimatı',
      'minutes of meeting': 'toplantı tutanağı',
      'coordination action': 'koordinasyon eylemi',
      'document register': 'doküman defteri',
      'submission forecast': 'sunum tahmini',
      'approval cycle': 'onay döngüsü',
      'progress narrative': 'ilerleme hikayesi',
      'project closeout': 'proje kapanışı',
      'handover milestone': 'teslim kilometre taşı',
      'lessons learned': 'alınan dersler',
    },
  };
  return meaningMap[discipline]?.[term] || term;
};

const getDefinition = (
  term: string,
  discipline: string,
  context: string
): string => {
  const definitions: Record<string, string> = {
    'Electrical Engineering': `${term}, elektrik dağıtımında ve güvenlikte kritik bir bileşen veya kavramdır. ${context} alanında yaygın olarak kullanılır.`,
    'Mechanical Engineering': `${term}, mekanik sistem tasarımında ve işletmesinde temel bir unsurdur. Sistem verimliliği ve güvenilirliği üzerinde doğrudan etkisi vardır.`,
    'Civil Engineering': `${term}, yapısal bütünlük ve inşaat kalitesi açısından temel bir kavramdır. İnşaat mühendisliğinde yapısal uyumluluk için kritiktir.`,
    Architecture: `${term}, yapılmış mekanların işlevsel ve estetik kalitesine katkıda bulunur. Mimari koordinasyon ve tasarım niyeti için gereklidir.`,
    Construction: `${term}, inşaat sahalarında günlük olarak kullanılan pratik bir kavramdır. İnşaat kalitesi, güvenliği ve programı üzerinde etkisi vardır.`,
    Commissioning: `${term}, sistem hazırlığını doğrulamak için devreye alma sırasında test edilir ve belgelenir. Teslim öncesi doğrulanmalıdır.`,
    'QA/QC': `${term}, muayene ve doğrulama sırasında kullanılan bir kalite kontrol kavramdır. Proje şartnamelerine ve standartlarına uygunluğu sağlamaya yardımcı olur.`,
    HSE: `${term}, saha güvenliği için kritik olan bir sağlık, güvenlik ve çevre kavramdır. Kazaları önlemeye ve düzenleyici uyuma yardımcı olur.`,
    'Project Management': `${term}, planlama ve takip için kullanılan bir proje kontrol kavramıdır. Proje programı, maliyeti ve paydaş iletişimi üzerinde etkisi vardır.`,
  };
  return (
    definitions[discipline] ||
    `${term}, ${context} alanında profesyonel bir mühendislik kavramıdır.`
  );
};

const getExample = (term: string, discipline: string): string => {
  const examples: Record<string, string[]> = {
    'Electrical Engineering': [
      `${term} devreye alma sırasında saha denetim ekibi tarafından denetlendi.`,
      `${term} devre enerjilmeden önce tüm güvenlik kontrolleri yapılmalıdır.`,
      `${term} proje şartnamesinde belirtilen kriterleri karşılamalıdır.`,
      `${term} için yapılan test sonuçları belgeleme dosyasına işlendi.`,
    ],
    'Mechanical Engineering': [
      `${term} mekanik tamamlama incelemesi sırasında detaylı olarak kontrol edildi.`,
      `${term} çalıştırma öncesi düzgün şekilde monte edilmeli ve test edilmelidir.`,
      `${term} performansı tasarım kriterlerine göre bağımsız olarak doğrulandı.`,
      `${term} operasyonel hazırlık kontrol listesinde zorunlu olarak yer alıyor.`,
    ],
    'Civil Engineering': [
      `${term} bir sonraki inşaat aşamasına geçmeden önce kapsamlı şekilde denetlendi.`,
      `${term} yapısal tasarım şartnamelerine ve yerel yönetmeliklere uygun olmalıdır.`,
      `${term} saha muayenesi sırasında müteahhit firması tarafından doğrulandı.`,
      `${term} kalite kontrol kaydına tarih ve imza ile birlikte işlendi.`,
    ],
    Architecture: [
      `${term} tasarım koordinasyon toplantısında tüm paydaşlar tarafından gözden geçirildi.`,
      `${term} mimari niyet, fonksiyonellik ve şartnamelerle tam uyumlu olmalıdır.`,
      `${term} mimar proje gereksinimlerini karşıladığını resmi olarak onayladı.`,
      `${term} bitiş programında ilgili aşama ile birlikte yer alıyor.`,
    ],
    Construction: [
      `${term} bir sonraki iş cephesine geçmeden önce saha şefi tarafından kontrol edildi.`,
      `${term} saha şefi tarafından günlük yürüyüş sırasında doğrulandı ve kaydedildi.`,
      `${term} kontrol talebi gönderilmeden önce tamamlanmış ve hazır olmalıdır.`,
      `${term} iş sırası ve programına göre planlanarak uygulandı.`,
    ],
    Commissioning: [
      `${term} devreye alma kontrol listesi sırasında adım adım test edildi.`,
      `${term} sistem enerjilmesi öncesi bağımsız olarak doğrulanmalıdır.`,
      `${term} test sonuçları commissioning ekibi tarafından resmi olarak belgelendi.`,
      `${term} operasyonel hazırlık durumunda kalite kontrol tarafından onaylandı.`,
    ],
    'QA/QC': [
      `${term} kontrol kaydına tarih, sorumlu kişi ve sonuç ile birlikte işlendi.`,
      `${term} onay öncesi belirlenen kabul kriterlerini eksiksiz karşılamalıdır.`,
      `${term} kalite kontrol mühendisi tarafından şartnameye göre doğrulandı.`,
      `${term} uygunluk matrisinde ilgili madde ile birlikte yer alıyor.`,
    ],
    HSE: [
      `${term} güvenlik brifingi sırasında tüm ekip tarafından gözden geçirildi.`,
      `${term} çalışma başlamadan önce sahada yerinde hazır olmalıdır.`,
      `${term} saha denetimi sırasında güvenlik memuru tarafından kontrol edildi.`,
      `${term} acil durum müdahalesi planında referans olarak kullanıldı.`,
    ],
    'Project Management': [
      `${term} haftalık ilerleme raporunda proje yöneticisi tarafından güncellendi.`,
      `${term} proje kilometre taşı programını doğrudan etkiliyor.`,
      `${term} proje yöneticisi tarafından durum toplantısında detaylı olarak incelendi.`,
      `${term} risk defterine öncelik seviyesi ile birlikte kaydedildi.`,
    ],
  };
  const pool = examples[discipline] || [
    `The ${term} was verified during the quality review.`,
  ];
  let hash = 0;
  const str = term + discipline;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return pool[Math.abs(hash) % pool.length];
};

const getCollocations = (term: string, discipline: string): string[] => {
  const base = [`review ${term}`, `${term} status`, `${term} requirement`];
  const extras: Record<string, string[]> = {
    'Electrical Engineering': [
      `${term} test`,
      `${term} setting`,
      `${term} report`,
    ],
    'Mechanical Engineering': [
      `${term} inspection`,
      `${term} alignment`,
      `${term} performance`,
    ],
    'Civil Engineering': [
      `${term} specification`,
      `${term} tolerance`,
      `${term} compliance`,
    ],
    Architecture: [`${term} design`, `${term} approval`, `${term} detail`],
    Construction: [
      `${term} schedule`,
      `${term} completion`,
      `${term} sign-off`,
    ],
    Commissioning: [
      `${term} checklist`,
      `${term} verification`,
      `${term} certificate`,
    ],
    'QA/QC': [`${term} record`, `${term} audit`, `${term} certification`],
    HSE: [`${term} briefing`, `${term} compliance`, `${term} procedure`],
    'Project Management': [
      `${term} tracking`,
      `${term} forecast`,
      `${term} review`,
    ],
  };
  return [...base, ...(extras[discipline] || [])];
};

export function buildExpansionRows(): VocabularyContentRow[] {
  return expansionCategories.flatMap((category) =>
    category.terms.map((term) =>
      row(
        term,
        term.includes(' ') ? 'phrase' : 'noun',
        category.CEFR,
        category.discipline,
        getMeaning(term, category.discipline),
        getDefinition(term, category.discipline, category.context),
        getExample(term, category.discipline),
        [],
        getCollocations(term, category.discipline),
        category.difficulty,
        category.tags
      )
    )
  );
}

export function dedupeRowsByWord(
  contentRows: VocabularyContentRow[]
): VocabularyContentRow[] {
  const seen = new Set<string>();
  return contentRows.filter((item) => {
    const key = item.word.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildEntries(
  rawData: VocabularyContentRow[]
): VocabularyEntry[] {
  const beginnerRows = rawData.filter((r) => r.difficulty === 'Beginner');
  const contentRows = rawData.filter((r) => r.difficulty !== 'Beginner');

  const beginnerRowsByWord = new Map(
    beginnerRows.map((item) => [item.word.toLowerCase(), item])
  );
  const leveledExistingRows = [...contentRows, ...buildExpansionRows()].map(
    (item) => beginnerRowsByWord.get(item.word.toLowerCase()) ?? item
  );
  const expanded = dedupeRowsByWord([...leveledExistingRows, ...beginnerRows]);

  return expanded.map((item, index) => ({
    id: `vocab_pro_${(index + 1).toString().padStart(3, '0')}`,
    ...item,
  }));
}
