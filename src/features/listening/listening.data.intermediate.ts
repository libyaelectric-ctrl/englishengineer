import type { ListeningMission } from './listening.types';

export const INTERMEDIATE_LISTENING_MISSIONS: ListeningMission[] = [
  {
    id: 'list_site_meeting',
    title: 'Substation Site Layout Alignment',
    description:
      'Listen to the site engineer and civil supervisor aligning on substation trench coordinates and cable entry conduits.',
    missionType: 'Site Meeting',
    discipline: 'Electrical Infrastructure',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 12,
    audioUrl: '/audio/list_site_meeting.wav',
    audioDurationSeconds: 44,
    accentLabel: 'International site English',
    audioSourceLabel: 'Production audio asset',
    transcript:
      "We need to align the trench coordinates for Substation B today. The civil team has marked the excavation lines, but the main cable entry conduits are hitting the structural column foundations. We need to shift the entire cable trench approximately five hundred millimeters to the east to clear the footings. If we shift it, make sure the bend radius for the one hundred and ten millimeter PVC conduits is not compromised. We need at least a nine hundred millimeter bend radius to allow the single-core copper cables to be pulled through without damaging the outer sheath. Let's make sure the site supervisor records this offset on the red-line drawings immediately.",
    hiddenTranscript:
      "We need to align the trench coordinates for [Substation B] today. The civil team has marked the excavation lines, but the main cable entry conduits are hitting the [structural column foundations]. We need to shift the entire cable trench approximately [five hundred millimeters] to the east to clear the footings. If we shift it, make sure the [bend radius] for the one hundred and ten millimeter PVC conduits is not compromised. We need at least a [nine hundred millimeter] bend radius to allow the single-core copper cables to be pulled through without damaging the [outer sheath]. Let's make sure the site supervisor records this offset on the [red-line drawings] immediately.",
    keywords: [
      'trench',
      'coordinates',
      'conduits',
      'bend radius',
      'offset',
      'red-line drawings',
    ],
    vocabulary: [
      {
        term: 'Bend Radius',
        definition:
          'The minimum radius one can bend a pipe, cable, sheet, or conduit without damaging it.',
        context:
          'We need at least a nine hundred millimeter bend radius for the conduits.',
      },
      {
        term: 'Red-line Drawings',
        definition:
          'On-site construction drawings that show changes made to the original plans during construction.',
        context: 'Record this offset on the red-line drawings immediately.',
      },
    ],
    questions: [
      {
        id: 'q_sm_1',
        type: 'multiple_choice',
        questionText:
          'Why does the cable trench need to be shifted to the east?',
        choices: [
          'A) To avoid hitting the main structural column foundations.',
          'B) To shorten the overall length of the copper cables.',
          'C) To match the civil excavation lines marked on Monday.',
          'D) To ensure better water drainage away from the sub-station.',
        ],
        correctAnswer: 'A',
        explanation:
          'The engineer states that the main cable entry conduits are hitting the structural column foundations, requiring a shift of 500mm to the east.',
      },
      {
        id: 'q_sm_2',
        type: 'true_false',
        questionText:
          'The minimum bend radius allowed for the 110mm PVC conduits is 500 millimeters.',
        correctAnswer: 'false',
        explanation:
          'The transcript specifies that we need at least a 900 millimeter bend radius to prevent cable damage.',
      },
    ],
    xpReward: 60,
    coinReward: 20,
    eloReward: 12,
  },
  {
    id: 'list_fat_meeting',
    title: 'Factory Acceptance Testing Alignment',
    description:
      'Listen to the procurement lead and QA auditor conducting a pre-FAT briefing for control and protection panels.',
    missionType: 'FAT',
    discipline: 'Quality Assurance & Procurement',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    audioUrl: '/audio/list_fat_meeting.wav',
    audioDurationSeconds: 41,
    accentLabel: 'Factory acceptance English',
    audioSourceLabel: 'Production audio asset',
    transcript:
      'We are commencing the FAT for the low-voltage control panels at the manufacturing plant tomorrow morning. The principal checks will focus on terminal torque settings, wire labeling consistency, and loop checking of the analog inputs. The manufacturer must supply certified calibration reports for all test instruments used during dielectric testing. We will select ten percent of the protection relays at random to perform a primary current injection test. If we find a single point of failure in the circuit breaker interlock scheme, the entire batch will be rejected and require a complete reinspection.',
    hiddenTranscript:
      'We are commencing the FAT for the [low-voltage control panels] at the manufacturing plant tomorrow morning. The principal checks will focus on [terminal torque settings], [wire labeling consistency], and [loop checking] of the analog inputs. The manufacturer must supply certified [calibration reports] for all test instruments used during [dielectric testing]. We will select [ten percent] of the protection relays at random to perform a [primary current injection test]. If we find a single point of failure in the circuit breaker [interlock scheme], the entire batch will be rejected and require a complete reinspection.',
    keywords: [
      'FAT',
      'torque',
      'calibration',
      'dielectric',
      'relays',
      'interlock',
    ],
    vocabulary: [
      {
        term: 'Dielectric Testing',
        definition:
          'An evaluation of insulation material, testing its ability to withstand voltage without breaking down.',
        context: 'Test instruments used during dielectric testing.',
      },
      {
        term: 'Primary Current Injection',
        definition:
          'A test where high current is injected into the primary side of the system to verify the entire protection loop.',
        context:
          'We will select ten percent of protection relays to perform a primary current injection test.',
      },
    ],
    questions: [
      {
        id: 'q_fm_1',
        type: 'multiple_choice',
        questionText:
          'What occurs if a single point of failure is identified in the circuit breaker interlock scheme?',
        choices: [
          'A) Only that specific circuit breaker is replaced on site.',
          'B) The entire batch of panels will be rejected and require a complete reinspection.',
          'C) Dielectric testing is restarted with a different calibration report.',
          'D) A primary current injection test is scheduled for next month.',
        ],
        correctAnswer: 'B',
        explanation:
          'The speaker explicitly warns: "If we find a single point of failure... the entire batch will be rejected and require a complete reinspection."',
      },
      {
        id: 'q_fm_2',
        type: 'true_false',
        questionText:
          'Primary current injection testing will be performed on 100% of the protection relays.',
        correctAnswer: 'false',
        explanation:
          'The QA auditor says they will select ten percent of the protection relays at random to perform primary current injection.',
      },
    ],
    xpReward: 65,
    coinReward: 20,
    eloReward: 13,
  },
  {
    id: 'list_cable_routing',
    title: 'Galvanized Cable Ladder Containment Routing',
    description:
      'Listen to the site supervisor discussing segregation rules and load capacity constraints for heavy-duty galvanized cable ladders.',
    missionType: 'Daily Coordination',
    discipline: 'Field Engineering',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 11,
    audioUrl: '/audio/list_cable_routing.wav',
    audioDurationSeconds: 46,
    accentLabel: 'Daily coordination English',
    audioSourceLabel: 'Production audio asset',
    transcript:
      'We are reviewing the cable tray layout in the main electrical riser. There are three heavy-duty galvanized cable ladders stacked vertically, and we must ensure proper segregation between power and control signals. The top ladder is dedicated exclusively to twelve-kilovolt medium-voltage lines, and we need a minimum of three hundred millimeters clear vertical separation from the lower trays. The low-voltage power cables should go on the middle ladder, while the instrumentation cables reside on the bottom tier to mitigate electromagnetic interference. Also, check that all structural support brackets are anchored to the concrete wall slab to support thirty kilograms per linear meter.',
    hiddenTranscript:
      'We are reviewing the cable tray layout in the [main electrical riser]. There are three [heavy-duty galvanized cable ladders] stacked vertically, and we must ensure proper [segregation] between power and control signals. The top ladder is dedicated exclusively to [twelve-kilovolt medium-voltage lines], and we need a minimum of [three hundred millimeters] clear vertical separation from the lower trays. The low-voltage power cables should go on the [middle ladder], while the [instrumentation cables] reside on the bottom tier to mitigate [electromagnetic interference]. Also, check that all [structural support brackets] are anchored to the concrete wall slab to support [thirty kilograms per linear meter].',
    keywords: [
      'galvanized',
      'ladder',
      'segregation',
      'separation',
      'instrumentation',
      'electromagnetic',
    ],
    vocabulary: [
      {
        term: 'Segregation',
        definition:
          'Physical separation of electrical circuits according to voltage level or function to prevent hazard or signal degradation.',
        context:
          'We must ensure proper segregation between power and control signals.',
      },
      {
        term: 'Electromagnetic Interference',
        definition:
          'Disturbance that affects an electrical circuit due to electromagnetic conduction or radiation from an external source.',
        context:
          'Reside on the bottom tier to mitigate electromagnetic interference.',
      },
    ],
    questions: [
      {
        id: 'q_cr_m1',
        type: 'multiple_choice',
        questionText:
          'Which tier is reserved for the instrumentation cables to mitigate interference?',
        choices: [
          'A) The top galvanized ladder.',
          'B) The middle tray tier.',
          'C) The bottom ladder tier.',
          'D) A separate external conduits line.',
        ],
        correctAnswer: 'C',
        explanation:
          'The supervisor notes: "instrumentation cables reside on the bottom tier to mitigate electromagnetic interference."',
      },
      {
        id: 'q_cr_m2',
        type: 'true_false',
        questionText:
          'The required separation between the top medium-voltage ladder and lower trays is 300 millimeters.',
        correctAnswer: 'true',
        explanation:
          'Yes, the supervisor states: "we need a minimum of three hundred millimeters clear vertical separation from the lower trays."',
      },
    ],
    xpReward: 70,
    coinReward: 22,
    eloReward: 14,
  },
  {
    id: 'list_safety_toolbox',
    title: 'Lockout-Tagout (LOTO) & Arc Flash Briefing',
    description:
      'Listen to the site safety officer conducting a safety toolbox talk on arc-flash boundaries and lockout procedures.',
    missionType: 'Toolbox Talk',
    discipline: 'Site Safety & LOTO Compliance',
    cefrLevel: 'B2',
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    audioUrl: '/audio/list_safety_toolbox.wav',
    audioDurationSeconds: 49,
    accentLabel: 'Toolbox talk English',
    audioSourceLabel: 'Production audio asset',
    transcript:
      "Good morning team, let's go over today's electrical safety protocols. Before any work begins on the four-hundred-and-fifteen-volt switchboard, we must execute a full lockout-tagout procedure. Both the upstream circuit breaker and the local isolator must be locked in the off position with personal padlocks and danger tags. Verify that there is zero voltage present by using a verified three-phase indicator before touch-testing. For any live diagnostics or boundary testing, you must wear category two arc-flash PPE, which includes an eight-calorie face shield, flame-resistant overalls, and insulated leather gloves. Let's maintain a zero-incident safety record on this project.",
    hiddenTranscript:
      "Good morning team, let's go over today's electrical safety protocols. Before any work begins on the [four-hundred-and-fifteen-volt switchboard], we must execute a full [lockout-tagout procedure]. Both the upstream [circuit breaker] and the [local isolator] must be locked in the [off position] with personal [padlocks] and [danger tags]. Verify that there is [zero voltage] present by using a verified [three-phase indicator] before touch-testing. For any [live diagnostics] or [boundary testing], you must wear [category two arc-flash PPE], which includes an [eight-calorie face shield], [flame-resistant overalls], and [insulated leather gloves]. Let's maintain a [zero-incident] safety record on this project.",
    keywords: [
      'LOTO',
      'switchboard',
      'isolator',
      'voltage',
      'arc-flash',
      'PPE',
    ],
    vocabulary: [
      {
        term: 'Lockout-Tagout (LOTO)',
        definition:
          'A safety procedure used in industry to ensure that dangerous machines are properly shut off and not started up again.',
        context: 'We must execute a full lockout-tagout procedure.',
      },
      {
        term: 'Arc-Flash PPE',
        definition:
          'Flame-resistant personal protective equipment designed to protect workers from electric arc exposure hazards.',
        context: 'You must wear category two arc-flash PPE.',
      },
    ],
    questions: [
      {
        id: 'q_st_1',
        type: 'multiple_choice',
        questionText:
          'What voltage level is present on the switchboard requiring LOTO procedures?',
        choices: [
          'A) 110 Volts',
          'B) 230 Volts',
          'C) 415 Volts',
          'D) 11 Kilovolts',
        ],
        correctAnswer: 'C',
        explanation:
          'The safety officer refers to safety protocols before working on the "four-hundred-and-fifteen-volt switchboard".',
      },
      {
        id: 'q_st_2',
        type: 'true_false',
        questionText:
          'The safety procedure requires locking both the upstream circuit breaker and local isolator.',
        correctAnswer: 'true',
        explanation:
          'Yes, the safety officer specifies that "Both the upstream circuit breaker and the local isolator must be locked in the off position".',
      },
    ],
    xpReward: 50,
    coinReward: 15,
    eloReward: 10,
  },
  {
    id: 'list_project_progress',
    title: 'Site Delivery Critical Path Progress Meeting',
    description:
      'Listen to the project manager and lead electrical planner debating critical path delays for key switchgear deliveries.',
    missionType: 'Office Meeting',
    discipline: 'Project Management & Planning',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    audioUrl: '/audio/list_project_progress.wav',
    audioDurationSeconds: 45,
    accentLabel: 'Project office English',
    audioSourceLabel: 'Production audio asset',
    transcript:
      "Let's review the critical path milestones. The shipping delay for the main medium-voltage switchgear is now three weeks, which puts our September substation energization date at risk. The manufacturing yard reports that the micro-processor protection relays were held up due to supply chain backlogs. To recover this slippage, we must rearrange the site civil sequence and complete all structural floor plinths and drainage routes ahead of time. When the switchgear arrives on site, we will schedule double shifts for installation and immediate cable termination. I need the procurement engineer to contact the factory and arrange air freight shipping for the relays.",
    hiddenTranscript:
      "Let's review the [critical path milestones]. The [shipping delay] for the main [medium-voltage switchgear] is now [three weeks], which puts our [September substation energization] date at risk. The manufacturing yard reports that the [micro-processor protection relays] were held up due to [supply chain backlogs]. To recover this slippage, we must rearrange the [site civil sequence] and complete all [structural floor plinths] and [drainage routes] ahead of time. When the switchgear arrives on site, we will schedule [double shifts] for installation and immediate [cable termination]. I need the [procurement engineer] to contact the factory and arrange [air freight shipping] for the relays.",
    keywords: [
      'critical path',
      'delay',
      'switchgear',
      'backlog',
      'plinths',
      'air freight',
    ],
    vocabulary: [
      {
        term: 'Critical Path',
        definition:
          'The sequence of stages determining the minimum time needed for an operation or project to be completed.',
        context: "Let's review the critical path milestones.",
      },
      {
        term: 'Floor Plinths',
        definition:
          'The concrete support block or platform upon which heavy mechanical or electrical equipment is mounted.',
        context: 'Complete all structural floor plinths ahead of time.',
      },
    ],
    questions: [
      {
        id: 'q_pp_1',
        type: 'multiple_choice',
        questionText:
          'Which items were delayed, holding up the switchgear manufacturing process?',
        choices: [
          'A) Heavy-duty galvanized cable ladders.',
          'B) Galvanized steel enclosure plates.',
          'C) Micro-processor protection relays.',
          'D) Copper connection busbars.',
        ],
        correctAnswer: 'C',
        explanation:
          'The Planner mentions that the microprocessor protection relays were held up due to supply chain backlogs.',
      },
      {
        id: 'q_pp_2',
        type: 'true_false',
        questionText:
          'The project manager suggested delaying the floor plinths concrete work.',
        correctAnswer: 'false',
        explanation:
          'No, the manager suggested completing all structural floor plinths and drainage routes "ahead of time" to recover slippage.',
      },
    ],
    xpReward: 60,
    coinReward: 20,
    eloReward: 12,
  },
];
