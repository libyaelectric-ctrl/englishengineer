import { WritingSpec } from './writing.types';

export const WRITING_DESIGN_SPECS: WritingSpec[] = [
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
];
