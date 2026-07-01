import { MissionDifficulty } from '@/core/learning/learning.types';
import { CefrLevel } from '@/features/level-system';
import { WritingMission } from './writing.types';
import { STARTER_WRITING_MISSIONS } from './writing.starter.data';

type WritingSpec = {
  id: string;
  title: string;
  category: string;
  discipline: string;
  cefrLevel: CefrLevel;
  difficulty: MissionDifficulty;
  scenario: string;
  task: string;
  expectedStructure: string[];
  targetVocabulary: string[];
  grammarFocus: string[];
  strongPhrase: string;
  weakPhrase: string;
};

const rubric = {
  clarity:
    'The message explains the issue, status, impact, and required action without ambiguity.',
  technicalAccuracy:
    'The response uses evidence, quantities, dates, references, and discipline-specific facts accurately.',
  grammar:
    'The answer controls tense, articles, sentence boundaries, and passive voice for professional engineering writing.',
  professionalTone:
    'The answer is factual, respectful, non-defensive, and suitable for client or consultant review.',
  conciseness:
    'The answer avoids unnecessary repetition while keeping all required technical information.',
  completeness:
    'The answer includes context, evidence, impact, action owner, deadline, and required response.',
  actionOrientation:
    'The answer closes with a clear next step, responsible party, and response date.',
  structure:
    'The answer follows a professional sequence with context, evidence, action, owner, and deadline.',
  technicalVocabulary:
    'The answer uses accurate engineering terminology instead of vague site language.',
};

const buildMission = (spec: WritingSpec, index: number): WritingMission => ({
  id: spec.id,
  title: spec.title,
  description: spec.task,
  discipline: spec.discipline,
  cefrLevel: spec.cefrLevel,
  difficulty: spec.difficulty,
  estimatedMinutes:
    spec.difficulty === 'Advanced'
      ? 24
      : spec.difficulty === 'Intermediate'
        ? 18
        : 14,
  initialDraft: `${spec.weakPhrase} We did some work and there is a problem. Please check and approve fast because the team is waiting.`,
  corrections: [
    {
      id: `${spec.id}_grammar`,
      type: 'grammar',
      text: 'Use complete professional sentence structure with clear tense and responsibility.',
      original: 'We did some work',
      fix: `The ${spec.category.toLowerCase()} activity was completed in line with the approved sequence`,
    },
    {
      id: `${spec.id}_vocabulary`,
      type: 'vocabulary',
      text: 'Replace vague wording with discipline-specific engineering vocabulary.',
      original: 'there is a problem',
      fix: spec.strongPhrase,
    },
    {
      id: `${spec.id}_style`,
      type: 'style',
      text: 'Replace urgent informal approval language with a controlled action request.',
      original: 'approve fast because the team is waiting',
      fix: 'review the attached evidence and confirm acceptance or comments by the agreed response date',
    },
  ],
  xpReward: 70 + index * 2,
  coinReward: 20 + Math.floor(index / 3),
  eloReward: 12 + Math.floor(index / 4),
  scenario: spec.scenario,
  task: spec.task,
  expectedStructure: spec.expectedStructure,
  targetVocabulary: spec.targetVocabulary,
  grammarFocus: spec.grammarFocus,
  assessmentRubric: rubric,
  sampleExcellentAnswer: `Subject: ${spec.title}. ${spec.strongPhrase} The impact, evidence, responsible party, and required next action are summarized below for review. Please advise if further clarification is required before the next coordination milestone.`,
  sampleWeakAnswer: `${spec.weakPhrase} We need approval quickly and the site team is waiting.`,
  feedbackHints: [
    'Start with project context and document reference.',
    'State the technical issue or progress using measurable evidence.',
    'Close with a clear action, owner, and deadline.',
  ],
});

