import { WritingSpec } from './writing.types';

export const WRITING_QAQC_SPECS: WritingSpec[] = [
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
];
