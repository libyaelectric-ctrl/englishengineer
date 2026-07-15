import type { ReadingMission } from './reading.types';

export const BUILDING_SYSTEMS_READING_MISSIONS: ReadingMission[] = [
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
        context:
          'Strobe light synchronization was confirmed across all egress paths.',
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
        context:
          'The fire damper control relays on Floor 4 failed to de-energize.',
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
        explanation:
          'The end-of-line resistor values were checked and verified to be 4.7kΩ.',
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
        keywords: [
          're-wire',
          'auxiliary contact',
          'motor starter',
          'rewire',
          'starter panel',
        ],
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
        context:
          'Section 15900, Clause 3.2 explicitly permits BACnet MS/TP over RS-485.',
      },
      {
        term: 'BMS',
        definition:
          'Building Management System; a computer-based control system installed in buildings that controls and monitors mechanical and electrical equipment.',
        context:
          'With reference to the consultant comment sheet on the Phase 2 BMS Schematics.',
      },
      {
        term: 'router gateway',
        definition:
          'A networking device that translates and routes packets between distinct physical network interfaces and protocols, such as RS-485 serial and Ethernet.',
        context:
          'Provide dual high-speed BACnet/IP router gateways on each floor.',
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
        keywords: [
          'router gateways',
          'gateways',
          'router gateway',
          'bms gateway',
          'bridge',
        ],
        explanation:
          'The passage proposes to provide dual high-speed BACnet/IP router gateways on each floor to bridge data to the main server backbone.',
      },
    ],
    xpReward: 65,
    coinReward: 20,
    eloReward: 14,
  },
];
