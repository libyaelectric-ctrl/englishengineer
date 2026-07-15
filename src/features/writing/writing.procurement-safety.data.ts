import { WritingSpec } from './writing.types';

export const WRITING_PROCUREMENT_SAFETY_SPECS: WritingSpec[] = [
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
];
