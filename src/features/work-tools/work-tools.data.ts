import {
  EmailTemplate,
  EngineeringTemplate,
  PhraseEntry,
} from './work-tools.types';
import {
  EXPANDED_EMAIL_TEMPLATES,
  EXPANDED_ENGINEERING_TEMPLATES,
  EXPANDED_PHRASE_LIBRARY,
} from './work-tools.expanded.data';

type BaseEngineeringTemplate = Omit<
  EngineeringTemplate,
  'category' | 'useCase' | 'tone' | 'tags'
>;
type BaseEmailTemplate = Omit<EmailTemplate, 'category' | 'subject' | 'tags'>;
type BasePhraseEntry = Omit<PhraseEntry, 'tone' | 'tags'>;

const restoreTurkish = (value: string): string => {
  const replacements: Array<[string, string]> = [
    ['Turkce', 'Türkçe'],
    ['duzelt', 'düzelt'],
    ['Duzelt', 'Düzelt'],
    ['kars', 'karş'],
    ['Kars', 'Karş'],
    ['uygunsuzlugu', 'uygunsuzluğu'],
    ['acik', 'açık'],
    ['Acik', 'Açık'],
    ['belirtir', 'belirtir'],
    ['olculebilir', 'ölçülebilir'],
    ['gecik', 'gecik'],
    ['Gecik', 'Gecik'],
    ['sorumlulugu', 'sorumluluğu'],
    ['dokuman', 'doküman'],
    ['onay', 'onay'],
    ['cik', 'çık'],
    ['sure', 'süre'],
    ['gerekli', 'gerekli'],
    ['teyit', 'teyit'],
    ['etkiliyor', 'etkiliyor'],
    ['planlanan', 'planlanan'],
    ['baslangic', 'başlangıç'],
    ['gosterilmedigi', 'gösterilmediği'],
    ['edilemez', 'edilemez'],
    ['oncelikli', 'öncelikli'],
    ['oldugunu', 'olduğunu'],
    ['icin', 'için'],
    ['icin', 'için'],
  ];
  return replacements.reduce(
    (result, [source, target]) => result.replaceAll(source, target),
    value
  );
};

