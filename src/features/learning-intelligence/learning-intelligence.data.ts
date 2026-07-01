import {
  CareerRole,
  DailyCommunicationTask,
  MistakeCategory,
} from './learning-intelligence.types';

export const CAREER_ROLES: CareerRole[] = [
  'Electrical Works Chief',
  'MEP Coordinator',
  'QA/QC Engineer',
  'Commissioning Engineer',
  'Site Engineer',
  'Procurement Engineer',
  'HSE Engineer',
  'Data Center Engineer',
  'Project Manager',
];

export const MISTAKE_CATEGORIES: MistakeCategory[] = [
  'Vocabulary',
  'Grammar',
  'Listening',
  'Writing Structure',
  'Speaking Response',
  'CEFR Mismatch',
];

export const MISTAKE_SUGGESTIONS: Record<MistakeCategory, string> = {
  Vocabulary: 'Review the term, meaning and one controlled example sentence.',
  Grammar: 'Check tense consistency, word order and subject-verb agreement.',
  Listening: 'Replay the key sentence and record the missed information.',
  'Writing Structure': 'Separate context, issue, impact and required action.',
  'Speaking Response':
    'Build a short response with one clear point per sentence.',
  'CEFR Mismatch':
    'Repeat the task with grammar and vocabulary at your current skill level.',
  grammar: 'Check tense consistency and subject-verb agreement.',
  'word choice': 'Replace general words with the exact engineering term.',
  tone: 'Use a factual request with an owner and date instead of blame.',
  'unclear sentence': 'Separate cause, impact and required action.',
  'Turkish thinking pattern':
    'Use direct English word order: subject, action, object, condition.',
  'missing article':
    'Check whether a singular countable noun needs a, an or the.',
  'wrong preposition': 'Record the complete phrase, not the preposition alone.',
  'weak technical explanation':
    'Define the issue, evidence, consequence and next action.',
  'repeated vocabulary gap':
    'Save the missing term to Vocabulary Review with one site example.',
  clarity: 'Use one idea per sentence and name the responsible party.',
  preposition:
    'Learn the full collocation, for example responsible for or comply with.',
  article: 'Use the for a known project item and a/an for a first mention.',
  'repeated phrase issue':
    'Save one corrected professional phrase and reuse it in three contexts.',
};

export const BASE_DAILY_TASKS: DailyCommunicationTask[] = [
  {
    id: 'daily-reading',
    module: 'Reading',
    title: 'Read a consultant comment',
    description: 'Identify the requirement, evidence and action owner.',
    route: '/reading',
    estimatedMinutes: 10,
    level: 'A1',
  },
  {
    id: 'daily-writing',
    module: 'Writing',
    title: 'Write a site update',
    description:
      'Produce a concise progress note with cause, impact and action.',
    route: '/writing',
    estimatedMinutes: 12,
    level: 'A1',
  },
  {
    id: 'daily-listening',
    module: 'Listening',
    title: 'Listen to a coordination exchange',
    description: 'Capture decisions, dates and responsibilities.',
    route: '/listening',
    estimatedMinutes: 10,
    level: 'A1',
  },
  {
    id: 'daily-speaking',
    module: 'Speaking',
    title: 'Deliver a 60-second briefing',
    description: 'Explain today’s work front and one technical constraint.',
    route: '/speaking',
    estimatedMinutes: 8,
    level: 'A1',
  },
  {
    id: 'daily-vocabulary',
    module: 'Vocabulary',
    title: 'Review engineering vocabulary',
    description: 'Complete the due review set and revisit weak terms.',
    route: '/vocabulary',
    estimatedMinutes: 8,
    level: 'A1',
  },
  {
    id: 'daily-quick-ai',
    module: 'Quick AI',
    title: 'Improve one real work message',
    description: 'Use a clear provider-labelled rewrite action.',
    route: '/quick-tools',
    estimatedMinutes: 5,
    level: 'A1',
  },
];

export const ROLE_PRIORITY: Record<
  CareerRole,
  DailyCommunicationTask['module'][]
> = {
  'Electrical Works Chief': [
    'Speaking',
    'Writing',
    'Reading',
    'Vocabulary',
    'Listening',
    'Quick AI',
  ],
  'MEP Coordinator': [
    'Speaking',
    'Listening',
    'Writing',
    'Reading',
    'Vocabulary',
    'Quick AI',
  ],
  'QA/QC Engineer': [
    'Writing',
    'Reading',
    'Vocabulary',
    'Speaking',
    'Listening',
    'Quick AI',
  ],
  'Commissioning Engineer': [
    'Listening',
    'Speaking',
    'Writing',
    'Vocabulary',
    'Reading',
    'Quick AI',
  ],
  'Site Engineer': [
    'Speaking',
    'Writing',
    'Listening',
    'Vocabulary',
    'Reading',
    'Quick AI',
  ],
  'Procurement Engineer': [
    'Writing',
    'Vocabulary',
    'Reading',
    'Speaking',
    'Listening',
    'Quick AI',
  ],
  'HSE Engineer': [
    'Speaking',
    'Writing',
    'Vocabulary',
    'Listening',
    'Reading',
    'Quick AI',
  ],
  'Data Center Engineer': [
    'Listening',
    'Speaking',
    'Reading',
    'Writing',
    'Vocabulary',
    'Quick AI',
  ],
  'Project Manager': [
    'Speaking',
    'Writing',
    'Listening',
    'Reading',
    'Quick AI',
    'Vocabulary',
  ],
};

export const ROLE_RECOMMENDATIONS: Record<CareerRole, string[]> = {
  'Electrical Works Chief': [
    'Consultant response writing',
    'Progress explanation',
    'NCR reply',
    'Generator test summary',
    'MEP coordination phrase practice',
  ],
  'MEP Coordinator': [
    'Clash resolution note',
    'Coordination meeting summary',
    'Interface clarification',
    'Ceiling closure action',
    'Consultant phrase practice',
  ],
  'QA/QC Engineer': [
    'NCR response',
    'Inspection request',
    'MIR/WIR comment',
    'Corrective action explanation',
    'Punch list closure',
  ],
  'Commissioning Engineer': [
    'Test report summary',
    'Cause-and-effect explanation',
    'SAT/FAT vocabulary',
    'Energization readiness',
    'Issue log update',
  ],
  'Site Engineer': [
    'Daily progress note',
    'Inspection request',
    'Site coordination briefing',
    'Material follow-up',
    'Delay explanation',
  ],
  'Procurement Engineer': [
    'Material follow-up email',
    'Delivery delay explanation',
    'Certificate request',
    'Vendor clarification',
    'Alternative material proposal',
  ],
  'HSE Engineer': [
    'Toolbox talk phrase',
    'Incident report note',
    'Risk assessment explanation',
    'Safety instruction',
    'Permit-to-work clarification',
  ],
  'Data Center Engineer': [
    'Integrated systems update',
    'UPS test summary',
    'Interface risk explanation',
    'Commissioning vocabulary',
    'Client readiness note',
  ],
  'Project Manager': [
    'Weekly progress summary',
    'Critical path explanation',
    'Client decision request',
    'Recovery plan',
    'Meeting action closure',
  ],
};
