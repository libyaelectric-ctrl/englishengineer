import { PhraseEntry } from './work-tools.types';

export type BasePhraseEntry = Omit<PhraseEntry, 'tone' | 'tags'>;

export const BASE_PHRASE_LIBRARY: BasePhraseEntry[] = [
  {
    id: 'consultant-01',
    category: 'Consultant',
    phrase:
      'The revised submission addresses each comment in the attached response sheet.',
    turkishMeaning: 'Revize sunum, ekli cevap formundaki her yorumu karsilar.',
    usageContext: 'Closing review comments',
    example:
      'The revised submission addresses each comment in the attached response sheet; kindly confirm closure.',
  },
  {
    id: 'contractor-01',
    category: 'Contractor',
    phrase: 'Please confirm the recovery action and committed completion date.',
    turkishMeaning:
      'Telafi aksiyonunu ve taahhut edilen bitis tarihini teyit edin.',
    usageContext: 'Following delayed work',
    example:
      'The containment activity is behind programme; please confirm the recovery action and committed completion date.',
  },
  {
    id: 'client-01',
    category: 'Client',
    phrase:
      'This option protects the milestone while maintaining the approved performance criteria.',
    turkishMeaning:
      'Bu secenek onayli performans kriterlerini korurken kilometre tasini da korur.',
    usageContext: 'Presenting a recommendation',
    example:
      'We recommend phased energization because this option protects the milestone while maintaining the approved performance criteria.',
  },
  {
    id: 'subcontractor-01',
    category: 'Subcontractor',
    phrase:
      'Do not proceed beyond this point until the inspection is released.',
    turkishMeaning:
      'Kontrol serbest birakilmadan bu noktadan sonra devam etmeyin.',
    usageContext: 'Controlling site work',
    example:
      'The test record is incomplete, so do not proceed beyond this point until the inspection is released.',
  },
  {
    id: 'qaqc-01',
    category: 'QA/QC',
    phrase:
      'The close-out evidence must be traceable to the original observation.',
    turkishMeaning: 'Kapanış kanıtı ilk gozleme kadar izlenebilir olmalidir.',
    usageContext: 'Reviewing inspection evidence',
    example:
      'Please include the NCR reference in each photograph; the close-out evidence must be traceable to the original observation.',
  },
  {
    id: 'hse-01',
    category: 'HSE',
    phrase:
      'The immediate risk has been removed and a preventive control is now in place.',
    turkishMeaning:
      'Anlik risk giderildi ve onleyici kontrol uygulamaya alindi.',
    usageContext: 'Closing a safety observation',
    example:
      'The access route is clear; the immediate risk has been removed and a preventive control is now in place.',
  },
  {
    id: 'procurement-01',
    category: 'Procurement',
    phrase:
      'Please identify any approval or manufacturing constraint affecting the ex-works date.',
    turkishMeaning:
      'Fabrika cikis tarihini etkileyen onay veya uretim engelini belirtin.',
    usageContext: 'Supplier follow-up',
    example:
      'Please identify any approval or manufacturing constraint affecting the ex-works date by noon.',
  },
  {
    id: 'commissioning-01',
    category: 'Commissioning',
    phrase:
      'The system cannot be offered for integrated testing until all prerequisite checks are signed off.',
    turkishMeaning:
      'Tum on kosul kontrolleri imzalanmadan sistem entegre teste sunulamaz.',
    usageContext: 'Readiness review',
    example:
      'The cause-and-effect record is open; the system cannot be offered for integrated testing until all prerequisite checks are signed off.',
  },
  {
    id: 'delay-01',
    category: 'Delay',
    phrase:
      'The delay affects the current sequence, but the milestone can be protected through resequencing.',
    turkishMeaning:
      'Gecikme mevcut siralamayi etkiliyor ancak yeniden siralamayla kilometre tasi korunabilir.',
    usageContext: 'Programme meeting',
    example:
      'The delayed panels affect the current sequence, but the milestone can be protected through resequencing.',
  },
  {
    id: 'approval-01',
    category: 'Approval',
    phrase:
      'Approval is required by Thursday to avoid an impact on procurement.',
    turkishMeaning:
      'Tedarike etki etmemesi icin perşembe gününe kadar onay gereklidir.',
    usageContext: 'Time-sensitive submission',
    example:
      'Approval is required by Thursday to avoid an impact on procurement and delivery.',
  },
  {
    id: 'rejection-01',
    category: 'Rejection',
    phrase:
      'The proposal cannot be accepted in its current form because the required clearance is not demonstrated.',
    turkishMeaning:
      'Gerekli aciklik gosterilmedigi icin teklif mevcut haliyle kabul edilemez.',
    usageContext: 'Technical rejection',
    example:
      'The proposal cannot be accepted in its current form because the required maintenance clearance is not demonstrated.',
  },
  {
    id: 'clarification-01',
    category: 'Clarification',
    phrase:
      'Please confirm which document takes precedence for this interface.',
    turkishMeaning:
      'Bu arayuz icin hangi dokumanin oncelikli oldugunu teyit edin.',
    usageContext: 'Conflicting requirements',
    example:
      'The drawing and specification differ; please confirm which document takes precedence for this interface.',
  },
  {
    id: 'follow-up-01',
    category: 'Follow-up',
    phrase:
      'This action remains open and is now affecting the planned start date.',
    turkishMeaning:
      'Bu aksiyon hala acik ve planlanan baslangic tarihini artik etkiliyor.',
    usageContext: 'Escalating an overdue action',
    example:
      'The coordinated section has not been received; this action remains open and is now affecting the planned start date.',
  },
];