const BASE_ENGINEERING_TEMPLATES: BaseEngineeringTemplate[] = [
  {
    id: 'ncr-reply',
    title: 'NCR -> Reply',
    context:
      'Respond to a non-conformance without accepting unsupported liability.',
    sampleInput:
      'Cable tray supports at Grid B7 do not match the approved spacing.',
    professionalOutput:
      'We acknowledge NCR-014. The affected supports at Grid B7 have been isolated, and installation has stopped in this area. The team will reinstall the supports in accordance with the approved method statement and submit photographic evidence for reinspection by 15:00 tomorrow.',
    turkishExplanation:
      'Cevap; kabul, kontrol altına alma, duzeltici faaliyet ve yeniden kontrol tarihini netleştirir.',
  },
  {
    id: 'consultant-comment-reply',
    title: 'Consultant Comment -> Reply',
    context:
      'Close a consultant comment with evidence and a clear next action.',
    sampleInput:
      'Provide discrimination study confirmation for the revised LV panel settings.',
    professionalOutput:
      'The revised protection settings have been checked against the approved discrimination study. The updated setting schedule and highlighted coordination curves are attached for review. Please confirm closure of Comment EL-27.',
    turkishExplanation:
      'Yorumun hangi belgeyle karşılandığını ve beklenen kapanış aksiyonunu belirtir.',
  },
  {
    id: 'delay-explanation',
    title: 'Delay -> Explanation',
    context: 'Explain a programme delay with cause, impact and mitigation.',
    sampleInput: 'Fire-rated cable delivery is six days late.',
    professionalOutput:
      'The fire-rated cable delivery is delayed by six days because the approved manufacturer has not released the final batch. This affects the Level 3 containment sequence. We have resequenced available labour to Level 2 termination works and requested partial air freight to recover three days.',
    turkishExplanation:
      'Gecikme nedeni, etkisi ve telafi plani ayrı biçimde ve olculebilir olarak verilir.',
  },
  {
    id: 'inspection-response',
    title: 'Inspection -> Response',
    context: 'Respond to an inspection observation and request reinspection.',
    sampleInput: 'Missing identification labels on distribution board feeders.',
    professionalOutput:
      'All feeder identification labels have now been installed in accordance with the approved panel schedule. The corrected boards were internally checked this morning. Kindly arrange reinspection for Area C after 13:00.',
    turkishExplanation:
      'Duzeltmenin tamamlandığını, referansini ve yeniden kontrol talebini aciklar.',
  },
  {
    id: 'material-submittal-reply',
    title: 'Material Submittal -> Reply',
    context: 'Reply to technical comments on a material submittal.',
    sampleInput: 'Clarify enclosure IP rating and corrosion protection.',
    professionalOutput:
      'The proposed enclosure is rated IP66 in accordance with IEC 60529 and includes a polyester powder-coated finish suitable for the specified indoor plantroom environment. The manufacturer test certificate and coating data sheet are included in Revision 02.',
    turkishExplanation:
      'Teknik soruya standart, performans değeri ve kanıt belgeyle cevap verir.',
  },
  {
    id: 'fat-report',
    title: 'FAT -> Report',
    context: 'Summarize a factory acceptance test result.',
    sampleInput: 'Generator FAT passed except remote alarm simulation.',
    professionalOutput:
      'The generator FAT was completed in accordance with the approved procedure. Load performance, protection trips and local controls passed. The remote common-alarm simulation remains open because the interface relay was unavailable. The supplier will repeat this test before dispatch and issue the signed test sheet.',
    turkishExplanation:
      'Kapsam, basarili testler, acik madde ve kapanış sorumlulugunu kaydeder.',
  },
  {
    id: 'mir-comment',
    title: 'MIR -> Comment',
    context: 'Record a material inspection comment.',
    sampleInput:
      'Delivered cable glands have no visible certification marking.',
    professionalOutput:
      'Inspection is held. Certification markings are not visible on the delivered cable glands, and the submitted batch certificate does not identify the packing list. Segregate the material and provide traceable certification before reinspection.',
    turkishExplanation:
      'Malzemenin durumunu, uygunsuzlugu ve kabul icin gereken kanıtı belirtir.',
  },
  {
    id: 'itp-comment',
    title: 'ITP -> Comment',
    context: 'Add a clear hold-point or witness-point comment.',
    sampleInput: 'Insulation resistance test records are incomplete.',
    professionalOutput:
      'Hold point not released. Complete the insulation resistance records for all listed circuits, including instrument serial number, test voltage, measured value and acceptance criteria. Resubmit the signed sheet before energization.',
    turkishExplanation:
      'Kontrol noktasinin durumunu ve serbest birakma sartlarini olculebilir hale getirir.',
  },
  {
    id: 'procurement-follow-up',
    title: 'Procurement -> Follow-up',
    context: 'Request a firm procurement status without vague language.',
    sampleInput: 'Need confirmed delivery for ATS panels.',
    professionalOutput:
      'Please provide the confirmed manufacturing status and ex-works date for the ATS panels by 12:00 today. The current required-on-site date is 18 August. Identify any outstanding approvals or commercial constraints that may affect this date.',
    turkishExplanation:
      'Kesin durum, son cevap saati, gerekli teslim tarihi ve engelleri sorar.',
  },
  {
    id: 'hse-observation-response',
    title: 'HSE Observation -> Response',
    context: 'Close a safety observation with immediate and preventive action.',
    sampleInput: 'Temporary extension cable crossed an access route.',
    professionalOutput:
      'The extension cable was removed from the access route immediately and rerouted overhead using approved supports. The area supervisor briefed the team, and temporary power routing will be included in the next daily inspection checklist.',
    turkishExplanation:
      'Anlik duzeltme ile tekrarini onleyen faaliyeti birbirinden ayirir.',
  },
  {
    id: 'meeting-minutes',
    title: 'Meeting -> Minutes',
    context: 'Convert a discussion into accountable meeting minutes.',
    sampleInput:
      'Consultant wants revised containment route; contractor to submit Thursday.',
    professionalOutput:
      'Action EL-08: The contractor shall submit the revised containment route for Corridor 2, including coordinated sections and access clearances, by Thursday 16:00. The consultant will review the revision within two working days. Owner: MEP Coordinator.',
    turkishExplanation:
      'Karari; aksiyon, teslim, tarih, inceleme suresi ve sorumluya donusturur.',
  },
  {
    id: 'handover-punch-note',
    title: 'Handover -> Punch List Note',
    context: 'Write a precise punch-list item for handover.',
    sampleInput: 'UPS room panel directory does not match final circuits.',
    professionalOutput:
      'Update the UPS room distribution-board directory to match the final connected circuit references. Verify each outgoing feeder against the as-built drawing, replace the directory card and submit a dated close-out photograph.',
    turkishExplanation:
      'Eksigi, doğrulama yöntemini ve kapanış kanıtını netleştirir.',
  },
];

const email = (
  id: string,
  title: string,
  subject: string,
  request: string,
  technicalDetail: string,
  explanation: string
): BaseEmailTemplate => ({
  id,
  title,
  shortVersion: `Subject: ${subject}\n\nHello,\n\n${request}\n\nRegards,`,
  professionalVersion: `Subject: ${subject}\n\nDear Team,\n\n${request} Please confirm the responsible person and target date.\n\nKind regards,`,
  politeVersion: `Subject: ${subject}\n\nDear Team,\n\nCould you please ${request.charAt(0).toLowerCase()}${request.slice(1)} Your support in confirming the next action would be appreciated.\n\nKind regards,`,
  technicalVersion: `Subject: ${subject}\n\nDear Team,\n\n${request}\n\nTechnical reference: ${technicalDetail}\n\nPlease respond with supporting records and the committed completion date.\n\nKind regards,`,
  turkishExplanation: explanation,
});

