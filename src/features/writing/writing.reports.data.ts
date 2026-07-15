import { WritingSpec } from './writing.types';

export const WRITING_REPORT_SPECS: WritingSpec[] = [
  {
    id: 'writing_daily_site_progress_report',
    title: 'Daily Site Progress Report',
    category: 'Daily Site Progress Report',
    discipline: 'Construction Site',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'The electrical team completed containment installation in a hospital corridor and must report progress to the project manager.',
    task: 'Rewrite the daily update into a concise site progress report.',
    expectedStructure: [
      'Date and area',
      'Completed work',
      'Constraints',
      'Next shift plan',
    ],
    targetVocabulary: [
      'containment',
      'work front',
      'progress percentage',
      'constraint',
      'look-ahead',
    ],
    grammarFocus: [
      'past simple for completed work',
      'passive voice for installed items',
    ],
    strongPhrase:
      'Cable tray containment in Corridor C reached 85% completion with one access constraint near the nurse station.',
    weakPhrase: 'The tray work is almost done and maybe one area is blocked.',
  },
  {
    id: 'writing_weekly_progress_report',
    title: 'Weekly Progress Report',
    category: 'Weekly Progress Report',
    discipline: 'Project Management',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'A project engineer must summarize weekly MEP progress, delays, and recovery actions for the client report.',
    task: 'Convert informal notes into a structured weekly progress report section.',
    expectedStructure: [
      'Overall progress',
      'Key achievements',
      'Delays and causes',
      'Recovery plan',
    ],
    targetVocabulary: [
      'milestone',
      'critical path',
      'recovery action',
      'forecast',
      'constraint log',
    ],
    grammarFocus: [
      'present perfect for weekly achievements',
      'modal verbs for recovery actions',
    ],
    strongPhrase:
      'The weekly progress remains on the planned curve, except for the delayed AHU delivery affecting Level 4 ductwork.',
    weakPhrase: 'This week was fine but AHU delivery is late.',
  },
  {
    id: 'writing_delay_explanation',
    title: 'Delay Explanation',
    category: 'Delay Explanation',
    discipline: 'Project Controls',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    scenario:
      'Switchgear delivery is delayed because protection relays are unavailable from the supplier.',
    task: 'Write a factual delay explanation with recovery measures.',
    expectedStructure: [
      'Delayed item',
      'Root cause',
      'Schedule impact',
      'Mitigation',
    ],
    targetVocabulary: [
      'delivery delay',
      'supply chain',
      'mitigation',
      'recovery plan',
      'critical path',
    ],
    grammarFocus: ['due to', 'is expected to', 'will be mitigated by'],
    strongPhrase:
      'The switchgear delivery delay is caused by supplier backlog for protection relays and affects the substation energization path.',
    weakPhrase: 'Switchgear is late because supplier has problem.',
  },
  {
    id: 'writing_contractor_instruction',
    title: 'Contractor Instruction',
    category: 'Contractor Instruction',
    discipline: 'Construction Management',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'The contractor must stop installation until revised coordinated drawings are approved.',
    task: 'Write a clear instruction without sounding aggressive.',
    expectedStructure: [
      'Instruction',
      'Reason',
      'Required evidence',
      'Restart condition',
    ],
    targetVocabulary: [
      'instruction',
      'suspend works',
      'coordinated drawing',
      'approval',
      'restart',
    ],
    grammarFocus: ['imperative formal tone', 'until clauses'],
    strongPhrase:
      'Please suspend installation in this area until the revised coordinated drawing is approved and issued for construction.',
    weakPhrase: 'Stop work now because drawings are wrong.',
  },
  {
    id: 'writing_commissioning_summary',
    title: 'Commissioning Summary',
    category: 'Commissioning Summary',
    discipline: 'Commissioning',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    scenario:
      'A commissioning lead must summarize completed tests, failed interfaces, and next actions.',
    task: 'Write a commissioning summary for the client weekly report.',
    expectedStructure: [
      'Completed tests',
      'Outstanding issues',
      'Risk',
      'Next action',
    ],
    targetVocabulary: [
      'commissioning',
      'interface test',
      'outstanding item',
      'functional verification',
      'handover',
    ],
    grammarFocus: ['summary sequencing', 'present perfect passive'],
    strongPhrase:
      'Functional verification has been completed for the generator start signal, while the BMS alarm interface remains outstanding.',
    weakPhrase: 'Commissioning mostly finished but BMS alarm not done.',
  },
  {
    id: 'writing_handover_report',
    title: 'Handover Report',
    category: 'Handover Report',
    discipline: 'Handover',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    scenario:
      'A project engineer must prepare a handover status for a completed electrical room.',
    task: 'Write a handover report paragraph with documents and remaining conditions.',
    expectedStructure: [
      'Area status',
      'Completed systems',
      'Submitted documents',
      'Remaining conditions',
    ],
    targetVocabulary: [
      'handover',
      'as-built drawing',
      'O&M manual',
      'training record',
      'snag closure',
    ],
    grammarFocus: ['completed passive', 'remaining conditions'],
    strongPhrase:
      'The electrical room is ready for conditional handover subject to final snag closure and approval of the O&M manual.',
    weakPhrase: 'Electrical room can hand over if small things finish.',
  },
  {
    id: 'writing_punch_list',
    title: 'Punch List',
    category: 'Punch List',
    discipline: 'Handover',
    cefrLevel: 'B1',
    difficulty: 'Beginner',
    scenario:
      'Several minor defects remain before a room can be handed over to the client.',
    task: 'Write punch list items with clear closure requirements.',
    expectedStructure: [
      'Location',
      'Defect',
      'Required action',
      'Closure evidence',
    ],
    targetVocabulary: [
      'punch list',
      'defect',
      'closure',
      'snagging',
      'handover',
    ],
    grammarFocus: ['short imperative items', 'location prepositions'],
    strongPhrase:
      'Room 3.12 remains open due to missing device labels and incomplete ceiling access panel cleaning.',
    weakPhrase: 'Room has small things not finished.',
  },
];