const WRITING_SPECS: WritingSpec[] = [
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
    id: 'writing_consultant_reply',
    title: 'Consultant Reply',
    category: 'Consultant Reply',
    discipline: 'MEP Coordination',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    scenario:
      'A consultant commented on insufficient clearance around an LV panel in a plant room layout.',
    task: 'Write a professional reply with evidence, drawing reference, and proposed action.',
    expectedStructure: [
      'Reference',
      'Acknowledgement',
      'Technical response',
      'Action and attachment',
    ],
    targetVocabulary: [
      'clearance',
      'access envelope',
      'shop drawing',
      'compliance',
      'resubmission',
    ],
    grammarFocus: ['formal acknowledgement', 'conditional action language'],
    strongPhrase:
      'The revised shop drawing restores the required maintenance clearance around the LV panel access envelope.',
    weakPhrase: 'We moved the panel and now it is okay.',
  },
  {
    id: 'writing_material_submittal',
    title: 'Material Submittal',
    category: 'Material Submittal',
    discipline: 'Procurement',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'The procurement engineer must submit pump datasheets, compliance statements, and certificates for review.',
    task: 'Improve the submittal cover note for consultant review.',
    expectedStructure: [
      'Submission reference',
      'Included documents',
      'Compliance statement',
      'Review request',
    ],
    targetVocabulary: [
      'datasheet',
      'compliance statement',
      'certificate',
      'technical schedule',
      'deviation',
    ],
    grammarFocus: ['formal listing language', 'passive voice'],
    strongPhrase:
      'The material submittal includes datasheets, compliance statements, certificates, and the completed technical schedule.',
    weakPhrase: 'We send the pump papers and it should be accepted.',
  },
  {
    id: 'writing_ncr_response',
    title: 'NCR Response',
    category: 'NCR Response',
    discipline: 'QA/QC',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    scenario:
      'A non-conformance was raised because cable tray supports were installed without approved spacing.',
    task: 'Write a corrective action response for the NCR register.',
    expectedStructure: [
      'NCR reference',
      'Root cause',
      'Correction',
      'Preventive action',
    ],
    targetVocabulary: [
      'non-conformance',
      'root cause',
      'corrective action',
      'preventive action',
      'verification',
    ],
    grammarFocus: [
      'cause-effect clauses',
      'future passive for corrective work',
    ],
    strongPhrase:
      'The root cause was uncontrolled installation before approval of the coordinated support spacing schedule.',
    weakPhrase: 'The installer made mistake and we fixed it.',
  },
  {
    id: 'writing_mir_comment',
    title: 'MIR Comment',
    category: 'MIR Comment',
    discipline: 'QA/QC',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'An MIR for delivered cable drums requires a comment about missing manufacturer test certificates.',
    task: 'Draft a clear inspection comment for the MIR form.',
    expectedStructure: [
      'Material inspected',
      'Observed issue',
      'Required document',
      'Hold/accept status',
    ],
    targetVocabulary: [
      'MIR',
      'test certificate',
      'delivery note',
      'inspection status',
      'hold point',
    ],
    grammarFocus: ['inspection passive voice', 'must/shall requirements'],
    strongPhrase:
      'The cable drums are physically acceptable, but manufacturer test certificates are missing from the MIR package.',
    weakPhrase: 'Cable looks okay but documents missing.',
  },
  {
    id: 'writing_itp_observation',
    title: 'ITP Observation',
    category: 'ITP Observation',
    discipline: 'QA/QC',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'During an ITP witness point, the inspector observes incomplete torque marking on busbar bolts.',
    task: 'Write a professional observation note with required closure evidence.',
    expectedStructure: [
      'ITP stage',
      'Observation',
      'Required correction',
      'Closure evidence',
    ],
    targetVocabulary: [
      'witness point',
      'torque marking',
      'hold point',
      'closure evidence',
      'inspection record',
    ],
    grammarFocus: ['observed that clauses', 'require plus noun phrase'],
    strongPhrase:
      'Torque marking was incomplete on several busbar bolts and must be verified before closing the witness point.',
    weakPhrase: 'Some bolts have no marks and need checking.',
  },
  {
    id: 'writing_fat_report',
    title: 'FAT Report',
    category: 'FAT Report',
    discipline: 'Testing',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    scenario:
      'A factory acceptance test for LV panels passed most checks but one interlock sequence failed.',
    task: 'Write the FAT report conclusion and open item.',
    expectedStructure: [
      'Test scope',
      'Passed checks',
      'Failed item',
      'Required rectification',
    ],
    targetVocabulary: [
      'factory acceptance test',
      'interlock',
      'functional check',
      'open item',
      'rectification',
    ],
    grammarFocus: ['contrast clauses', 'formal result statements'],
    strongPhrase:
      'All routine FAT checks were accepted except the circuit breaker interlock sequence, which remains an open item.',
    weakPhrase: 'FAT is mostly okay but one thing failed.',
  },
  {
    id: 'writing_sat_report',
    title: 'SAT Report',
    category: 'SAT Report',
    discipline: 'Commissioning',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    scenario:
      'A site acceptance test for the fire alarm interface passed after retesting the AHU shutdown signal.',
    task: 'Create a site acceptance test summary suitable for handover records.',
    expectedStructure: [
      'System tested',
      'Test result',
      'Retest note',
      'Handover status',
    ],
    targetVocabulary: [
      'site acceptance test',
      'interface',
      'retest',
      'handover record',
      'response time',
    ],
    grammarFocus: ['past passive', 'after plus gerund'],
    strongPhrase:
      'The SAT was accepted after retesting confirmed the AHU shutdown signal within the specified response time.',
    weakPhrase: 'SAT passed after we tried again.',
  },
  {
    id: 'writing_generator_load_test',
    title: 'Generator Load Test',
    category: 'Generator Load Test',
    discipline: 'Power Generation',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    scenario:
      'A generator load test shows acceptable frequency recovery but a minor coolant temperature rise.',
    task: 'Write a technical test observation with next action.',
    expectedStructure: [
      'Test condition',
      'Measured result',
      'Observation',
      'Recommendation',
    ],
    targetVocabulary: [
      'load bank',
      'frequency recovery',
      'coolant temperature',
      'step load',
      'acceptance criteria',
    ],
    grammarFocus: ['although clauses', 'measured result language'],
    strongPhrase:
      'Frequency recovery met the acceptance criteria, although coolant temperature increased near the upper warning limit.',
    weakPhrase: 'The generator was okay but temperature was high.',
  },
  {
    id: 'writing_lv_panel_issue',
    title: 'LV Panel Issue',
    category: 'LV Panel Issue',
    discipline: 'Electrical Engineering',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'Thermal imaging found a hotspot on an LV panel busbar joint during maintenance inspection.',
    task: 'Write a concise defect notification for the maintenance team.',
    expectedStructure: [
      'Panel reference',
      'Defect',
      'Risk',
      'Required outage action',
    ],
    targetVocabulary: [
      'hotspot',
      'busbar joint',
      'contact resistance',
      'outage',
      'retorque',
    ],
    grammarFocus: ['risk language', 'recommended action'],
    strongPhrase:
      'A hotspot was detected on the Phase B busbar joint, indicating possible high contact resistance.',
    weakPhrase: 'Panel is hot in one place.',
  },
  {
    id: 'writing_fire_alarm_commissioning',
    title: 'Fire Alarm Commissioning',
    category: 'Fire Alarm Commissioning',
    discipline: 'Life Safety',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'A cause-and-effect test confirmed sounder activation but the damper feedback signal is missing.',
    task: 'Write a commissioning observation for the test sheet.',
    expectedStructure: [
      'Cause input',
      'Expected effect',
      'Actual result',
      'Action required',
    ],
    targetVocabulary: [
      'cause-and-effect',
      'damper feedback',
      'sounder',
      'interface',
      'test sheet',
    ],
    grammarFocus: ['expected versus actual', 'passive result language'],
    strongPhrase:
      'Sounder activation was verified, but the fire smoke damper feedback signal was not received at the panel.',
    weakPhrase: 'Sounder works but damper signal not coming.',
  },
  {
    id: 'writing_cable_tray_installation',
    title: 'Cable Tray Installation',
    category: 'Cable Tray Installation',
    discipline: 'Electrical Installation',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'Cable tray installation is complete, but one section needs additional support near a bend.',
    task: 'Write an installation status note with a corrective action.',
    expectedStructure: [
      'Installed area',
      'Compliance status',
      'Exception',
      'Corrective action',
    ],
    targetVocabulary: [
      'cable tray',
      'support bracket',
      'bend radius',
      'galvanized ladder',
      'as-built',
    ],
    grammarFocus: ['exception reporting', 'shall be installed'],
    strongPhrase:
      'The cable tray installation is complete except for one additional support bracket required near the horizontal bend.',
    weakPhrase: 'Tray is done but one support maybe needed.',
  },
  {
    id: 'writing_method_statement_review',
    title: 'Method Statement Review',
    category: 'Method Statement Review',
    discipline: 'Construction Management',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    scenario:
      'A method statement for transformer installation lacks lifting plan details and exclusion zone controls.',
    task: 'Write a consultant-style review comment.',
    expectedStructure: [
      'Document reference',
      'Missing information',
      'Risk',
      'Required revision',
    ],
    targetVocabulary: [
      'method statement',
      'lifting plan',
      'exclusion zone',
      'risk assessment',
      'approval status',
    ],
    grammarFocus: ['must include', 'before approval can be granted'],
    strongPhrase:
      'The method statement cannot be accepted until the lifting plan and exclusion zone controls are incorporated.',
    weakPhrase: 'The method statement misses lifting details.',
  },
  {
    id: 'writing_shop_drawing_revision',
    title: 'Shop Drawing Revision',
    category: 'Shop Drawing Revision',
    discipline: 'Design Coordination',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'A shop drawing was revised to reroute chilled water pipes around a new structural column.',
    task: 'Draft a revision note explaining the technical change.',
    expectedStructure: [
      'Revision reference',
      'Reason for change',
      'Technical change',
      'Impact',
    ],
    targetVocabulary: [
      'shop drawing',
      'revision',
      'reroute',
      'clearance',
      'coordination',
    ],
    grammarFocus: ['because of', 'has been revised to'],
    strongPhrase:
      'The chilled water pipe route has been revised to avoid the new structural column at Grid E-12.',
    weakPhrase: 'We changed the pipe because column is there.',
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
    id: 'writing_procurement_follow_up',
    title: 'Procurement Follow-up',
    category: 'Procurement Follow-up',
    discipline: 'Procurement',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'A supplier has not confirmed delivery dates for fire alarm modules required for commissioning.',
    task: 'Write a professional follow-up email requesting commitment.',
    expectedStructure: [
      'Reference',
      'Pending item',
      'Required date',
      'Escalation risk',
    ],
    targetVocabulary: [
      'delivery commitment',
      'lead time',
      'expedite',
      'commissioning window',
      'pending confirmation',
    ],
    grammarFocus: ['polite request', 'deadline language'],
    strongPhrase:
      'Please confirm the delivery commitment for the fire alarm modules to protect the commissioning window.',
    weakPhrase: 'Send the modules date soon.',
  },
  {
    id: 'writing_technical_clarification',
    title: 'Technical Clarification',
    category: 'Technical Clarification',
    discipline: 'Design Coordination',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    scenario:
      'The drawings conflict on whether a pump should be connected to normal or emergency power.',
    task: 'Draft a technical clarification request.',
    expectedStructure: [
      'Conflict reference',
      'Technical question',
      'Impact',
      'Requested clarification',
    ],
    targetVocabulary: [
      'technical clarification',
      'power source',
      'drawing discrepancy',
      'emergency supply',
      'design intent',
    ],
    grammarFocus: ['indirect questions', 'impact statements'],
    strongPhrase:
      'Please clarify the intended power source for the pump, as the schematic and equipment schedule conflict.',
    weakPhrase: 'Which power should pump use? Drawings are different.',
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
  {
    id: 'writing_safety_observation',
    title: 'Safety Observation',
    category: 'Safety Observation',
    discipline: 'HSE',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'A technician entered an energized panel area without the correct arc-flash PPE.',
    task: 'Write a safety observation with immediate corrective action.',
    expectedStructure: [
      'Observation',
      'Risk',
      'Immediate action',
      'Preventive action',
    ],
    targetVocabulary: [
      'safety observation',
      'arc-flash PPE',
      'energized area',
      'permit',
      'toolbox talk',
    ],
    grammarFocus: ['risk consequence', 'must be'],
    strongPhrase:
      'A technician entered the energized panel area without the required arc-flash PPE, creating a serious exposure risk.',
    weakPhrase: 'Technician went inside without PPE.',
  },
  {
    id: 'writing_loto_instruction',
    title: 'LOTO Instruction',
    category: 'LOTO Instruction',
    discipline: 'Electrical Safety',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario: 'A team must isolate a 415V switchboard before inspection.',
    task: 'Write a step-by-step lockout-tagout instruction.',
    expectedStructure: [
      'Isolation point',
      'Locking step',
      'Verification',
      'Release condition',
    ],
    targetVocabulary: [
      'lockout-tagout',
      'isolator',
      'zero voltage',
      'padlock',
      'permit',
    ],
    grammarFocus: ['sequence connectors', 'must before'],
    strongPhrase:
      'Before inspection starts, the upstream breaker and local isolator must be locked and verified for zero voltage.',
    weakPhrase: 'Lock the power and check it.',
  },
  {
    id: 'writing_coordination_meeting_minutes',
    title: 'Coordination Meeting Minutes',
    category: 'Coordination Meeting Minutes',
    discipline: 'Meetings',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    scenario:
      'A coordination meeting agreed actions for cable tray rerouting and AHU access clearance.',
    task: 'Write concise meeting minutes with owners and deadlines.',
    expectedStructure: ['Decision', 'Action owner', 'Deadline', 'Open item'],
    targetVocabulary: [
      'meeting minutes',
      'action owner',
      'deadline',
      'open item',
      'coordination decision',
    ],
    grammarFocus: ['reported speech', 'action item format'],
    strongPhrase:
      'The meeting agreed to reroute the cable tray below the AHU access zone, with the MEP coordinator to issue revised drawings by Thursday.',
    weakPhrase: 'We talked and agreed tray will move.',
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
];

export const WRITING_MISSIONS: WritingMission[] = [
  ...STARTER_WRITING_MISSIONS,
  ...WRITING_SPECS.map(buildMission),
];