const BASE_EMAIL_TEMPLATES: BaseEmailTemplate[] = [
  email(
    'delay-email',
    'Delay Email',
    'Notice of delivery delay',
    'The approved cable delivery is delayed and now affects the planned installation sequence.',
    'Approved programme activity EL-230 and required-on-site date',
    'Gecikmeyi etkisi ve program referansiyla bildirir.'
  ),
  email(
    'inspection-request',
    'Inspection Request',
    'Request for inspection - Area B',
    'The installation is complete and ready for inspection tomorrow at 10:00.',
    'Approved ITP witness point and latest coordinated drawing',
    'Hazirlik durumu, yer ve saat bilgisi verir.'
  ),
  email(
    'approval-request',
    'Approval Request',
    'Approval required - revised layout',
    'Please review and approve the attached revised equipment layout to avoid impact on procurement.',
    'Revision cloud, equipment clearances and interface schedule',
    'Onayin neden acil oldugunu teknik etkiyle aciklar.'
  ),
  email(
    'meeting-invitation',
    'Meeting Invitation',
    'Coordination meeting - electrical interfaces',
    'Please attend a 30-minute coordination meeting on Tuesday at 09:30 to close the listed interface actions.',
    'Agenda, open-action register and coordinated model views',
    'Toplanti amacini, suresini ve beklenen kapanışları belirtir.'
  ),
  email(
    'procurement-email',
    'Procurement Follow-up',
    'Urgent status - ATS panels',
    'Please confirm manufacturing progress, inspection date and ex-works delivery date for the ATS panels.',
    'Purchase order, approved submittal and delivery schedule',
    'Tedarik durumunu somut kilometre taslariyla sorar.'
  ),
  email(
    'submittal-reply',
    'Submittal Reply',
    'Material submittal revision response',
    'The revised submittal addresses all technical comments and includes the requested compliance documents.',
    'Comment-response sheet and certificate index',
    'Revizyonun yorumlari nasil kapattigini bildirir.'
  ),
  email(
    'ncr-email',
    'NCR Response',
    'Response to NCR-014',
    'The affected work is controlled, corrective action is underway and reinspection is requested for tomorrow.',
    'Corrective-action record and approved method statement',
    'Uygunsuzluk cevabini kontrollu ve kanıtlı tutar.'
  ),
  email(
    'consultant-clarification',
    'Consultant Clarification',
    'Technical clarification required',
    'Please clarify the required interface point because the drawing and specification indicate different termination locations.',
    'Drawing reference, specification clause and marked-up detail',
    'Celisen dokumanlari tarafsiz bicimde netleştirir.'
  ),
  email(
    'handover-email',
    'Handover Email',
    'Handover dossier submission',
    'The updated handover dossier is attached for review, including as-built drawings, test records and O&M manuals.',
    'Document register and outstanding-item list',
    'Teslim dosyasinin kapsam ve aciklarini bildirir.'
  ),
  email(
    'warning-email',
    'Warning Email',
    'Immediate action required - access obstruction',
    'The access obstruction must be removed today because it prevents safe inspection and maintenance.',
    'Approved access zone and HSE observation reference',
    'Uyariyi profesyonel, gerekceli ve tarihli yazar.'
  ),
  email(
    'contractor-instruction',
    'Contractor Instruction',
    'Instruction - revise support installation',
    'Revise the support installation in the identified area before continuing adjacent works.',
    'Approved detail, inspection comment and hold point',
    'Talimat kapsam, referans ve devam kosulunu netleştirir.'
  ),
];

const BASE_PHRASE_LIBRARY: BasePhraseEntry[] = [
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

export const ENGINEERING_TEMPLATES: EngineeringTemplate[] = [
  ...BASE_ENGINEERING_TEMPLATES.map((template) => ({
    ...template,
    turkishExplanation: restoreTurkish(template.turkishExplanation),
    category: 'Core Workflow',
    useCase: template.context,
    tone: 'Professional and accountable',
    tags: ['engineering', 'site communication', 'core workflow'],
  })),
  ...EXPANDED_ENGINEERING_TEMPLATES,
];

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  ...BASE_EMAIL_TEMPLATES.map((template) => ({
    ...template,
    turkishExplanation: restoreTurkish(template.turkishExplanation),
    category: 'Core Email',
    subject: template.shortVersion.split('\n')[0].replace('Subject: ', ''),
    tags: ['engineering email', 'professional communication'],
  })),
  ...EXPANDED_EMAIL_TEMPLATES,
];

export const PHRASE_LIBRARY: PhraseEntry[] = [
  ...BASE_PHRASE_LIBRARY.map((entry) => ({
    ...entry,
    turkishMeaning: restoreTurkish(entry.turkishMeaning),
    tone: 'Professional and clear',
    tags: [entry.category.toLowerCase(), 'engineering communication'],
  })),
  ...EXPANDED_PHRASE_LIBRARY,
];
