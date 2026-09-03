import type { ReadingMission } from '@/shared/types/reading.types';

export const BUILDING_SYSTEMS_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'building_systems_a2_fire_damper_notice',
    title: 'Site Notice — Fire Damper Inspection',
    description: 'Read a short site notice about fire damper inspection and find key instructions.',
    discipline: 'Building Systems Engineering',
    cefrLevel: 'A2',
    difficulty: 'Beginner',
    estimatedMinutes: 6,
    passageText:
      'SITE NOTICE. All mechanical contractors: fire damper inspection for Level 3 starts Monday. Each fire damper must be checked for blade operation and fusible link condition. Open the access panel and move the blade by hand. It must move freely and close fully. Check the fusible link for damage or paint. Replace damaged links immediately. Record results on the inspection form. Forms go to the QA/QC office by Friday. Do not paint over fusible links. Thank you.',
    vocabulary: [
      {
        term: 'fire damper',
        definition:
          'A device in ductwork that closes automatically in a fire to stop smoke and flame spread.',
        context: 'Each fire damper must be checked for blade operation.',
        turkishTranslation: 'yangın perdesi',
      },
      {
        term: 'access panel',
        definition: 'A removable cover that allows entry to equipment inside a wall or ceiling.',
        context: 'Open the access panel and move the blade by hand.',
        turkishTranslation: 'erişim paneli',
      },
      {
        term: 'fusible link',
        definition:
          'A metal link that melts at a specific temperature to trigger the damper to close.',
        context: 'Check the fusible link for damage or paint.',
        turkishTranslation: 'erimeş 연결구',
      },
      {
        term: 'inspection form',
        definition: 'A document used to record the results of an equipment check.',
        context: 'Record results on the inspection form.',
        turkishTranslation: 'denetim formu',
      },
      {
        term: 'blade',
        definition: 'The moving part of a damper that opens or closes the airflow path.',
        context: 'It must move freely and close fully.',
        turkishTranslation: 'kanat / pala',
      },
    ],
    questions: [
      {
        id: 'bs_a2_q1',
        type: 'multiple_choice',
        questionText: 'When does the fire damper inspection start?',
        choices: ['A) Friday', 'B) Monday', 'C) Next week', 'D) Today'],
        correctAnswer: 'B',
        explanation: 'The notice states inspection for Level 3 starts Monday.',
      },
      {
        id: 'bs_a2_q2',
        type: 'true_false',
        questionText: 'You should paint over fusible links to protect them.',
        correctAnswer: 'false',
        explanation: 'The notice says "Do not paint over fusible links."',
      },
      {
        id: 'bs_a2_q3',
        type: 'keyword_answer',
        questionText: 'Where must completed inspection forms be sent?',
        keywords: ['QA/QC office', 'QA/QC'],
        correctAnswer: 'the QA/QC office',
        explanation: 'Forms go to the QA/QC office by Friday.',
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
    id: 'building_systems_b1_bms_sequence',
    title: 'BMS Sequence of Operations — AHU Control',
    description:
      'Read a Building Management System sequence of operations for an Air Handling Unit.',
    discipline: 'Building Systems Engineering',
    cefrLevel: 'B1',
    difficulty: 'Intermediate',
    estimatedMinutes: 9,
    passageText:
      'SEQUENCE OF OPERATIONS — AHU-04 (Office Tower, Level 12). The Air Handling Unit shall operate on a time schedule: Monday to Friday, 06:00 to 20:00. Optimum start shall activate the fan 60 minutes before occupancy to achieve space temperature setpoint. Supply fan VFD shall modulate to maintain duct static pressure setpoint of 250 Pa. Cooling coil valve shall modulate to maintain supply air temperature at 13°C. Heating coil valve shall modulate only when supply air temperature drops below 10°C. Free cooling mode shall activate when outside air enthalpy is lower than return air enthalpy. Minimum outside air damper position shall be 20% during occupied mode. Smoke detector in supply duct shall shut down fan and close all dampers on alarm. All alarms and status points shall be mapped to BMS graphics.',
    vocabulary: [
      {
        term: 'sequence of operations',
        definition: 'A detailed description of how a control system should operate equipment.',
        context: 'SEQUENCE OF OPERATIONS — AHU-04.',
        turkishTranslation: 'işletim sırası',
      },
      {
        term: 'optimum start',
        definition:
          'A control strategy that starts equipment early to reach setpoint by occupancy time.',
        context: 'Optimum start shall activate the fan 60 minutes before occupancy.',
        turkishTranslation: 'en iyi başlangıç',
      },
      {
        term: 'VFD',
        definition:
          'Variable Frequency Drive; controls motor speed by varying electrical frequency.',
        context: 'Supply fan VFD shall modulate to maintain duct static pressure.',
        turkishTranslation: 'frekans dönüştürücü',
      },
      {
        term: 'free cooling',
        definition: 'Using cool outside air for cooling instead of mechanical refrigeration.',
        context: 'Free cooling mode shall activate when outside air enthalpy is lower.',
        turkishTranslation: 'serbest soğutma',
      },
      {
        term: 'enthalpy',
        definition: 'Total heat content of air, including sensible and latent heat.',
        context: 'When outside air enthalpy is lower than return air enthalpy.',
        turkishTranslation: 'entalpi',
      },
    ],
    questions: [
      {
        id: 'bs_b1_q1',
        type: 'multiple_choice',
        questionText: 'What is the supply air temperature setpoint for AHU-04?',
        choices: ['A) 10°C', 'B) 13°C', 'C) 250 Pa', 'D) 20%'],
        correctAnswer: 'B',
        explanation:
          'The sequence states cooling coil valve shall maintain supply air temperature at 13°C.',
      },
      {
        id: 'bs_b1_q2',
        type: 'true_false',
        questionText: 'The heating coil valve operates when supply air temperature is above 10°C.',
        correctAnswer: 'false',
        explanation:
          'Heating coil valve modulates only when supply air temperature drops below 10°C.',
      },
      {
        id: 'bs_b1_q3',
        type: 'keyword_answer',
        questionText: 'What is the minimum outside air damper position during occupied mode?',
        keywords: ['20%', '20 percent'],
        correctAnswer: '20%',
        explanation:
          'The sequence specifies minimum outside air damper position shall be 20% during occupied mode.',
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
    id: 'fire_alarm_comm',
    title: 'Fire Alarm Commissioning Note',
    description:
      'Verify SLC loop addressing, strobe synchronization, and interface relays with HVAC dampers and elevators.',
    discipline: 'Building Systems Engineering',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    passageText:
      'The commissioning of the fire alarm system for Tower B was completed in accordance with NFPA 72 regulations on May 12, 2026. The Signaled Line Circuit (SLC) loop 1 was fully mapped, verifying 124 addressable devices including smoke detectors, heat detectors, and control modules. End-of-line resistor values were checked and verified to be 4.7kΩ, matching specified system requirements. Strobe light synchronization was confirmed across all egress paths using a digital timer, showing synchronous flash rates of exactly 1 Hz to prevent seizure risks. Interfacing relays with other building systems were tested under alarm simulation. The relay for elevator recall initiated successfully, sending Tower B Elevators 1 and 2 to the primary lobby level. However, a major defect was noted during HVAC integration tests: the fire damper control relays on Floor 4 failed to de-energize the supply fan AHU-04. The contractor must re-wire the auxiliary contact sequence on the motor starter panel to ensure immediate fan shutdown upon alarm initiation.',
    vocabulary: [
      {
        term: 'SLC loop',
        definition:
          'Signaling Line Circuit; a circuit connecting addressable initiating devices (such as detectors and pull stations) and control modules to the fire alarm panel.',
        context: 'The Signaled Line Circuit (SLC) loop 1 was fully mapped.',
      },
      {
        term: 'strobe synchronization',
        definition:
          'The process of flashing all notification strobe lights in a visual zone simultaneously to prevent causing seizures in individuals with photosensitive epilepsy.',
        context: 'Strobe light synchronization was confirmed across all egress paths.',
      },
      {
        term: 'elevator recall',
        definition:
          'An automated safety system that commands elevators to return to a designated floor and park with doors open when a fire alarm is triggered.',
        context: 'The relay for elevator recall initiated successfully.',
      },
      {
        term: 'fire damper',
        definition:
          'A passive fire protection device used in air conditioning and ventilation ductwork to prevent the spread of fire and smoke inside duct barriers.',
        context: 'The fire damper control relays on Floor 4 failed to de-energize.',
      },
    ],
    questions: [
      {
        id: 'q4_1',
        type: 'multiple_choice',
        questionText:
          'What is the required flashing rate (frequency) confirmed for notification strobes to mitigate visual seizure risks?',
        choices: ['A) 1 Hz', 'B) 4.7 Hz', 'C) 124 Hz', 'D) 72 Hz'],
        correctAnswer: 'A',
        explanation:
          'The strobe light synchronization test showed a synchronous flash rate of exactly 1 Hz, as explicitly detailed in the text.',
      },
      {
        id: 'q4_2',
        type: 'keyword_answer',
        questionText:
          'What is the resistance value (in kΩ) of the checked and verified end-of-line resistors?',
        correctAnswer: '4.7',
        keywords: ['4.7', '4.7k', '4.7kΩ'],
        explanation: 'The end-of-line resistor values were checked and verified to be 4.7kΩ.',
      },
      {
        id: 'q4_3',
        type: 'true_false',
        questionText:
          'The HVAC integration tests successfully shut down all supply fans upon fire alarm simulation without any issues.',
        correctAnswer: 'false',
        explanation:
          'The fire damper control relays on Floor 4 failed to de-energize the supply fan AHU-04, which is noted as a major defect.',
      },
      {
        id: 'q4_4',
        type: 'short_answer',
        questionText:
          'What action must the contractor perform to correct the defect found in the Floor 4 HVAC damper integration?',
        correctAnswer:
          'The contractor must re-wire the auxiliary contact sequence on the motor starter panel.',
        keywords: ['re-wire', 'auxiliary contact', 'motor starter', 'rewire', 'starter panel'],
        explanation:
          'The passage states the contractor must re-wire the auxiliary contact sequence on the motor starter panel to ensure immediate fan shutdown.',
      },
    ],
    xpReward: 55,
    coinReward: 18,
    eloReward: 13,
  },
  {
    id: 'consultant_comment_response',
    title: 'Consultant Comment Response',
    description:
      'Structure professional technical justifications and contract specification rebuttals.',
    discipline: 'BMS Engineering',
    cefrLevel: 'C1',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    passageText:
      'With reference to the consultant comment sheet on the Phase 2 BMS Schematics (Submission Ref: ME-BMS-SUB-012, Rev 01), the lead contractor team offers the following technical responses. Comment #4 raised concerns regarding the absence of BACnet/IP interfaces on the Floor 1 to 5 Variable Air Volume (VAV) local controllers. The consultant requested that all VAV controllers be upgraded to native BACnet/IP to avoid communication latency. In response, we clarify that the contract specification (Section 15900, Clause 3.2) explicitly permits BACnet MS/TP over RS-485 for terminal units. Upgrading to BACnet/IP for 420 individual VAV boxes would introduce substantial, unbudgeted capital costs. Furthermore, our system latency calculations (Ref: Latency-Analysis-03) prove that the existing 76.8 kbps MS/TP bus speed is completely sufficient for carrying VAV point telemetry, keeping polling latency below 1.2 seconds. This is well within the 3.0-second system operational requirement. We will therefore maintain the MS/TP protocol for local VAV controllers and provide dual high-speed BACnet/IP router gateways on each floor to bridge data to the main server backbone.',
    vocabulary: [
      {
        term: 'BACnet/IP',
        definition:
          'A high-speed communication protocol for building automation networks that transmits data packets using standard Ethernet UDP/IP structures.',
        context:
          'The consultant requested that all VAV controllers be upgraded to native BACnet/IP.',
      },
      {
        term: 'BACnet MS/TP',
        definition:
          'Master-Slave/Token-Passing; a slower, low-cost serial transmission protocol for building automation based on the physical RS-485 communication standard.',
        context: 'Section 15900, Clause 3.2 explicitly permits BACnet MS/TP over RS-485.',
      },
      {
        term: 'BMS',
        definition:
          'Building Management System; a computer-based control system installed in buildings that controls and monitors mechanical and electrical equipment.',
        context: 'With reference to the consultant comment sheet on the Phase 2 BMS Schematics.',
      },
      {
        term: 'router gateway',
        definition:
          'A networking device that translates and routes packets between distinct physical network interfaces and protocols, such as RS-485 serial and Ethernet.',
        context: 'Provide dual high-speed BACnet/IP router gateways on each floor.',
      },
    ],
    questions: [
      {
        id: 'q6_1',
        type: 'multiple_choice',
        questionText:
          'Which contract specification section is cited by the contractor to justify using BACnet MS/TP instead of BACnet/IP?',
        choices: [
          'A) Section 15900, Clause 3.2',
          'B) Submission Ref: ME-BMS-SUB-012',
          'C) Latency-Analysis-03',
          'D) Clause 4.2 of NFPA 72',
        ],
        correctAnswer: 'A',
        explanation:
          'The contractor explicitly cites "Section 15900, Clause 3.2" of the contract specification, which permits BACnet MS/TP for terminal units.',
      },
      {
        id: 'q6_2',
        type: 'keyword_answer',
        questionText:
          'What is the physical serial bus speed (in kbps) of the existing BACnet MS/TP connection?',
        correctAnswer: '76.8',
        keywords: ['76.8', '76.8 kbps', '76.8kbps'],
        explanation:
          'The text references "the existing 76.8 kbps MS/TP bus speed" in the latency calculations.',
      },
      {
        id: 'q6_3',
        type: 'true_false',
        questionText:
          'Upgrading the 420 individual VAV boxes to native BACnet/IP is already included within the current project budget.',
        correctAnswer: 'false',
        explanation:
          'The text says upgrading to BACnet/IP would introduce "substantial, unbudgeted capital costs," indicating it is not within the current budget.',
      },
      {
        id: 'q6_4',
        type: 'short_answer',
        questionText:
          'How does the contractor propose to bridge the MS/TP serial data onto the main high-speed Ethernet server backbone?',
        correctAnswer:
          'The contractor will provide dual high-speed BACnet/IP router gateways on each floor.',
        keywords: ['router gateways', 'gateways', 'router gateway', 'bms gateway', 'bridge'],
        explanation:
          'The passage proposes to provide dual high-speed BACnet/IP router gateways on each floor to bridge data to the main server backbone.',
      },
    ],
    xpReward: 65,
    coinReward: 20,
    eloReward: 14,
  },
];
