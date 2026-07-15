import { PhraseEntry } from './work-tools.types';

const PHRASE_TOPICS = [
  ['Consultant', 'the revised technical submission', 'revize teknik sunum'],
  [
    'Contractor',
    'the agreed corrective action',
    'mutabık kalınan düzeltici faaliyet',
  ],
  ['Client', 'the milestone decision', 'kilometre taşı kararı'],
  [
    'Subcontractor',
    'the committed completion date',
    'taahhüt edilen bitiş tarihi',
  ],
  ['QA/QC', 'the inspection close-out evidence', 'kontrol kapanış kanıtı'],
  ['HSE', 'the immediate safety control', 'acil güvenlik kontrolü'],
  [
    'Procurement',
    'the confirmed delivery programme',
    'teyit edilmiş teslimat programı',
  ],
  [
    'Commissioning',
    'the outstanding test prerequisite',
    'eksik test ön koşulu',
  ],
  ['Delay', 'the recovery action', 'telafi aksiyonu'],
  ['Approval', 'the required technical approval', 'gerekli teknik onay'],
  ['Rejection', 'the non-compliant proposal', 'uygun olmayan teklif'],
  [
    'Clarification',
    'the conflicting interface requirement',
    'çelişen arayüz gereksinimi',
  ],
  ['Follow-up', 'the overdue action', 'gecikmiş aksiyon'],
  ['Meeting', 'the agreed meeting decision', 'mutabık kalınan toplantı kararı'],
  ['Handover', 'the remaining handover item', 'kalan teslim maddesi'],
  [
    'Warning',
    'the repeated site non-compliance',
    'tekrarlanan saha uygunsuzluğu',
  ],
  ['Progress', 'the current installation status', 'mevcut montaj durumu'],
  [
    'Coordination',
    'the unresolved coordination interface',
    'çözülmemiş koordinasyon arayüzü',
  ],
  ['Design', 'the latest coordinated design', 'son koordineli tasarım'],
  ['Testing', 'the signed test record', 'imzalı test kaydı'],
] as const;

const PHRASE_PATTERNS = [
  {
    phrase: (topic: string) =>
      `Please confirm ${topic} before we proceed with the next activity.`,
    turkish: (topic: string) =>
      `Bir sonraki faaliyete geçmeden önce ${topic} teyit edin.`,
    use: 'Requesting a controlled confirmation',
    example: (topic: string) =>
      `Please confirm ${topic} by 14:00 so the site team can proceed safely.`,
  },
  {
    phrase: (topic: string) =>
      `The current status of ${topic} needs to be recorded in today's action log.`,
    turkish: (topic: string) =>
      `${topic} için mevcut durum bugünkü aksiyon kaydına işlenmelidir.`,
    use: 'Keeping an auditable action record',
    example: (topic: string) =>
      `The current status of ${topic} needs to be recorded with an owner and due date.`,
  },
  {
    phrase: (topic: string) =>
      `We can close this point once ${topic} is formally accepted.`,
    turkish: (topic: string) =>
      `${topic} resmen kabul edildiğinde bu maddeyi kapatabiliriz.`,
    use: 'Explaining a closure condition',
    example: (topic: string) =>
      `We can close this point once ${topic} is formally accepted by the consultant.`,
  },
  {
    phrase: (topic: string) =>
      `Could you identify the owner and deadline for ${topic}?`,
    turkish: (topic: string) =>
      `${topic} için sorumluyu ve son tarihi belirtebilir misiniz?`,
    use: 'Turning discussion into accountability',
    example: (topic: string) =>
      `Could you identify the owner and deadline for ${topic} before we close the meeting?`,
  },
  {
    phrase: (topic: string) =>
      `Without ${topic}, the planned sequence remains at risk.`,
    turkish: (topic: string) =>
      `${topic} olmadan planlanan iş sırası risk altında kalır.`,
    use: 'Explaining programme impact without blame',
    example: (topic: string) =>
      `Without ${topic}, the planned sequence remains at risk and resequencing may be required.`,
  },
];

export const EXPANDED_PHRASE_LIBRARY: PhraseEntry[] = PHRASE_TOPICS.flatMap(
  ([category, englishTopic, turkishTopic], categoryIndex) =>
    PHRASE_PATTERNS.map((pattern, patternIndex) => ({
      id: `expanded-phrase-${categoryIndex + 1}-${patternIndex + 1}`,
      category,
      phrase: pattern.phrase(englishTopic),
      turkishMeaning: pattern.turkish(turkishTopic),
      usageContext: pattern.use,
      example: pattern.example(englishTopic),
      tone: patternIndex === 4 ? 'Firm and factual' : 'Professional and polite',
      tags: [
        category.toLowerCase(),
        'site meeting',
        'engineering communication',
      ],
    }))
);
