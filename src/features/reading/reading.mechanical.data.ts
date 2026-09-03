import type { ReadingMission } from '@/shared/types/reading.types';

export const MECHANICAL_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'mechanical_a2_pump_inspection',
    title: 'Pump Inspection Report',
    description: 'Read a simple pump inspection report and answer questions about the findings.',
    discipline: 'Mechanical Engineering',
    cefrLevel: 'A2',
    difficulty: 'Beginner',
    estimatedMinutes: 6,
    passageText:
      'PUMP INSPECTION REPORT\nDate: 12 May 2025\nEquipment: Water pump, Unit 3\nTechnician: J. Kowalski\n\nThe technician checked the pump today. The pump was running for six months without a stop. The technician found a small oil leak near the seal. The seal was worn and needed replacement. The bearing made a noise during operation. The bearing temperature was 75°C. This temperature is too high. The technician stopped the pump. He wrote a work order for new parts. The pump will start again after the repair.',
    vocabulary: [
      {
        term: 'seal',
        definition: 'A device that prevents liquid or gas from leaking out of a machine.',
        context: 'The technician found a small oil leak near the seal.',
        turkishTranslation: 'conta',
      },
      {
        term: 'worn',
        definition: 'Damaged because of long use.',
        context: 'The seal was worn and needed replacement.',
        turkishTranslation: 'yıpranmış',
      },
      {
        term: 'bearing',
        definition: 'A machine part that supports a rotating shaft and reduces friction.',
        context: 'The bearing made a noise during operation.',
        turkishTranslation: 'yatak (rulman)',
      },
      {
        term: 'temperature',
        definition: 'How hot or cold something is, measured in degrees.',
        context: 'The bearing temperature was 75°C.',
        turkishTranslation: 'sıcaklık',
      },
      {
        term: 'replacement',
        definition: 'The act of putting a new part in place of an old one.',
        context: 'The seal was worn and needed replacement.',
        turkishTranslation: 'değiştirme',
      },
    ],
    questions: [
      {
        id: 'mechanical_a2_pump_inspection_q1',
        type: 'multiple_choice',
        questionText: 'Why did the technician stop the pump?',
        choices: [
          'A) The pump was too old.',
          'B) The bearing temperature was too high.',
          'C) The water supply was empty.',
          'D) The work order was not ready.',
        ],
        correctAnswer: 'B',
        explanation:
          'The report states the bearing temperature was 75°C, which was too high, so the technician stopped the pump.',
      },
      {
        id: 'mechanical_a2_pump_inspection_q2',
        type: 'true_false',
        questionText:
          'The pump had been running continuously for six months before the inspection.',
        correctAnswer: 'true',
        explanation: "The passage says 'The pump was running for six months without a stop.'",
      },
      {
        id: 'mechanical_a2_pump_inspection_q3',
        type: 'keyword_answer',
        questionText: 'What two parts did the technician find problems with during the inspection?',
        keywords: ['seal', 'bearing'],
        correctAnswer: 'The technician found problems with the seal and the bearing.',
        explanation:
          'The report mentions an oil leak near the seal (worn) and a noisy bearing with high temperature.',
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
    id: 'mechanical_b1_torque_calibration',
    title: 'Torque Wrench Calibration Record',
    description:
      'Read a torque wrench calibration record and answer questions about the procedure and results.',
    discipline: 'Mechanical Engineering',
    cefrLevel: 'B1',
    difficulty: 'Intermediate',
    estimatedMinutes: 9,
    passageText:
      'TORQUE WRENCH CALIBRATION RECORD\nRecord No.: TWC-2025-047\nDate: 8 July 2025\nInstrument ID: TW-112\nCalibration Lab: Workshop B, Bay 4\nTechnician: M. Arslan\n\nThe torque wrench TW-112 was brought to the calibration station for its scheduled six-month service. The instrument was visually inspected first. No cracks or physical damage were found on the body or handle. The calibration was performed using a certified reference standard traceable to national measurement standards.\n\nThree test points were selected: 50 N·m, 100 N·m, and 150 N·m. At each point, five repeated measurements were taken. The average error at 50 N·m was +1.2%, which is within the acceptable limit of ±3%. At 100 N·m, the average error was +0.8%. At 150 N·m, the error rose to +2.9%, still within acceptable limits.\n\nThe wrench passed all calibration checks. A new calibration sticker was applied showing the next due date of January 2026. The instrument is approved for use in critical fastening operations.',
    vocabulary: [
      {
        term: 'calibration',
        definition:
          'The process of checking and adjusting an instrument so that its measurements are accurate.',
        context:
          'The torque wrench TW-112 was brought to the calibration station for its scheduled six-month service.',
        turkishTranslation: 'kalibrasyon',
      },
      {
        term: 'traceable',
        definition: 'Linked back to a recognized national or international measurement standard.',
        context:
          'The calibration was performed using a certified reference standard traceable to national measurement standards.',
        turkishTranslation: 'izlenebilir',
      },
      {
        term: 'acceptable limit',
        definition: 'The maximum allowed difference between a measured value and the true value.',
        context:
          'The average error at 50 N·m was +1.2%, which is within the acceptable limit of ±3%.',
        turkishTranslation: 'kabul edilebilir sınır',
      },
      {
        term: 'fastening',
        definition: 'The action of tightening a bolt, nut, or screw to join parts together.',
        context: 'The instrument is approved for use in critical fastening operations.',
        turkishTranslation: 'sabitleme / cıvatama',
      },
      {
        term: 'reference standard',
        definition:
          'A highly accurate instrument used as a basis for comparing and checking other instruments.',
        context:
          'The calibration was performed using a certified reference standard traceable to national measurement standards.',
        turkishTranslation: 'referans standart',
      },
    ],
    questions: [
      {
        id: 'mechanical_b1_torque_calibration_q1',
        type: 'multiple_choice',
        questionText: 'How many repeated measurements were taken at each test point?',
        choices: ['A) Three', 'B) Four', 'C) Five', 'D) Six'],
        correctAnswer: 'C',
        explanation:
          "The record states 'five repeated measurements were taken' at each of the three test points.",
      },
      {
        id: 'mechanical_b1_torque_calibration_q2',
        type: 'true_false',
        questionText:
          'The torque wrench failed the calibration check at 150 N·m because the error exceeded ±3%.',
        correctAnswer: 'false',
        explanation:
          'The error at 150 N·m was +2.9%, which is still within the ±3% acceptable limit. The wrench passed all checks.',
      },
      {
        id: 'mechanical_b1_torque_calibration_q3',
        type: 'keyword_answer',
        questionText: 'When is the next calibration due for wrench TW-112?',
        keywords: ['January', '2026'],
        correctAnswer: 'The next calibration is due in January 2026.',
        explanation:
          "The record states the calibration sticker shows 'the next due date of January 2026.'",
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
    id: 'mechanical_b2_vibration_analysis',
    title: 'Vibration Analysis Report – Centrifugal Fan',
    description:
      'Read a vibration analysis report for a centrifugal fan and answer questions about findings and recommendations.',
    discipline: 'Mechanical Engineering',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 11,
    passageText:
      'VIBRATION ANALYSIS REPORT\nReport No.: VAR-2025-088\nEquipment: Centrifugal Fan CF-07, Production Hall C\nDate of Measurement: 15 June 2025\nAnalyst: B. Yıldız, Condition Monitoring Department\n\nVibration measurements were carried out on centrifugal fan CF-07 as part of the quarterly predictive maintenance programme. The fan operates at a rated speed of 1480 rpm and handles process air at a flow rate of 12,000 m³/h.\n\nOverall vibration levels were recorded at four measurement points on the drive-end and non-drive-end bearings of both the fan and motor. The overall velocity reading at the drive-end fan bearing reached 7.4 mm/s RMS, which exceeds the ISO 10816-3 alarm threshold of 7.1 mm/s for machines of this class. Frequency spectrum analysis revealed a dominant peak at 1× running speed, strongly indicating mass imbalance as the primary fault condition.\n\nAdditional sidebands were observed around the bearing defect frequencies, suggesting early-stage wear on the inner race of the drive-end bearing. No looseness or misalignment signatures were detected in the spectrum.\n\nRecommendations: The fan rotor should be rebalanced in situ at the earliest opportunity. The drive-end bearing should be replaced within 30 days to prevent accelerated degradation. A follow-up measurement is required one week after corrective action to confirm resolution of the fault.',
    vocabulary: [
      {
        term: 'predictive maintenance',
        definition:
          'A maintenance strategy that monitors equipment condition to predict and prevent failures before they occur.',
        context:
          'Vibration measurements were carried out on centrifugal fan CF-07 as part of the quarterly predictive maintenance programme.',
        turkishTranslation: 'kestirimci bakım',
      },
      {
        term: 'RMS',
        definition:
          'Root Mean Square; a statistical measure used to express the magnitude of a vibration signal.',
        context:
          'The overall velocity reading at the drive-end fan bearing reached 7.4 mm/s RMS, which exceeds the ISO 10816-3 alarm threshold.',
        turkishTranslation: 'etkin değer (karekök ortalama)',
      },
      {
        term: 'mass imbalance',
        definition:
          'A condition where the mass of a rotating component is unevenly distributed around its axis, causing vibration.',
        context:
          'Frequency spectrum analysis revealed a dominant peak at 1× running speed, strongly indicating mass imbalance as the primary fault condition.',
        turkishTranslation: 'kütle dengesizliği',
      },
      {
        term: 'sideband',
        definition:
          'A frequency component appearing beside a main frequency peak in a vibration spectrum, often indicating a modulated fault.',
        context:
          'Additional sidebands were observed around the bearing defect frequencies, suggesting early-stage wear on the inner race of the drive-end bearing.',
        turkishTranslation: 'yan bant',
      },
      {
        term: 'in situ',
        definition:
          'In its original position, without removing the equipment from the installation.',
        context: 'The fan rotor should be rebalanced in situ at the earliest opportunity.',
        turkishTranslation: 'yerinde (sökmeden)',
      },
    ],
    questions: [
      {
        id: 'mechanical_b2_vibration_analysis_q1',
        type: 'multiple_choice',
        questionText:
          'What does the dominant peak at 1× running speed in the frequency spectrum indicate?',
        choices: [
          'A) Bearing misalignment',
          'B) Structural looseness',
          'C) Mass imbalance of the rotor',
          'D) Overloading of the motor',
        ],
        correctAnswer: 'C',
        explanation:
          "The report states that the dominant peak at 1× running speed 'strongly indicates mass imbalance as the primary fault condition.'",
      },
      {
        id: 'mechanical_b2_vibration_analysis_q2',
        type: 'true_false',
        questionText:
          'The vibration analysis detected misalignment as one of the fault conditions present in fan CF-07.',
        correctAnswer: 'false',
        explanation:
          "The report explicitly states 'No looseness or misalignment signatures were detected in the spectrum.'",
      },
      {
        id: 'mechanical_b2_vibration_analysis_q3',
        type: 'keyword_answer',
        questionText:
          'Within what timeframe should the drive-end bearing be replaced, according to the recommendations?',
        keywords: ['30 days', 'thirty days'],
        correctAnswer: 'The drive-end bearing should be replaced within 30 days.',
        explanation:
          "The recommendations section states the bearing should be replaced 'within 30 days to prevent accelerated degradation.'",
      },
    ],
    xpReward: 50,
    coinReward: 20,
    eloReward: 14,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
  {
    id: 'mechanical_c1_hydraulic_commissioning',
    title: 'Hydraulic System Commissioning Note',
    description:
      'Read a detailed hydraulic system commissioning note and answer advanced comprehension questions.',
    discipline: 'Mechanical Engineering',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 14,
    passageText:
      'HYDRAULIC SYSTEM COMMISSIONING NOTE\nDocument No.: HYD-COMM-2025-014\nProject: Press Line Upgrade – Plant 2, Station 6\nDate: 3 August 2025\nCommissioning Engineer: A. Demir, Senior Hydraulics Engineer\nContractor: Fluidex Systems Ltd.\n\nThis commissioning note documents the initial start-up and functional verification of the hydraulic power unit (HPU) installed as part of the press line upgrade at Station 6. All activities were conducted in accordance with IEC 60204-1, ISO 4413, and the project-specific hydraulic design specification HYD-DS-2025-003.\n\nPrior to energisation, a full pre-start checklist was completed. Fluid cleanliness was verified to ISO 4406 Class 17/15/12 using an in-line particle counter. All relief valves were confirmed to be set below the maximum working pressure of 280 bar. Suction strainers and return-line filters were inspected and found to be clean and correctly fitted.\n\nDuring the initial no-load run at reduced pressure (50 bar), the pump exhibited no abnormal noise, and all directional control valves responded correctly to solenoid actuation. System pressure was incrementally raised to the full working pressure of 280 bar over a period of 30 minutes. Pressure was held for 15 minutes with all actuators in the retracted position. No external leakage was observed at any circuit connection or fitting.\n\nSubsequently, functional testing of each hydraulic cylinder was performed under full load. Stroke times were measured and compared against the design specification; all values fell within the ±5% tolerance band. Safety relief valves were tested by deliberately inducing an over-pressure condition; they opened at 295 bar, within the contractually specified range of 290–300 bar.\n\nShould any leakage or pressure drop exceeding 5 bar over a 10-minute static hold be detected during future operation, the HPU must be isolated immediately and the fault reported to the responsible engineer before any restart is permitted. The system is hereby declared fit for production use, subject to the corrective actions listed in Appendix A being closed within 14 days of this date.',
    vocabulary: [
      {
        term: 'energisation',
        definition:
          'The act of supplying electrical power to a system or equipment to make it operational.',
        context: 'Prior to energisation, a full pre-start checklist was completed.',
        turkishTranslation: 'enerjilenme / devreye alma',
      },
      {
        term: 'fluid cleanliness',
        definition:
          'A measure of the contamination level of hydraulic fluid, expressed as particle count per volume.',
        context:
          'Fluid cleanliness was verified to ISO 4406 Class 17/15/12 using an in-line particle counter.',
        turkishTranslation: 'akışkan temizliği',
      },
      {
        term: 'solenoid actuation',
        definition:
          'The operation of a valve or mechanism by an electromagnetic coil that converts electrical signals into mechanical movement.',
        context: 'All directional control valves responded correctly to solenoid actuation.',
        turkishTranslation: 'solenoid tahrik',
      },
      {
        term: 'static hold',
        definition:
          'A test condition where system pressure is maintained with no fluid flow to detect leakage or pressure decay.',
        context:
          'Should any leakage or pressure drop exceeding 5 bar over a 10-minute static hold be detected during future operation, the HPU must be isolated immediately.',
        turkishTranslation: 'statik basınç tutma testi',
      },
      {
        term: 'corrective actions',
        definition:
          'Steps taken to eliminate the cause of an identified deficiency or non-conformance.',
        context:
          'The system is hereby declared fit for production use, subject to the corrective actions listed in Appendix A being closed within 14 days of this date.',
        turkishTranslation: 'düzeltici faaliyetler',
      },
    ],
    questions: [
      {
        id: 'mechanical_c1_hydraulic_commissioning_q1',
        type: 'multiple_choice',
        questionText:
          'At what pressure did the safety relief valves open during the over-pressure functional test?',
        choices: ['A) 280 bar', 'B) 290 bar', 'C) 295 bar', 'D) 300 bar'],
        correctAnswer: 'C',
        explanation:
          "The document states the safety relief valves 'opened at 295 bar, within the contractually specified range of 290–300 bar.'",
      },
      {
        id: 'mechanical_c1_hydraulic_commissioning_q2',
        type: 'true_false',
        questionText:
          'The hydraulic system was immediately raised to full working pressure of 280 bar at the start of commissioning.',
        correctAnswer: 'false',
        explanation:
          "The note states pressure was 'incrementally raised to the full working pressure of 280 bar over a period of 30 minutes,' starting from a reduced pressure of 50 bar.",
      },
      {
        id: 'mechanical_c1_hydraulic_commissioning_q3',
        type: 'keyword_answer',
        questionText:
          'Under what condition must the HPU be isolated immediately during future operation, and who must be notified before any restart is permitted?',
        keywords: ['leakage', 'pressure drop', '5 bar', 'responsible engineer'],
        correctAnswer:
          'If leakage or a pressure drop exceeding 5 bar over a 10-minute static hold is detected, the HPU must be isolated and the fault reported to the responsible engineer before any restart.',
        explanation:
          "The commissioning note specifies this in the conditional clause beginning with 'Should any leakage or pressure drop exceeding 5 bar...'",
      },
    ],
    xpReward: 55,
    coinReward: 22,
    eloReward: 15,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
];
