import type { ReadingMission } from './reading.types';

export const MEP_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'mep_a2_pipe_support_check',
    title: 'Pipe Support Installation Notice',
    description: 'Read a short site notice about checking pipe support spacing and installation.',
    discipline: 'MEP Coordination',
    cefrLevel: 'A2',
    difficulty: 'Beginner',
    estimatedMinutes: 6,
    passageText:
      'SITE NOTICE. All pipefitters: check pipe support spacing on the chilled water lines. The drawing shows supports every 2.4 meters for 100mm pipe. Do not exceed this spacing. Each support must have a rubber liner between the pipe and the clamp. Tighten bolts to the correct torque. Do not use wire or rope as temporary supports. All supports must be fixed to the building structure, not to other pipes. Inspection is on Thursday. Failed supports must be fixed before insulation starts.',
    vocabulary: [
      {
        term: 'pipe support',
        definition: 'A hanger or bracket that holds a pipe in position.',
        context: 'Check pipe support spacing on the chilled water lines.',
        turkishTranslation: 'boru desteği',
      },
      {
        term: 'spacing',
        definition: 'The distance between two supports.',
        context: 'The drawing shows supports every 2.4 meters.',
        turkishTranslation: 'aralık',
      },
      {
        term: 'rubber liner',
        definition: 'A rubber sheet placed between pipe and clamp to prevent vibration and damage.',
        context: 'Each support must have a rubber liner between the pipe and the clamp.',
        turkishTranslation: 'kauçuk astar',
      },
      {
        term: 'torque',
        definition: 'The tightening force applied to a bolt.',
        context: 'Tighten bolts to the correct torque.',
        turkishTranslation: 'tork',
      },
      {
        term: 'insulation',
        definition: 'Material wrapped around pipes to prevent heat loss or gain.',
        context: 'Failed supports must be fixed before insulation starts.',
        turkishTranslation: 'izolasyon',
      },
    ],
    questions: [
      {
        id: 'mep_a2_q1',
        type: 'multiple_choice',
        questionText: 'What is the maximum support spacing for 100mm chilled water pipe?',
        choices: ['A) 1.2 meters', 'B) 2.4 meters', 'C) 3.0 meters', 'D) 4.8 meters'],
        correctAnswer: 'B',
        explanation: 'The drawing shows supports every 2.4 meters for 100mm pipe.',
      },
      {
        id: 'mep_a2_q2',
        type: 'true_false',
        questionText: 'Wire or rope can be used as temporary pipe supports.',
        correctAnswer: 'false',
        explanation: 'The notice says "Do not use wire or rope as temporary supports."',
      },
      {
        id: 'mep_a2_q3',
        type: 'keyword_answer',
        questionText: 'What must be placed between the pipe and the clamp?',
        keywords: ['rubber liner', 'liner', 'rubber'],
        correctAnswer: 'a rubber liner',
        explanation: 'Each support must have a rubber liner between the pipe and the clamp.',
      },
    ],
    xpReward: 40,
    coinReward: 15,
    eloReward: 12,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
  {
    id: 'mep_b1_valve_schedule',
    title: 'Valve Schedule Review',
    description:
      'Read a valve schedule and identify specifications for chilled water system valves.',
    discipline: 'MEP Coordination',
    cefrLevel: 'B1',
    difficulty: 'Intermediate',
    estimatedMinutes: 9,
    passageText:
      'VALVE SCHEDULE — CHW SYSTEM, Rev 2. Tag: V-CHW-045. Type: Butterfly valve, lugged, PN16. Size: DN100. Body: Ductile iron, epoxy coated. Disc: Stainless steel 316. Seat: EPDM. Operator: Gear operator with handwheel. Location: AHU-03 supply branch, Plant Room B. Function: Isolation and balancing. Test pressure: 16 bar. Tag: V-CHW-046. Type: Ball valve, full bore, PN25. Size: DN50. Body: Bronze. Ball: Stainless steel 316. Seat: PTFE. Operator: Lever. Location: FCU-12 return, Level 4. Function: Isolation. Test pressure: 25 bar. All valves must have stainless steel ID tags welded to the body. Certificates to QA/QC before installation.',
    vocabulary: [
      {
        term: 'butterfly valve',
        definition: 'A valve with a rotating disc that controls flow, used for large pipe sizes.',
        context: 'Type: Butterfly valve, lugged, PN16.',
        turkishTranslation: 'kelebek vana',
      },
      {
        term: 'ball valve',
        definition: 'A valve with a rotating ball that has a hole through it for on/off control.',
        context: 'Type: Ball valve, full bore, PN25.',
        turkishTranslation: 'top vana',
      },
      {
        term: 'PN16',
        definition: 'Pressure Nominal 16; a pressure rating of 16 bar at 20°C.',
        context: 'Butterfly valve, lugged, PN16.',
        turkishTranslation: 'PN16 (16 bar)',
      },
      {
        term: 'EPDM',
        definition: 'Ethylene Propylene Diene Monomer; a synthetic rubber used for valve seats.',
        context: 'Seat: EPDM.',
        turkishTranslation: 'EPDM kauçuk',
      },
      {
        term: 'full bore',
        definition:
          'A valve where the internal opening equals the pipe diameter, minimizing pressure drop.',
        context: 'Ball valve, full bore, PN25.',
        turkishTranslation: 'tam geçiş',
      },
    ],
    questions: [
      {
        id: 'mep_b1_q1',
        type: 'multiple_choice',
        questionText: 'What material is the disc of valve V-CHW-045 made from?',
        choices: ['A) Ductile iron', 'B) Bronze', 'C) Stainless steel 316', 'D) EPDM'],
        correctAnswer: 'C',
        explanation: 'The schedule shows Disc: Stainless steel 316 for V-CHW-045.',
      },
      {
        id: 'mep_b1_q2',
        type: 'true_false',
        questionText: 'Valve V-CHW-046 has a gear operator with handwheel.',
        correctAnswer: 'false',
        explanation: 'V-CHW-046 has a lever operator, not a gear operator.',
      },
      {
        id: 'mep_b1_q3',
        type: 'keyword_answer',
        questionText:
          'What pressure rating (PN) is required for the butterfly valve on the chilled water system?',
        keywords: ['PN16', '16', '16 bar'],
        correctAnswer: 'PN16',
        explanation: 'The schedule specifies PN16 for the butterfly valve V-CHW-045.',
      },
    ],
    xpReward: 45,
    coinReward: 18,
    eloReward: 13,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
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
        context: 'Routing around the newly added seismic bracing column at grid line E-12.',
      },
      {
        term: 'elbow',
        definition:
          'A pipe fitting installed between two lengths of pipe or tubing to allow a change of direction, usually 90 or 45 degrees.',
        context: 'Four additional 45-degree long-radius elbows have been introduced.',
      },
      {
        term: 'friction head loss',
        definition:
          'The reduction in total pressure head of a fluid as it flows through a piping system due to resistance between the fluid and the pipe walls.',
        context: 'Friction head loss is increased by 1.8 meters of water column.',
      },
      {
        term: 'VFD',
        definition:
          'Variable Frequency Drive; a controller that drives an electric motor by varying the frequency and voltage supplied to the motor, controlling its speed.',
        context: 'Motor variable frequency drives (VFD) must be re-commissioned.',
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
        explanation: 'The passage states that the VFDs must be re-commissioned to run at 48 Hz.',
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
        correctAnswer: 'The system must maintain a flow rate of 120 liters per second (l/s).',
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
    cefrLevel: 'C1',
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
        context: 'The cables bending radius is restricted to a minimum of 450mm.',
      },
      {
        term: 'XLPE',
        definition:
          'Cross-linked polyethylene; a high-durability, moisture-resistant form of thermoset insulation material used widely for high-current power cables.',
        context: 'Carrying 12 parallel runs of single-core 300mm² XLPE power feeds.',
      },
      {
        term: 'headroom clearance',
        definition:
          'The vertical distance between the finished floor level and any ceiling obstruction, defining the safe path height for personnel.',
        context: 'Diverting the duct downward would reduce the headroom clearance to 1.9 meters.',
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
        correctAnswer: 'The electrical team must install thermal barrier insulation sheets.',
        keywords: ['thermal barrier', 'insulation', 'barrier sheets', 'thermal sheets'],
        explanation:
          'The passage specifies that the electrical team must install thermal barrier insulation sheets to prevent heat radiated by the power cables from warming the chilled supply air.',
      },
    ],
    xpReward: 80,
    coinReward: 30,
    eloReward: 20,
  },
];
