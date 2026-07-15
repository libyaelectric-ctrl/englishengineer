import { EngineeringTemplate } from './work-tools.types';

export type BaseEngineeringTemplate = Omit<
  EngineeringTemplate,
  'category' | 'useCase' | 'tone' | 'tags'
>;

export const BASE_ENGINEERING_TEMPLATES: BaseEngineeringTemplate[] = [
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
