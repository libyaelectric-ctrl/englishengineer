import type { ListeningMission } from './listening.types';

export const STARTER_LISTENING_MISSIONS: ListeningMission[] = [
  {
    id: 'listening_a1_safe_room',
    title: 'Safe Electrical Room',
    description:
      'Listen for a room, equipment status, and a simple instruction.',
    missionType: 'Inspection',
    discipline: 'Electrical Engineering',
    cefrLevel: 'A1',
    difficulty: 'Beginner',
    estimatedMinutes: 5,
    audioUrl: '/audio/listening_a1_safe_room.wav',
    audioDurationSeconds: 14,
    accentLabel: 'Clear international English',
    audioSourceLabel: 'Beginner production audio',
    transcript:
      'The electrical team is in Room A. They check the panel. The main switch is off. The area is safe. The supervisor says, start the visual inspection now.',
    hiddenTranscript:
      'The electrical team is in [Room A]. They check the [panel]. The main switch is [off]. The area is [safe]. The supervisor says, start the [visual inspection] now.',
    keywords: ['Room A', 'panel', 'switch', 'safe', 'inspection'],
    vocabulary: [
      {
        term: 'main switch',
        definition: 'The main control used to connect or disconnect power.',
        context: 'The main switch is off.',
      },
      {
        term: 'visual inspection',
        definition: 'A check made by looking carefully at equipment.',
        context: 'Start the visual inspection now.',
      },
    ],
    questions: [
      {
        id: 'listening_a1_q1',
        type: 'multiple_choice',
        questionText: 'Where is the team?',
        choices: ['A) Room A', 'B) Corridor Two', 'C) The roof'],
        correctAnswer: 'A',
        explanation: 'The speaker says the team is in Room A.',
      },
      {
        id: 'listening_a1_q2',
        type: 'true_false',
        questionText: 'The main switch is on.',
        correctAnswer: 'false',
        explanation: 'The main switch is off.',
      },
    ],
    xpReward: 25,
    coinReward: 8,
    eloReward: 4,
  },
  {
    id: 'listening_a2_cable_tray_progress',
    title: 'Cable Tray Progress',
    description: 'Listen for quantity, location, and the next site action.',
    missionType: 'Daily Coordination',
    discipline: 'Electrical Engineering',
    cefrLevel: 'A2',
    difficulty: 'Beginner',
    estimatedMinutes: 7,
    audioUrl: '/audio/listening_a2_cable_tray_progress.wav',
    audioDurationSeconds: 15,
    accentLabel: 'Clear international English',
    audioSourceLabel: 'Beginner production audio',
    transcript:
      'Today we installed ten metres of cable tray in Corridor Two. The team will continue after lunch. One support is missing near Grid B4, so the supervisor will check it before work continues.',
    hiddenTranscript:
      'Today we installed [ten metres] of cable tray in [Corridor Two]. The team will continue [after lunch]. One [support] is missing near [Grid B4], so the supervisor will check it before work continues.',
    keywords: [
      'ten metres',
      'cable tray',
      'Corridor Two',
      'support',
      'Grid B4',
    ],
    vocabulary: [
      {
        term: 'cable tray',
        definition: 'A support system used to carry electrical cables.',
        context: 'The team installed ten metres of cable tray.',
      },
      {
        term: 'support',
        definition: 'A part that holds the cable tray in place.',
        context: 'One support is missing near Grid B4.',
      },
    ],
    questions: [
      {
        id: 'listening_a2_q1',
        type: 'multiple_choice',
        questionText: 'How much cable tray was installed?',
        choices: ['A) Ten metres', 'B) Two metres', 'C) Twenty metres'],
        correctAnswer: 'A',
        explanation: 'The speaker reports ten metres.',
      },
      {
        id: 'listening_a2_q2',
        type: 'multiple_choice',
        questionText: 'What is missing near Grid B4?',
        choices: ['A) A support', 'B) A panel', 'C) A door'],
        correctAnswer: 'A',
        explanation: 'One support is missing near Grid B4.',
      },
    ],
    xpReward: 35,
    coinReward: 10,
    eloReward: 6,
  },
  {
    id: 'listening_b1_panel_inspection_update',
    title: 'Panel Inspection Update',
    description:
      'Follow a short inspection update, identify the open issue, and confirm the next action.',
    missionType: 'Inspection',
    discipline: 'Electrical Engineering',
    cefrLevel: 'B1',
    difficulty: 'Intermediate',
    estimatedMinutes: 8,
    audioUrl: '/audio/listening_b1_panel_inspection_update.wav',
    audioDurationSeconds: 20,
    accentLabel: 'Clear international English',
    audioSourceLabel: 'B1 production audio',
    transcript:
      'The team completed the visual inspection of Panel L V Three this morning. Most labels are correct, but two outgoing feeders still need circuit numbers. The contractor will update the labels before the consultant inspection at two o clock. Please send a photo when the work is complete.',
    hiddenTranscript:
      'The team completed the [visual inspection] of [Panel LV3] this morning. Most [labels] are correct, but two outgoing [feeders] still need circuit numbers. The contractor will update the labels before the [consultant inspection] at two o clock. Please send a photo when the work is complete.',
    keywords: [
      'visual inspection',
      'Panel LV3',
      'labels',
      'feeders',
      'consultant inspection',
    ],
    vocabulary: [
      {
        term: 'outgoing feeder',
        definition:
          'A circuit that carries power away from a distribution panel.',
        context: 'Two outgoing feeders still need circuit numbers.',
      },
      {
        term: 'circuit number',
        definition: 'The identification assigned to an electrical circuit.',
        context: 'The contractor will add the missing circuit numbers.',
      },
    ],
    questions: [
      {
        id: 'listening_b1_q1',
        type: 'multiple_choice',
        questionText: 'What remains incomplete?',
        choices: [
          'A) Two feeder labels',
          'B) The panel installation',
          'C) The visual inspection',
        ],
        correctAnswer: 'A',
        explanation: 'Two outgoing feeders still need circuit numbers.',
      },
      {
        id: 'listening_b1_q2',
        type: 'multiple_choice',
        questionText: 'What evidence should be sent after completion?',
        choices: ['A) A test certificate', 'B) A photo', 'C) A delivery note'],
        correctAnswer: 'B',
        explanation: 'The speaker asks the team to send a photo.',
      },
    ],
    xpReward: 45,
    coinReward: 12,
    eloReward: 8,
  },
];
