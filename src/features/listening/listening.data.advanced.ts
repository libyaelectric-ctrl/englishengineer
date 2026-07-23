import type { ListeningMission } from './listening.types';

export const ADVANCED_LISTENING_MISSIONS: ListeningMission[] = [
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
    audioUrl: '/audio/list_consultant_review.mp3',
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
    audioUrl: '/audio/list_generator_testing.mp3',
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
    id: 'list_lv_panel_discussion',
    title: 'Low-Voltage Board Busbar Thermal Anomalies',
    description:
      'Listen to a maintenance supervisor discussing thermal hotspots detected during a periodic thermographic scan of an LV panel.',
    missionType: 'Inspection',
    discipline: 'Operations & Maintenance',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 14,
    audioUrl: '/audio/list_lv_panel_discussion.mp3',
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
    id: 'list_electrical_inspection',
    title: 'Post-Installation Grounding & Insulation Testing',
    description:
      'Listen to an inspector conducting safety checks on secondary transformer terminals using high-voltage insulation megger tests.',
    missionType: 'Commissioning',
    discipline: 'Testing & Commissioning',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 16,
    audioUrl: '/audio/list_electrical_inspection.mp3',
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
    id: 'list_mechanical_coordination',
    title: 'Fire Alarm Cause and Effect Test',
    description:
      'Listen to the commissioning engineer coordinating a cause-and-effect test for smoke detection, sounders, dampers, and fire alarm interfaces.',
    missionType: 'Fire Alarm Test',
    discipline: 'Fire Alarm & Life Safety',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 14,
    audioUrl: '/audio/list_mechanical_coordination.mp3',
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
