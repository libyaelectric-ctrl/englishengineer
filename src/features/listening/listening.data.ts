import { ListeningMission } from './listening.types';
import { STARTER_LISTENING_MISSIONS } from './listening.starter.data';

const CORE_LISTENING_MISSIONS: ListeningMission[] = [
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
    id: 'list_consultant_review',
    title: 'Submittal Comment Reconciliation',
    description:
      'Listen to a senior design engineer reviewing structural comment deviations with the lead electrical consultant.',
    missionType: 'Consultant Meeting',
    discipline: 'Design & Engineering Compliance',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 15,
    audioUrl: '/audio/list_consultant_review.wav',
    audioDurationSeconds: 44,
    accentLabel: 'Consultant review English',
    audioSourceLabel: 'Production audio asset',
    transcript:
      "Regarding the protection relay submittal, the electrical consultant issued a 'Revise and Resubmit' status due to the exclusion of arc-flash protection parameters in the short-circuit study. We must remind them that the switchgear operates under eighty kilo-Amps for zero-point-five seconds, and we have already integrated optical fiber sensor detection to mitigate internal arc faults. The response must cite the IEEE fifteen eighty-four standard for incident energy calculations. Let's write a technical response confirming that the sensor trip time is under ten milliseconds, which vastly reduces the incident energy levels below the category two threshold.",
    hiddenTranscript:
      "Regarding the protection relay submittal, the electrical consultant issued a [Revise and Resubmit] status due to the exclusion of [arc-flash protection parameters] in the short-circuit study. We must remind them that the switchgear operates under [eighty kilo-Amps] for zero-point-five seconds, and we have already integrated [optical fiber sensor detection] to mitigate internal arc faults. The response must cite the [IEEE fifteen eighty-four] standard for incident energy calculations. Let's write a technical response confirming that the sensor trip time is under [ten milliseconds], which vastly reduces the incident energy levels below the [category two] threshold.",
    keywords: [
      'submittal',
      'arc-flash',
      'switchgear',
      'IEEE 1584',
      'sensor',
      'incident energy',
    ],
    vocabulary: [
      {
        term: 'IEEE 1584',
        definition:
          'Guide for Performing Arc-Flash Hazard Calculations, providing models to calculate incident energy.',
        context:
          'The response must cite the IEEE fifteen eighty-four standard.',
      },
      {
        term: 'Incident Energy',
        definition:
          'The amount of thermal energy impressed on a surface at a certain distance from an electrical arc event.',
        context:
          'Reducing the incident energy levels below the category two threshold.',
      },
    ],
    questions: [
      {
        id: 'q_cr_1',
        type: 'multiple_choice',
        questionText:
          'What caused the electrical consultant to reject the protection relay submittal?',
        choices: [
          'A) Incorrect sizing of the fiber optic communication cables.',
          'B) The exclusion of arc-flash protection parameters in the short-circuit study.',
          'C) Overestimating the switchgear operating current above 80 kA.',
          'D) Failure to reference standard IEEE 1584 for relay curves.',
        ],
        correctAnswer: 'B',
        explanation:
          'The submittal was given a "Revise and Resubmit" status because arc-flash protection parameters were excluded from the short-circuit study.',
      },
      {
        id: 'q_cr_2',
        type: 'true_false',
        questionText:
          'The switchgear integrated optical fiber sensors to detect internal arc faults.',
        correctAnswer: 'true',
        explanation:
          'The speaker states that they have integrated optical fiber sensor detection to mitigate internal arc faults.',
      },
    ],
    xpReward: 80,
    coinReward: 25,
    eloReward: 16,
  },
  {
    id: 'list_generator_testing',
    title: 'Diesel Generator Transient Load Testing',
    description:
      'Listen to the commissioning lead discussing transient voltage recovery during an emergency generator step-load test.',
    missionType: 'Generator Test',
    discipline: 'Power Generation & Commissioning',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 18,
    audioUrl: '/audio/list_generator_testing.wav',
    audioDurationSeconds: 45,
    accentLabel: 'Commissioning English',
    audioSourceLabel: 'Production audio asset',
    transcript:
      "During the step-load test of the two-megawatt diesel generator, we observed a transient voltage drop of fourteen percent on the initial fifty percent block load step. The governor responded well, bringing the frequency back to fifty Hertz within two-point-eight seconds, which complies with ISO eighty-five twenty-eight class G3 requirements. However, the fuel injection system showed a momentary pressure dip of three-point-two bar on step-load application. We need to adjust the fuel bypass valve pressure regulator to prevent any diesel starvation on the second block load step. Let's execute the next run once the radiator fan speed has stabilized.",
    hiddenTranscript:
      "During the step-load test of the [two-megawatt] diesel generator, we observed a transient voltage drop of [fourteen percent] on the initial [fifty percent block load step]. The governor responded well, bringing the frequency back to [fifty Hertz] within [two-point-eight seconds], which complies with [ISO eighty-five twenty-eight] class G3 requirements. However, the fuel injection system showed a momentary pressure dip of [three-point-two bar] on step-load application. We need to adjust the [fuel bypass valve pressure regulator] to prevent any diesel starvation on the second block load step. Let's execute the next run once the radiator fan speed has stabilized.",
    keywords: [
      'transient',
      'block load',
      'governor',
      'ISO 8528',
      'frequency',
      'starvation',
    ],
    vocabulary: [
      {
        term: 'Transient Voltage Drop',
        definition:
          'A temporary reduction in voltage caused by sudden load application on a generator.',
        context:
          'We observed a transient voltage drop of fourteen percent on the load step.',
      },
      {
        term: 'ISO 8528 Class G3',
        definition:
          'International standard specifying operating requirements for reciprocating internal combustion engine driven AC generating sets.',
        context:
          'Complies with ISO eighty-five twenty-eight class G3 requirements.',
      },
    ],
    questions: [
      {
        id: 'q_gt_1',
        type: 'multiple_choice',
        questionText:
          'What is the rating of the diesel generator being tested?',
        choices: [
          'A) 1.5 Megawatt',
          'B) 2.0 Megawatt',
          'C) 500 Kilowatt',
          'D) 3.2 Megawatt',
        ],
        correctAnswer: 'B',
        explanation:
          'The transcript explicitly names a "two-megawatt diesel generator".',
      },
      {
        id: 'q_gt_2',
        type: 'true_false',
        questionText:
          'The generator recovery met the G3 requirements of ISO 8528.',
        correctAnswer: 'true',
        explanation:
          'Yes, the governor restored the frequency within 2.8 seconds, complying with ISO 8528 class G3 requirements.',
      },
    ],
    xpReward: 90,
    coinReward: 30,
    eloReward: 18,
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
    id: 'list_lv_panel_discussion',
    title: 'Low-Voltage Board Busbar Thermal Anomalies',
    description:
      'Listen to a maintenance supervisor discussing thermal hotspots detected during a periodic thermographic scan of an LV panel.',
    missionType: 'Inspection',
    discipline: 'Operations & Maintenance',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 14,
    audioUrl: '/audio/list_lv_panel_discussion.wav',
    audioDurationSeconds: 43,
    accentLabel: 'Maintenance inspection English',
    audioSourceLabel: 'Production audio asset',
    transcript:
      "We have some issues with the main low-voltage distribution board. The thermographic survey report shows a localized temperature hotspot on the phase-B busbar connection. The connection reached eighty-five degrees Celsius under a three-hundred-Amp load, which indicates high contact resistance. This is likely caused by loose securing bolts or oxidation on the copper contact surface. We must schedule an emergency outage this Sunday to clean the busbar faces and retorque all splice joints. Make sure to apply conductive grease before securing the bolts to sixty-five Newton-meters according to the manufacturer's specification.",
    hiddenTranscript:
      "We have some issues with the main [low-voltage distribution board]. The [thermographic survey] report shows a localized temperature hotspot on the [phase-B busbar connection]. The connection reached [eighty-five degrees Celsius] under a three-hundred-Amp load, which indicates [high contact resistance]. This is likely caused by loose securing bolts or [oxidation] on the copper contact surface. We must schedule an emergency outage this Sunday to clean the busbar faces and [retorque] all splice joints. Make sure to apply [conductive grease] before securing the bolts to [sixty-five Newton-meters] according to the manufacturer's specification.",
    keywords: [
      'busbar',
      'thermographic',
      'hotspot',
      'contact resistance',
      'torque',
      'grease',
    ],
    vocabulary: [
      {
        term: 'Thermographic Survey',
        definition:
          'An infrared inspection technique to detect thermal patterns, overheating, or defects in electrical systems.',
        context:
          'The thermographic survey report shows a localized temperature hotspot.',
      },
      {
        term: 'Contact Resistance',
        definition:
          'The contribution to the total resistance of a system which can be attributed to the contacting interfaces of electrical leads.',
        context:
          'Reached eighty-five degrees Celsius, which indicates high contact resistance.',
      },
    ],
    questions: [
      {
        id: 'q_lv_1',
        type: 'multiple_choice',
        questionText:
          'What is the probable cause of the high contact resistance on the Phase-B busbar?',
        choices: [
          'A) Overloading the distribution board above 3000 Amps.',
          'B) Loose securing bolts or copper oxidation on the contact surface.',
          'C) Insufficient ventilation in the sub-station room.',
          'D) Cracked ceramic insulators on the low-voltage board.',
        ],
        correctAnswer: 'B',
        explanation:
          'The speaker lists "loose securing bolts or oxidation on the copper contact surface" as the likely causes.',
      },
      {
        id: 'q_lv_2',
        type: 'true_false',
        questionText: 'The bolts must be secured to 85 Newton-meters.',
        correctAnswer: 'false',
        explanation:
          'The speaker specifies retorquing the bolts to sixty-five Newton-meters, while eighty-five was the temperature in degrees Celsius.',
      },
    ],
    xpReward: 85,
    coinReward: 25,
    eloReward: 17,
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
    id: 'list_electrical_inspection',
    title: 'Post-Installation Grounding & Insulation Testing',
    description:
      'Listen to an inspector conducting safety checks on secondary transformer terminals using high-voltage insulation megger tests.',
    missionType: 'Commissioning',
    discipline: 'Testing & Commissioning',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 16,
    audioUrl: '/audio/list_electrical_inspection.wav',
    audioDurationSeconds: 49,
    accentLabel: 'Testing and commissioning English',
    audioSourceLabel: 'Production audio asset',
    transcript:
      'We are wrapping up the insulation resistance testing on the secondary winding terminals of transformer four. Using a calibrated megger test set, we applied one thousand volts DC for sixty seconds between each phase and the earth busbar. The insulation resistance readings are well over two giga-Ohms, which is highly satisfactory. However, during the visual grounding check, I noticed the transformer neutral grounding copper bar is missing its double-point earth termination. We need to install a two-point bolted copper plate to connect directly to the copper earthing ring outside to comply with local safety regulations. Please hold off on the high-voltage energization clearance until this connection is double-inspected.',
    hiddenTranscript:
      'We are wrapping up the [insulation resistance testing] on the secondary winding terminals of [transformer four]. Using a calibrated [megger test set], we applied [one thousand volts DC] for sixty seconds between each phase and the earth busbar. The insulation resistance readings are well over [two giga-Ohms], which is highly satisfactory. However, during the visual grounding check, I noticed the transformer [neutral grounding copper bar] is missing its [double-point earth termination]. We need to install a [two-point bolted copper plate] to connect directly to the [copper earthing ring] outside to comply with local safety regulations. Please hold off on the [high-voltage energization clearance] until this connection is double-inspected.',
    keywords: [
      'megger',
      'insulation',
      'windings',
      'resistance',
      'grounding',
      'energization',
    ],
    vocabulary: [
      {
        term: 'Insulation Resistance',
        definition:
          'The resistance of the electrical insulation between conductors or to the ground, measured in Ohms to ensure no leakage.',
        context:
          'Wrapping up the insulation resistance testing on the secondary winding terminals.',
      },
      {
        term: 'Megger',
        definition:
          'An instrument used to measure high electrical resistance, commonly used to test insulation integrity.',
        context:
          'Using a calibrated megger test set, we applied one thousand volts.',
      },
    ],
    questions: [
      {
        id: 'q_ei_1',
        type: 'multiple_choice',
        questionText:
          'What deficiency was identified during the grounding inspection?',
        choices: [
          'A) The insulation resistance reading was below two mega-Ohms.',
          'B) The transformer winding terminals had wrong phase labels.',
          'C) The transformer neutral grounding copper bar is missing its double-point earth termination.',
          'D) Calibrated megger test set voltage was restricted to 100V.',
        ],
        correctAnswer: 'C',
        explanation:
          'The inspector noticed the transformer neutral grounding copper bar was missing its double-point earth termination.',
      },
      {
        id: 'q_ei_2',
        type: 'true_false',
        questionText:
          'The insulation testing applied 1,000 volts AC between each phase and the earth.',
        correctAnswer: 'false',
        explanation:
          'The inspector says they applied "one thousand volts DC", not AC, during the megger testing.',
      },
    ],
    xpReward: 95,
    coinReward: 30,
    eloReward: 19,
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
  {
    id: 'list_mechanical_coordination',
    title: 'Fire Alarm Cause and Effect Test',
    description:
      'Listen to the commissioning engineer coordinating a cause-and-effect test for smoke detection, sounders, dampers, and fire alarm interfaces.',
    missionType: 'Fire Alarm Test',
    discipline: 'Fire Alarm & Life Safety',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 14,
    audioUrl: '/audio/list_mechanical_coordination.wav',
    audioDurationSeconds: 46,
    accentLabel: 'Life safety commissioning English',
    audioSourceLabel: 'Production audio asset',
    transcript:
      'We are starting the cause-and-effect test for the fire alarm system on level three. When the smoke detector in corridor zone B is activated, the control panel must trigger the sounders, release the magnetic door holders, shut down the air handling unit, and send a signal to close the fire smoke dampers. The fire alarm graphic workstation should show the exact detector address within five seconds. Please confirm that the elevator recall interface is isolated during this test to avoid unnecessary lift movement. After the sequence is verified, we will reset the panel, record the response times, and attach the test sheet to the commissioning dossier.',
    hiddenTranscript:
      'We are starting the [cause-and-effect test] for the fire alarm system on [level three]. When the [smoke detector] in corridor zone B is activated, the control panel must trigger the [sounders], release the [magnetic door holders], shut down the [air handling unit], and send a signal to close the [fire smoke dampers]. The fire alarm graphic workstation should show the exact [detector address] within [five seconds]. Please confirm that the [elevator recall interface] is isolated during this test to avoid unnecessary lift movement. After the sequence is verified, we will reset the panel, record the [response times], and attach the test sheet to the [commissioning dossier].',
    keywords: [
      'cause-and-effect',
      'smoke detector',
      'sounders',
      'door holders',
      'dampers',
      'response times',
    ],
    vocabulary: [
      {
        term: 'Cause-and-Effect Test',
        definition:
          'A commissioning test that verifies each fire alarm input triggers the required outputs and interfaces.',
        context:
          'We are starting the cause-and-effect test for the fire alarm system.',
      },
      {
        term: 'Fire Smoke Damper',
        definition:
          'A damper that closes during fire alarm activation to restrict smoke movement through ductwork.',
        context:
          'The control panel must send a signal to close the fire smoke dampers.',
      },
    ],
    questions: [
      {
        id: 'q_mc_1',
        type: 'multiple_choice',
        questionText:
          'Which interface should be isolated during the fire alarm cause-and-effect test?',
        choices: [
          'A) The elevator recall interface.',
          'B) The fire alarm graphic workstation.',
          'C) The sounder circuit.',
          'D) The smoke detector address loop.',
        ],
        correctAnswer: 'A',
        explanation:
          'The commissioning engineer asks the team to isolate the elevator recall interface to avoid unnecessary lift movement.',
      },
      {
        id: 'q_mc_2',
        type: 'true_false',
        questionText:
          'The workstation should show the exact detector address within five seconds.',
        correctAnswer: 'true',
        explanation:
          'Yes, the transcript states that the graphic workstation should show the exact detector address within five seconds.',
      },
    ],
    xpReward: 80,
    coinReward: 25,
    eloReward: 16,
  },
];

export const LISTENING_MISSIONS: ListeningMission[] = [
  ...STARTER_LISTENING_MISSIONS,
  ...CORE_LISTENING_MISSIONS,
];
