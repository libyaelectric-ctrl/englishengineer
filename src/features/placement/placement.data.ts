import type { PlacementQuestion } from './placement.types';

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'placement_1',
    domain: 'vocabulary',
    band: 'A1',
    prompt: 'Which word means a place where engineers work on construction?',
    choices: ['Site', 'Invoice', 'Agenda', 'Supplier'],
    correctIndex: 0,
  },
  {
    id: 'placement_2',
    domain: 'grammar',
    band: 'A2',
    prompt: 'Choose the correct sentence.',
    choices: [
      'The panel is ready for inspection.',
      'The panel are ready for inspection.',
      'The panel ready inspection.',
      'The panel is ready inspect yesterday.',
    ],
    correctIndex: 0,
  },
  {
    id: 'placement_3',
    domain: 'reading',
    band: 'A2+',
    prompt:
      'The delivery is delayed until Thursday. When is the new delivery day?',
    choices: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    correctIndex: 3,
  },
  {
    id: 'placement_4',
    domain: 'vocabulary',
    band: 'B1',
    prompt: 'What is a punch list?',
    choices: [
      'A list of remaining defects or incomplete work',
      'A list of employee salaries',
      'A construction drawing index',
      'A daily attendance sheet',
    ],
    correctIndex: 0,
  },
  {
    id: 'placement_5',
    domain: 'grammar',
    band: 'B1+',
    prompt: 'Choose the clearest professional update.',
    choices: [
      'We complete it maybe tomorrow.',
      'Completion is expected tomorrow, subject to final inspection.',
      'Tomorrow it finish if inspection.',
      'It was completion tomorrow.',
    ],
    correctIndex: 1,
  },
  {
    id: 'placement_6',
    domain: 'reading',
    band: 'B2',
    prompt:
      'The consultant accepted the proposal conditionally, pending revised calculations. What must happen next?',
    choices: [
      'Work must stop permanently',
      'The calculations must be revised and submitted',
      'The proposal is fully approved',
      'The supplier must issue an invoice',
    ],
    correctIndex: 1,
  },
  {
    id: 'placement_7',
    domain: 'vocabulary',
    band: 'C1',
    prompt: 'Which phrase best describes reducing a project risk?',
    choices: [
      'Risk mitigation',
      'Scope omission',
      'Cost escalation',
      'Design supersession',
    ],
    correctIndex: 0,
  },
  {
    id: 'placement_8',
    domain: 'reading',
    band: 'C2',
    prompt:
      'A waiver is granted without prejudice to contractual rights. What does this mean?',
    choices: [
      'All contractual rights are cancelled',
      'The waiver does not surrender other contractual rights',
      'The contract is replaced by the waiver',
      'The contractor accepts unlimited liability',
    ],
    correctIndex: 1,
  },
];
