import type { ReadingMission } from '@/shared/types/reading.types';

export const HSE_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'hse_a2_toolbox_talk',
    title: 'Toolbox Talk: Working Safely at Height',
    description:
      'A short toolbox talk about the basic rules for working safely at height on a construction site.',
    discipline: 'HSE',
    cefrLevel: 'A2',
    difficulty: 'Beginner',
    estimatedMinutes: 6,
    passageText:
      "Today's toolbox talk is about working at height. Falls from height are a major cause of injury on site. Always wear your harness when you work above two metres. Check your harness before you use it. Look for damage or broken parts. Do not use damaged equipment. Use a guardrail if one is available. Keep the work area clean and free from trip hazards. Never lean over the edge of a platform. Tell your supervisor if you see an unsafe condition. Your safety is the most important thing on this site. Ask questions if you are not sure about anything.",
    vocabulary: [
      {
        term: 'harness',
        definition: 'A set of straps worn around the body to prevent a fall from height.',
        context: 'Always wear your harness when you work above two metres.',
        turkishTranslation: 'emniyet kemeri',
      },
      {
        term: 'guardrail',
        definition: 'A rail fixed along the edge of a platform to stop people from falling.',
        context: 'Use a guardrail if one is available.',
        turkishTranslation: 'korkuluk',
      },
      {
        term: 'trip hazard',
        definition: 'Something on the floor that could cause a person to stumble and fall.',
        context: 'Keep the work area clean and free from trip hazards.',
        turkishTranslation: 'takilma tehlikesi',
      },
      {
        term: 'platform',
        definition: 'A raised flat surface where workers stand to do their work.',
        context: 'Never lean over the edge of a platform.',
        turkishTranslation: 'platform / iskele',
      },
      {
        term: 'supervisor',
        definition: 'The person in charge of a team of workers on site.',
        context: 'Tell your supervisor if you see an unsafe condition.',
        turkishTranslation: 'amir / nezaretci',
      },
    ],
    questions: [
      {
        id: 'hse_a2_toolbox_talk_q1',
        type: 'multiple_choice',
        questionText: 'At what height must workers wear a harness?',
        choices: [
          'A) Above one metre',
          'B) Above two metres',
          'C) Above three metres',
          'D) Above five metres',
        ],
        correctAnswer: 'B',
        explanation:
          'The toolbox talk states: Always wear your harness when you work above two metres.',
      },
      {
        id: 'hse_a2_toolbox_talk_q2',
        type: 'true_false',
        questionText: 'Workers should use damaged equipment if a replacement is not available.',
        correctAnswer: 'false',
        explanation:
          'The talk clearly states Do not use damaged equipment with no exceptions mentioned.',
      },
      {
        id: 'hse_a2_toolbox_talk_q3',
        type: 'keyword_answer',
        questionText: 'Who should a worker tell if they see an unsafe condition on site?',
        keywords: ['supervisor'],
        correctAnswer: 'The worker should tell their supervisor.',
        explanation: 'The passage states: Tell your supervisor if you see an unsafe condition.',
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
    id: 'hse_b1_incident_report',
    title: 'Incident Report: Slip in the Warehouse',
    description:
      'Read an incident report about a slip accident in a warehouse and answer questions about the findings and corrective actions.',
    discipline: 'HSE',
    cefrLevel: 'B1',
    difficulty: 'Intermediate',
    estimatedMinutes: 9,
    passageText:
      'Incident Report - Reference: INC-2024-047\n\nDate of Incident: 14 March 2024\nLocation: Warehouse Bay 3, Unit 7\nInjured Person: Operative, J. Marsh\nType of Incident: Slip on wet floor\n\nDescription: At approximately 10:15 on the morning of 14 March 2024, J. Marsh was walking between racking units in Warehouse Bay 3. A leaking pipe above the walkway had caused a pool of water to collect on the concrete floor. No wet floor sign was in place at the time. J. Marsh slipped on the wet surface and fell, sustaining a sprained left ankle. The injured person received first aid on site and was later taken to a local hospital for an X-ray.\n\nImmediate Actions Taken: The area was cordoned off and a wet floor warning sign was placed. The leaking pipe was reported to the maintenance team for urgent repair.\n\nRoot Cause: Failure to identify and report a leaking pipe. Absence of a wet floor warning sign.\n\nCorrective Actions: Maintenance team to repair the pipe within 24 hours. All staff to be reminded of the procedure for reporting defects. A daily walkway inspection checklist to be introduced.',
    vocabulary: [
      {
        term: 'operative',
        definition: 'A worker who performs practical tasks, often in a factory or warehouse.',
        context: 'Injured Person: Operative, J. Marsh',
        turkishTranslation: 'isci / operator',
      },
      {
        term: 'sustaining',
        definition: 'Suffering or experiencing an injury.',
        context: 'J. Marsh slipped on the wet surface and fell, sustaining a sprained left ankle.',
        turkishTranslation: 'maruz kalmak / yaralanmak',
      },
      {
        term: 'cordoned off',
        definition: 'Closed an area to the public using barriers or tape.',
        context: 'The area was cordoned off and a wet floor warning sign was placed.',
        turkishTranslation: 'barikat kurulmak / kapatilmak',
      },
      {
        term: 'root cause',
        definition: 'The original reason that caused a problem or incident to happen.',
        context: 'Root Cause: Failure to identify and report a leaking pipe.',
        turkishTranslation: 'kok neden',
      },
      {
        term: 'defects',
        definition: 'Faults or problems with equipment, structures, or systems.',
        context: 'All staff to be reminded of the procedure for reporting defects.',
        turkishTranslation: 'ariza / kusur',
      },
    ],
    questions: [
      {
        id: 'hse_b1_incident_report_q1',
        type: 'multiple_choice',
        questionText: 'What was the primary cause of the slip accident?',
        choices: [
          'A) J. Marsh was running in the warehouse',
          'B) The floor was recently cleaned with chemicals',
          'C) A leaking pipe created a pool of water on the walkway',
          'D) The lighting in Bay 3 was insufficient',
        ],
        correctAnswer: 'C',
        explanation:
          'The report states a leaking pipe above the walkway caused water to collect on the floor, and no wet floor sign was in place.',
      },
      {
        id: 'hse_b1_incident_report_q2',
        type: 'true_false',
        questionText: 'A wet floor warning sign was already in place before the accident occurred.',
        correctAnswer: 'false',
        explanation:
          'The report clearly states No wet floor sign was in place at the time of the incident.',
      },
      {
        id: 'hse_b1_incident_report_q3',
        type: 'keyword_answer',
        questionText:
          'What new procedure was introduced as a corrective action following the incident?',
        keywords: ['daily', 'walkway', 'inspection', 'checklist'],
        correctAnswer: 'A daily walkway inspection checklist was introduced.',
        explanation:
          'The corrective actions section states: A daily walkway inspection checklist to be introduced.',
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
    id: 'hse_b2_coshh_assessment',
    title: 'COSHH Assessment: Solvent-Based Degreaser',
    description:
      'Read a COSHH assessment for a solvent-based degreaser used in a manufacturing facility and answer comprehension questions.',
    discipline: 'HSE',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 11,
    passageText:
      'COSHH Assessment - Document Reference: COSHH-MFG-019\n\nSubstance: Solvent-Based Degreaser (Product Name: DegraClean Pro)\nSupplier: ChemTech Industries Ltd\nDate of Assessment: 22 January 2024\nAssessor: Health and Safety Coordinator, T. Okonkwo\n\nHazard Identification: DegraClean Pro contains n-hexane (CAS 110-54-3) and isopropanol (CAS 67-63-0). The product is classified as Flammable Liquid Category 2 and causes skin and eye irritation. Prolonged or repeated exposure to n-hexane vapours may cause peripheral neuropathy. The substance has a strong odour and low flash point of 23 degrees Celsius.\n\nExposure Controls: The substance must only be used in areas with adequate local exhaust ventilation (LEV) or forced air ventilation. The workplace exposure limit (WEL) for n-hexane is 72 mg per cubic metre (8-hour TWA). Air monitoring must be carried out every six months to verify compliance.\n\nPersonal Protective Equipment (PPE): Operators must wear nitrile gloves (minimum 0.3 mm thickness), chemical splash goggles, and a half-face respirator fitted with an organic vapour cartridge. Flame-resistant overalls are required when working near ignition sources.\n\nStorage and Disposal: Store in a locked, ventilated, fire-resistant cabinet away from heat sources. Dispose of waste solvent in accordance with the Environmental Protection Act 1990 and site-specific waste management procedures.\n\nEmergency Procedures: In the event of skin or eye contact, flush with running water for at least 15 minutes and seek medical advice. In the event of a spill, evacuate the area, eliminate ignition sources, and apply an absorbent material. Do not allow solvent to enter drains or watercourses.',
    vocabulary: [
      {
        term: 'peripheral neuropathy',
        definition:
          'Damage to the nerves outside the brain and spinal cord, causing weakness, numbness, or pain.',
        context:
          'Prolonged or repeated exposure to n-hexane vapours may cause peripheral neuropathy.',
        turkishTranslation: 'periferik noropati',
      },
      {
        term: 'flash point',
        definition:
          'The lowest temperature at which a liquid can produce enough vapour to ignite in air.',
        context: 'The substance has a strong odour and low flash point of 23 degrees Celsius.',
        turkishTranslation: 'parlama noktasi',
      },
      {
        term: 'workplace exposure limit (WEL)',
        definition:
          'The maximum concentration of a hazardous substance in workplace air that workers may be exposed to.',
        context:
          'The workplace exposure limit (WEL) for n-hexane is 72 mg per cubic metre (8-hour TWA).',
        turkishTranslation: 'isyeri maruziyet limiti',
      },
      {
        term: 'local exhaust ventilation (LEV)',
        definition:
          'An engineering system that captures hazardous airborne substances at the point of release before they can spread.',
        context:
          'The substance must only be used in areas with adequate local exhaust ventilation (LEV) or forced air ventilation.',
        turkishTranslation: 'lokal egzoz havalandirmasi',
      },
      {
        term: 'absorbent material',
        definition: 'A substance such as sand or granules used to soak up liquid spills.',
        context:
          'In the event of a spill, evacuate the area, eliminate ignition sources, and apply an absorbent material.',
        turkishTranslation: 'emici malzeme',
      },
    ],
    questions: [
      {
        id: 'hse_b2_coshh_assessment_q1',
        type: 'multiple_choice',
        questionText:
          'Which health effect is associated with prolonged exposure to n-hexane vapours?',
        choices: [
          'A) Liver damage',
          'B) Peripheral neuropathy',
          'C) Respiratory sensitisation',
          'D) Carcinogenicity',
        ],
        correctAnswer: 'B',
        explanation:
          'The COSHH assessment states: Prolonged or repeated exposure to n-hexane vapours may cause peripheral neuropathy.',
      },
      {
        id: 'hse_b2_coshh_assessment_q2',
        type: 'true_false',
        questionText: 'Air monitoring for n-hexane exposure must be conducted on an annual basis.',
        correctAnswer: 'false',
        explanation:
          'The document states air monitoring must be carried out every six months, not annually.',
      },
      {
        id: 'hse_b2_coshh_assessment_q3',
        type: 'keyword_answer',
        questionText:
          'What type of gloves must operators wear when using DegraClean Pro, and what is the minimum required thickness?',
        keywords: ['nitrile', '0.3 mm'],
        correctAnswer: 'Operators must wear nitrile gloves with a minimum thickness of 0.3 mm.',
        explanation:
          'The PPE section specifies: Operators must wear nitrile gloves (minimum 0.3 mm thickness).',
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
    id: 'hse_c1_permit_to_work',
    title: 'Permit to Work: Hot Work in a Confined Space',
    description:
      'Analyse a permit-to-work document authorising hot work inside a confined space at a petrochemical facility, and evaluate the control measures and conditions stipulated.',
    discipline: 'HSE',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 14,
    passageText:
      'PERMIT TO WORK - HOT WORK IN A CONFINED SPACE\nPermit Reference: PTW-HW-CS-2024-112\nFacility: Northgate Petrochemical Terminal, Unit 4\nIssuing Authority: Site HSE Manager, A. Whitfield\nPermit Valid: 06:00 to 14:00, 28 August 2024\n\nScope of Work: Authorisation is hereby granted for the application of oxy-acetylene cutting equipment to remove a corroded flange assembly on line 4B-DN150 within Vessel V-204. The vessel was previously used to store naphtha and has been subject to nitrogen purging, steam cleaning, and atmospheric testing prior to the commencement of this permit.\n\nPreconditions - All of the following conditions shall have been verified and signed off by the Issuing Authority before any hot work commences:\n(i) Atmospheric testing confirms oxygen concentration between 19.5% and 23.5% v/v, combustible gas level below 1% LEL, and toxic gas concentrations within permissible exposure limits.\n(ii) All pipework connected to V-204 has been positively isolated by means of spectacle blinds or double-block-and-bleed arrangements, and isolation is confirmed by an independent check.\n(iii) A fire watch operative shall be stationed at the confined space entry point throughout the duration of the hot work, equipped with a dry powder extinguisher and a charged hose reel.\n(iv) A trained confined space rescue team, with appropriate entry equipment including SCBA sets, shall be on standby no more than five minutes response time from the entry point.\n\nCancellation Conditions: This permit shall be immediately suspended and all hot work shall cease if any of the following occur: atmospheric readings exceed the limits specified above; the fire watch operative observes smoke, flame propagation, or structural anomaly; communication is lost between the entrant and the standby person; or adverse weather conditions create an ignition risk.\n\nPost-Work Requirements: Upon completion of all hot work activities, the area shall be subject to a 30-minute fire watch to confirm the absence of smouldering materials. The confined space shall not be re-entered until atmospheric re-testing confirms conditions are within safe limits. The permit shall be formally closed by the Issuing Authority and retained on file for a minimum of three years in accordance with The Confined Spaces Regulations 1997.',
    vocabulary: [
      {
        term: 'spectacle blind',
        definition:
          'A disc-shaped device inserted into a pipeline to create a physical barrier that prevents the flow of fluids or gases, used for positive isolation.',
        context:
          'All pipework connected to V-204 has been positively isolated by means of spectacle blinds or double-block-and-bleed arrangements.',
        turkishTranslation: 'gozluk koru (boru izolasyon diski)',
      },
      {
        term: 'lower explosive limit (LEL)',
        definition:
          'The minimum concentration of a flammable gas in air below which an explosion cannot occur.',
        context:
          'Atmospheric testing confirms oxygen concentration between 19.5% and 23.5% v/v, combustible gas level below 1% LEL.',
        turkishTranslation: 'alt patlama siniri',
      },
      {
        term: 'fire watch',
        definition:
          'A designated person who monitors for the ignition of fire during and after hot work operations.',
        context:
          'A fire watch operative shall be stationed at the confined space entry point throughout the duration of the hot work.',
        turkishTranslation: 'yangin nobetcisi',
      },
      {
        term: 'SCBA',
        definition:
          'Self-Contained Breathing Apparatus; a device that supplies breathable air to the wearer in hazardous atmospheres.',
        context:
          'A trained confined space rescue team, with appropriate entry equipment including SCBA sets, shall be on standby.',
        turkishTranslation: 'bagimsiz solunum cihazi (oksijen maskesi)',
      },
      {
        term: 'smouldering',
        definition:
          'Burning slowly without flames, producing smoke, typically in materials such as insulation or debris.',
        context:
          'The area shall be subject to a 30-minute fire watch to confirm the absence of smouldering materials.',
        turkishTranslation: 'icin icin yanma',
      },
    ],
    questions: [
      {
        id: 'hse_c1_permit_to_work_q1',
        type: 'multiple_choice',
        questionText:
          'According to the permit, which condition would require the immediate suspension of all hot work?',
        choices: [
          'A) The oxy-acetylene cutting equipment requires a replacement nozzle',
          'B) The confined space rescue team is six minutes away from the entry point',
          'C) Atmospheric readings exceed the concentration limits specified in the permit',
          'D) The issuing authority has not yet countersigned the post-work section',
        ],
        correctAnswer: 'C',
        explanation:
          'The Cancellation Conditions section states that hot work shall cease if atmospheric readings exceed the limits specified above, among other triggers.',
      },
      {
        id: 'hse_c1_permit_to_work_q2',
        type: 'true_false',
        questionText:
          'Workers may re-enter the confined space immediately after hot work is completed, provided the fire watch operative reports no visible flames.',
        correctAnswer: 'false',
        explanation:
          'The Post-Work Requirements state the space shall not be re-entered until atmospheric re-testing confirms conditions are within safe limits - visible absence of flame alone is insufficient.',
      },
      {
        id: 'hse_c1_permit_to_work_q3',
        type: 'keyword_answer',
        questionText:
          'For how long must the completed permit be retained on file, and under which regulation is this requirement stipulated?',
        keywords: ['three years', 'Confined Spaces Regulations 1997'],
        correctAnswer:
          'The permit must be retained for a minimum of three years in accordance with The Confined Spaces Regulations 1997.',
        explanation:
          'The permit states it shall be formally closed by the Issuing Authority and retained on file for a minimum of three years in accordance with The Confined Spaces Regulations 1997.',
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
