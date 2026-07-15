import { WritingSpec } from './writing.types';

export const WRITING_ELECTRICAL_SPECS: WritingSpec[] = [
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
];
