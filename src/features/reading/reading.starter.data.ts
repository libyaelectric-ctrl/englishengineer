import type { ReadingMission } from './reading.types';

export const STARTER_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'reading_a1_site_signs',
    title: 'Basic Site Safety Signs',
    description: 'Read a short site notice and identify simple safety actions.',
    discipline: 'Construction Safety',
    cefrLevel: 'A1',
    difficulty: 'Beginner',
    estimatedMinutes: 5,
    passageText:
      'This is an electrical room. Wear a safety helmet and safety shoes. Keep the door closed. Do not enter without the supervisor.',
    vocabulary: [
      {
        term: 'electrical room',
        definition: 'A room that contains electrical equipment.',
        context: 'This is an electrical room.',
      },
      {
        term: 'supervisor',
        definition: 'The person who controls and checks the work.',
        context: 'Do not enter without the supervisor.',
      },
    ],
    questions: [
      {
        id: 'reading_a1_q1',
        type: 'multiple_choice',
        questionText: 'What must workers wear?',
        choices: ['A) A helmet and safety shoes', 'B) A coat', 'C) A mask'],
        correctAnswer: 'A',
        explanation:
          'The notice says to wear a safety helmet and safety shoes.',
      },
      {
        id: 'reading_a1_q2',
        type: 'true_false',
        questionText: 'The door should stay open.',
        correctAnswer: 'false',
        explanation: 'The notice says to keep the door closed.',
      },
    ],
    xpReward: 25,
    coinReward: 8,
    eloReward: 4,
  },
  {
    id: 'reading_a2_daily_progress',
    title: 'Simple Daily Progress Note',
    description:
      'Read a short progress update with quantities and next actions.',
    discipline: 'Electrical Engineering',
    cefrLevel: 'A2',
    difficulty: 'Beginner',
    estimatedMinutes: 7,
    passageText:
      'The electrical team installed ten metres of cable tray in Corridor Two today. The work started at 08:00 and finished at 14:00. One support is missing near Grid B4. The supervisor will check the support tomorrow morning before installation continues.',
    vocabulary: [
      {
        term: 'cable tray',
        definition: 'A support system that carries electrical cables.',
        context: 'The team installed ten metres of cable tray.',
      },
      {
        term: 'support',
        definition: 'A part that holds equipment or containment in position.',
        context: 'One support is missing near Grid B4.',
      },
    ],
    questions: [
      {
        id: 'reading_a2_q1',
        type: 'short_answer',
        questionText: 'How much cable tray was installed?',
        correctAnswer: 'Ten metres',
        keywords: ['ten', '10', 'metres', 'meters'],
        explanation: 'The progress note reports ten metres of cable tray.',
      },
      {
        id: 'reading_a2_q2',
        type: 'multiple_choice',
        questionText: 'What will the supervisor check tomorrow?',
        choices: ['A) The missing support', 'B) The door', 'C) The generator'],
        correctAnswer: 'A',
        explanation: 'The missing support near Grid B4 must be checked.',
      },
    ],
    xpReward: 35,
    coinReward: 10,
    eloReward: 6,
  },
];
