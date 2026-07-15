import type { ReadingMission } from './reading.types';

export const MEP_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'shop_drawing_rev',
    title: 'Shop Drawing Revision Note',
    description:
      'Interpret drawing modifications, bill of materials adjustments, and architectural revisions.',
    discipline: 'MEP Coordination',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    passageText:
      'This revision note details structural changes implemented in the approved shop drawing for the Central Plant Chilled Water Piping Layout (Ref: CP-CHW-DWG-002, Rev 03). The primary modification involves routing the 250mm diameter chilled water supply (CWS) and chilled water return (CWR) headers around the newly added seismic bracing column at grid line E-12. To accommodate this obstruction, four additional 45-degree long-radius elbows have been introduced to the pipeline path. This routing adjustment increases the physical length of the run by 4.2 meters, which increases the cumulative calculated friction head loss by 1.8 meters of water column (m wg). Consequently, the primary chilled water pumps must be re-calibrated; pump impellers must be trimmed or adjusted, and motor variable frequency drives (VFD) must be re-commissioned to run at 48 Hz instead of the original design point of 45 Hz to maintain the required flow rate of 120 liters per second (l/s).',
    vocabulary: [
      {
        term: 'seismic bracing',
        definition:
          'Structural reinforcements designed to protect building service piping, conduits, and equipment from collapsing or failing during earthquake events.',
        context:
          'Routing around the newly added seismic bracing column at grid line E-12.',
      },
      {
        term: 'elbow',
        definition:
          'A pipe fitting installed between two lengths of pipe or tubing to allow a change of direction, usually 90 or 45 degrees.',
        context:
          'Four additional 45-degree long-radius elbows have been introduced.',
      },
      {
        term: 'friction head loss',
        definition:
          'The reduction in total pressure head of a fluid as it flows through a piping system due to resistance between the fluid and the pipe walls.',
        context:
          'Friction head loss is increased by 1.8 meters of water column.',
      },
      {
        term: 'VFD',
        definition:
          'Variable Frequency Drive; a controller that drives an electric motor by varying the frequency and voltage supplied to the motor, controlling its speed.',
        context:
          'Motor variable frequency drives (VFD) must be re-commissioned.',
      },
    ],
    questions: [
      {
        id: 'q7_1',
        type: 'multiple_choice',
        questionText:
          'What physical pipe fitting components were added to bypass the seismic column obstruction?',
        choices: [
          'A) Four 45-degree long-radius elbows.',
          'B) Two 250mm diameter VFD pumps.',
          'C) Ceiling-hung seismic columns.',
          'D) A 4.2-meter copper bypass loop.',
        ],
        correctAnswer: 'A',
        explanation:
          'The text clearly specifies that four additional 45-degree long-radius elbows have been introduced to bypass the column at grid line E-12.',
      },
      {
        id: 'q7_2',
        type: 'keyword_answer',
        questionText:
          'What is the new operational frequency (in Hz) at which the pump VFDs must be commissioned?',
        correctAnswer: '48',
        keywords: ['48', '48 Hz', '48Hz'],
        explanation:
          'The passage states that the VFDs must be re-commissioned to run at 48 Hz.',
      },
      {
        id: 'q7_3',
        type: 'true_false',
        questionText:
          'The routing adjustment successfully reduced the cumulative friction head loss of the chilled water piping network.',
        correctAnswer: 'false',
        explanation:
          'The routing adjustment actually increased the calculated friction head loss by 1.8 meters of water column.',
      },
      {
        id: 'q7_4',
        type: 'short_answer',
        questionText:
          'What flow rate (in liters per second) must the pump recalibration sequence maintain?',
        correctAnswer:
          'The system must maintain a flow rate of 120 liters per second (l/s).',
        keywords: ['120', '120 l/s', '120 l/s flow rate', '120 liters'],
        explanation:
          'The pump recalibration must maintain the required flow rate of 120 liters per second (l/s) as stated in the text.',
      },
    ],
    xpReward: 50,
    coinReward: 15,
    eloReward: 12,
  },
  {
    id: 'mech_elec_coordination',
    title: 'Mechanical-Electrical Coordination Issue',
    description:
      'Solve complex geometric space clashes, thermal load requirements, and power feed capacity overrides.',
    discipline: 'MEP Coordination',
    cefrLevel: 'C2',
    difficulty: 'Advanced',
    estimatedMinutes: 18,
    passageText:
      'A severe mechanical-electrical spatial clash has been identified during 3D BIM coordination of the Plant Room mezzanine floor. The 600mm x 400mm supply air duct for AHU-02 directly intersects the routing path of the primary cable ladder (Containment Ref: CL-PL-01) carrying 12 parallel runs of single-core 300mm² XLPE power feeds. These power feeds supply the main chilled water plant room distribution board. Because the cables are heavy-duty single-core conductors, their bending radius is restricted to a minimum of 450mm, making any vertical offset of the cable ladder structurally impractical. Conversely, modifying the mechanical duct path introduces structural problems; diverting the duct downward would reduce the head-room clearance to 1.9 meters, which violates building safety codes (requiring minimum 2.1 meters). To resolve this coordination conflict without altering duct height, the engineering teams have agreed to split the 600x400 duct into three smaller parallel 300x200 ducts that can pass flat beneath the cable ladder, maintaining sufficient headroom and airflow capacity. The electrical team must also install thermal barrier insulation sheets to prevent heat radiated by the power cables from warming the chilled supply air.',
    vocabulary: [
      {
        term: 'BIM coordination',
        definition:
          'Building Information Modeling coordination; a process where 3D computer models of structural, architectural, mechanical, and electrical systems are overlaid to identify spatial conflicts prior to construction.',
        context:
          'A severe mechanical-electrical spatial clash was identified during 3D BIM coordination.',
      },
      {
        term: 'bending radius',
        definition:
          'The minimum radius a cable can be bent safely without causing structural damage, kink, or micro-cracks in its conductor and insulating layers.',
        context:
          'The cables bending radius is restricted to a minimum of 450mm.',
      },
      {
        term: 'XLPE',
        definition:
          'Cross-linked polyethylene; a high-durability, moisture-resistant form of thermoset insulation material used widely for high-current power cables.',
        context:
          'Carrying 12 parallel runs of single-core 300mm² XLPE power feeds.',
      },
      {
        term: 'headroom clearance',
        definition:
          'The vertical distance between the finished floor level and any ceiling obstruction, defining the safe path height for personnel.',
        context:
          'Diverting the duct downward would reduce the headroom clearance to 1.9 meters.',
      },
    ],
    questions: [
      {
        id: 'q8_1',
        type: 'multiple_choice',
        questionText:
          'What building safety violation would occur if the mechanical ventilation duct were diverted downward?',
        choices: [
          'A) It would decrease airflow capacity below AHU-02 requirements.',
          'B) Headroom clearance would drop to 1.9 meters, violating the 2.1-meter code.',
          'C) Cable bending radius would be reduced below 450mm.',
          'D) It would create a thermal hot spot in the chilled water distribution board.',
        ],
        correctAnswer: 'B',
        explanation:
          'Diverting the duct downward reduces the headroom clearance to 1.9 meters, which violates the building safety code of a minimum of 2.1 meters.',
      },
      {
        id: 'q8_2',
        type: 'keyword_answer',
        questionText:
          'What is the restricted minimum bending radius (in mm) for the heavy-duty single-core power cables?',
        correctAnswer: '450',
        keywords: ['450', '450mm', '450 mm'],
        explanation:
          "The passage states that the cables' bending radius is restricted to a minimum of 450mm.",
      },
      {
        id: 'q8_3',
        type: 'true_false',
        questionText:
          'The agreed coordination solution is to vertically offset the heavy-duty cable ladder instead of modifying the mechanical duct.',
        correctAnswer: 'false',
        explanation:
          'No, because the cable bending radius is restricted, vertical offset of the cable ladder is structurally impractical. The mechanical duct is being split into three smaller parallel ducts instead.',
      },
      {
        id: 'q8_4',
        type: 'short_answer',
        questionText:
          'What supplementary protection must the electrical team install to mitigate potential thermal heat transfer from the cables into the chilled supply air duct?',
        correctAnswer:
          'The electrical team must install thermal barrier insulation sheets.',
        keywords: [
          'thermal barrier',
          'insulation',
          'barrier sheets',
          'thermal sheets',
        ],
        explanation:
          'The passage specifies that the electrical team must install thermal barrier insulation sheets to prevent heat radiated by the power cables from warming the chilled supply air.',
      },
    ],
    xpReward: 80,
    coinReward: 30,
    eloReward: 20,
  },
];
