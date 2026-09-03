import type { ReadingMission } from '@/shared/types/reading.types';

export const ARCHITECTURE_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'architecture_a2_drawing_register_notice',
    title: 'Site Notice — Drawing Register',
    description:
      'Read a short site notice about the drawing register and find the key instructions.',
    discipline: 'Architecture',
    cefrLevel: 'A2',
    difficulty: 'Beginner',
    estimatedMinutes: 6,
    passageText:
      'SITE NOTICE. To all site teams: please use only the latest drawings from the drawing register. The drawing register is a list of all project drawings and their revisions. Old revisions must not be used on site. Revision 3 of the floor plan was issued on Monday. Check the revision box in the title block before you start any work. If you are not sure, ask the site architect. Printed copies older than this week are now invalid. Put old drawings in the recycle box at the site office. Thank you for your cooperation. — Project: Riverside Offices, Block A.',
    vocabulary: [
      {
        term: 'drawing register',
        definition: 'A controlled list of all project drawings and their current revisions.',
        context: 'The drawing register is a list of all project drawings and their revisions.',
        turkishTranslation: 'çizim kayıt listesi',
      },
      {
        term: 'revision',
        definition: 'A numbered version of a drawing that changes when the design is updated.',
        context: 'Revision 3 of the floor plan was issued on Monday.',
        turkishTranslation: 'revizyon',
      },
      {
        term: 'floor plan',
        definition: 'A drawing that shows the rooms and walls of a building seen from above.',
        context: 'Revision 3 of the floor plan was issued on Monday.',
        turkishTranslation: 'kat planı',
      },
      {
        term: 'title block',
        definition: 'The information box on a drawing that shows its name, number and revision.',
        context: 'Check the revision box in the title block before you start any work.',
        turkishTranslation: 'antet / başlık bloğu',
      },
      {
        term: 'issued',
        definition: 'Formally sent out for use, for example a drawing sent to the site team.',
        context: 'Revision 3 of the floor plan was issued on Monday.',
        turkishTranslation: 'yayınlanmış',
      },
    ],
    questions: [
      {
        id: 'arch_a2_q1',
        type: 'multiple_choice',
        questionText: 'What must site teams use?',
        choices: [
          'A) Any printed drawing',
          'B) Only the latest drawings from the drawing register',
          'C) Drawings from last month',
          'D) Sketches from the site office',
        ],
        correctAnswer: 'B',
        explanation:
          'The notice opens with "please use only the latest drawings from the drawing register."',
      },
      {
        id: 'arch_a2_q2',
        type: 'true_false',
        questionText: 'Printed copies older than this week are still valid.',
        correctAnswer: 'false',
        explanation: 'The notice states that printed copies older than this week are now invalid.',
      },
      {
        id: 'arch_a2_q3',
        type: 'keyword_answer',
        questionText: 'Who should you ask if you are not sure about a drawing?',
        keywords: ['site architect', 'architect'],
        correctAnswer: 'the site architect',
        explanation: 'The notice says: "If you are not sure, ask the site architect."',
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
    id: 'architecture_b1_rfi_door_schedule',
    title: 'RFI — Door Schedule Conflict',
    description:
      'Read a Request for Information (RFI) about a conflict between the door schedule and the floor plan.',
    discipline: 'Architecture',
    cefrLevel: 'B1',
    difficulty: 'Intermediate',
    estimatedMinutes: 8,
    passageText:
      'RFI-ARC-018. Project: Riverside Offices, Block A. To: Design Office. From: Site Architect. Subject: Door schedule conflict, Level 2. We found a conflict between the door schedule and the floor plan on Level 2. According to door schedule DS-02, door D-214 should be a fire door with 90 minutes of fire resistance. However, on floor plan A-201, revision 3, the same door is marked as a standard timber door. The wall around door D-214 is a fire separation wall between the corridor and the stair core. If we install the wrong door, the fire compartment will not work and the inspection will fail. Please confirm which document is correct and issue a revised drawing if necessary. We need your answer before Friday, because the door manufacturer orders all Level 2 doors this week. Please also confirm the door width, because the schedule says 900 mm but the plan shows 950 mm. — Status: Open.',
    vocabulary: [
      {
        term: 'door schedule',
        definition:
          'A table that lists every door in a project with its size, material and performance.',
        context: 'We found a conflict between the door schedule and the floor plan on Level 2.',
        turkishTranslation: 'kapı listesi / kapı mahal listesi',
      },
      {
        term: 'fire resistance',
        definition:
          'The ability of an element to resist fire for a stated time, such as 90 minutes.',
        context: 'Door D-214 should be a fire door with 90 minutes of fire resistance.',
        turkishTranslation: 'yangın dayanımı',
      },
      {
        term: 'fire compartment',
        definition:
          'A part of a building separated by fire-resistant walls and doors to stop fire spread.',
        context: 'If we install the wrong door, the fire compartment will not work.',
        turkishTranslation: 'yangın kompartımanı',
      },
      {
        term: 'issue (a drawing)',
        definition: 'To formally release a drawing or document to the project team.',
        context:
          'Please confirm which document is correct and issue a revised drawing if necessary.',
        turkishTranslation: 'yayınlamak',
      },
      {
        term: 'confirm',
        definition: 'To check and state clearly that something is correct or true.',
        context: 'Please also confirm the door width, because the schedule says 900 mm.',
        turkishTranslation: 'teyit etmek',
      },
    ],
    questions: [
      {
        id: 'arch_b1_q1',
        type: 'multiple_choice',
        questionText: 'What is the main conflict described in the RFI?',
        choices: [
          'A) The door colour is different on the plan',
          'B) The schedule requires a fire door, but the plan shows a standard timber door',
          'C) The door is missing from the schedule',
          'D) The wall position changed on Level 3',
        ],
        correctAnswer: 'B',
        explanation:
          'The schedule says D-214 is a 90-minute fire door, while plan A-201 marks it as a standard timber door.',
      },
      {
        id: 'arch_b1_q2',
        type: 'true_false',
        questionText: 'The site team needs an answer before Friday.',
        correctAnswer: 'true',
        explanation:
          'The RFI says "We need your answer before Friday, because the door manufacturer orders all Level 2 doors this week."',
      },
      {
        id: 'arch_b1_q3',
        type: 'keyword_answer',
        questionText: 'Which two door widths does the RFI ask to confirm?',
        keywords: ['900', '950', 'mm'],
        correctAnswer: '900 mm and 950 mm',
        explanation: 'The schedule says 900 mm, but the plan shows 950 mm.',
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
    id: 'architecture_b2_design_review_minutes',
    title: 'Design Review Minutes — Facade Coordination',
    description:
      'Read the minutes of a design review meeting about facade and MEP coordination issues.',
    discipline: 'Architecture',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    passageText:
      'MINUTES OF DESIGN REVIEW MEETING — DR-07. Project: Riverside Offices, Block A. Attendees: Architect, Facade Consultant, MEP Coordinator, Structural Engineer. 1. Facade bracket clashes. The facade consultant reported 14 clashes between curtain wall brackets and slab edge embeds on Levels 3 to 5. The structural engineer agreed to review the embed layout and provide revised locations within five working days. Until then, no bracket fabrication will be released for the affected bays. 2. Visual mock-up. The client rejected the first visual mock-up panel because the aluminium profile colour appeared darker than the approved sample board. The facade consultant will prepare a second mock-up with two alternative finishes. The mock-up must be installed on the south elevation, where daylight conditions are most representative. 3. Thermal movement. The consultant reminded the team that the expansion joints at the parapet must accommodate 22 mm of thermal movement. The current detail allows only 15 mm. The architect will issue a sketch detail for review at the next meeting. 4. Action summary. All actions were recorded in the tracker with owners and due dates. The next design review is scheduled for Thursday. Any items not closed by then will be escalated to the project manager.',
    vocabulary: [
      {
        term: 'clash',
        definition:
          'A situation where two building elements occupy the same space or interfere with each other.',
        context:
          'The facade consultant reported 14 clashes between curtain wall brackets and slab edge embeds.',
        turkishTranslation: 'çakışma',
      },
      {
        term: 'curtain wall',
        definition:
          'A non-structural outer wall system, usually glass and aluminium, hung from the building frame.',
        context: '14 clashes between curtain wall brackets and slab edge embeds on Levels 3 to 5.',
        turkishTranslation: 'giydirme cephe',
      },
      {
        term: 'mock-up',
        definition:
          'A full-size sample of a building element built for approval before full production.',
        context:
          'The facade consultant will prepare a second mock-up with two alternative finishes.',
        turkishTranslation: 'numune / mock-up',
      },
      {
        term: 'expansion joint',
        definition:
          'A designed gap that allows building elements to move with temperature changes.',
        context: 'The expansion joints at the parapet must accommodate 22 mm of thermal movement.',
        turkishTranslation: 'genleşme derzi',
      },
      {
        term: 'escalate',
        definition: 'To raise an unresolved issue to a higher level of authority.',
        context: 'Any items not closed by then will be escalated to the project manager.',
        turkishTranslation: 'üst mercie taşımak',
      },
    ],
    questions: [
      {
        id: 'arch_b2_q1',
        type: 'multiple_choice',
        questionText: 'Why was the first visual mock-up panel rejected?',
        choices: [
          'A) It was installed on the wrong elevation',
          'B) The aluminium profile colour appeared darker than the approved sample board',
          'C) The bracket layout clashed with the embeds',
          'D) The panel was 22 mm too wide',
        ],
        correctAnswer: 'B',
        explanation:
          'The minutes state the client rejected the panel because the profile colour appeared darker than the approved sample board.',
      },
      {
        id: 'arch_b2_q2',
        type: 'true_false',
        questionText:
          'Bracket fabrication for the affected bays can continue while the embed layout is reviewed.',
        correctAnswer: 'false',
        explanation:
          'The minutes say that until the revised embed locations are provided, no bracket fabrication will be released for the affected bays.',
      },
      {
        id: 'arch_b2_q3',
        type: 'keyword_answer',
        questionText: 'How much thermal movement must the parapet expansion joints accommodate?',
        keywords: ['22', '22 mm'],
        correctAnswer: '22 mm',
        explanation: 'The consultant stated the joints must accommodate 22 mm of thermal movement.',
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
    id: 'architecture_c1_ai_variation_notice',
    title: "Architect's Instruction — Variation to Entrance Canopy",
    description:
      "Read a formal Architect's Instruction issuing a variation to the entrance canopy design and identify its contractual consequences.",
    discipline: 'Architecture',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 12,
    passageText:
      "ARCHITECT'S INSTRUCTION — AI-2026-031. Project: Riverside Offices, Block A. Issued under Clause 12 of the Conditions of Contract. To: Main Contractor. You are hereby instructed to vary the design of the main entrance canopy as described below. 1. Scope of variation. The canopy projection shall be increased from 2.4 m to 3.6 m along the full width of the entrance frontage. The supporting columns shall be relocated accordingly, and the drainage falls shall be re-graded to direct rainwater to the new channel line at the canopy edge. All affected structural calculations shall be revised by the contractor's design team and submitted for review within ten working days. 2. Programme implications. The contractor shall, within seven days of receiving this instruction, submit a detailed assessment of the impact on the completion date. Should the contractor fail to submit within this period, it shall be deemed that the variation has no impact on the programme. 3. Cost assessment. No additional payment shall be considered unless a substantiated quotation, supported by a breakdown of rates, is submitted prior to the commencement of the varied work. Works executed before written cost acceptance are undertaken entirely at the contractor's risk. 4. Compliance. Nothing in this instruction shall relieve the contractor of any obligation under the contract, including compliance with the approved fire strategy and the accessibility requirements of Part M. This instruction is issued without prejudice to the rights of either party under Clause 20 (claims and disputes). — Signed: Project Architect, Design Office.",
    vocabulary: [
      {
        term: 'variation',
        definition:
          'A formal change to the scope, design or conditions of a construction contract.',
        context: 'You are hereby instructed to vary the design of the main entrance canopy.',
        turkishTranslation: 'değişiklik / varyasyon',
      },
      {
        term: 'canopy',
        definition: 'A covered structure projecting over an entrance to provide shelter.',
        context: 'The canopy projection shall be increased from 2.4 m to 3.6 m.',
        turkishTranslation: 'giriş saçak / kanopi',
      },
      {
        term: 'drainage falls',
        definition: 'The slopes built into a surface so that water flows to the outlet.',
        context:
          'The drainage falls shall be re-graded to direct rainwater to the new channel line.',
        turkishTranslation: 'drenaj eğimleri',
      },
      {
        term: 'substantiated',
        definition: 'Supported by evidence or detailed documentation that proves the claim.',
        context:
          'No additional payment shall be considered unless a substantiated quotation is submitted.',
        turkishTranslation: 'belgeye dayandırılmış',
      },
      {
        term: 'without prejudice',
        definition:
          'A legal phrase meaning that an action or statement does not remove any existing rights.',
        context:
          'This instruction is issued without prejudice to the rights of either party under Clause 20.',
        turkishTranslation: 'hakları saklı tutarak',
      },
    ],
    questions: [
      {
        id: 'arch_c1_q1',
        type: 'multiple_choice',
        questionText:
          'What happens if the contractor does not submit the programme assessment within seven days?',
        choices: [
          'A) The instruction is cancelled',
          'B) The variation will be deemed to have no impact on the programme',
          'C) The contractor receives an automatic extension of time',
          'D) The architect must reissue the instruction',
        ],
        correctAnswer: 'B',
        explanation:
          'Clause 2 states that failure to submit within seven days means it shall be deemed that the variation has no programme impact.',
      },
      {
        id: 'arch_c1_q2',
        type: 'true_false',
        questionText:
          'The contractor may start the varied work immediately and submit the quotation afterwards.',
        correctAnswer: 'false',
        explanation:
          "The instruction requires a substantiated quotation before commencement; works executed before written cost acceptance are at the contractor's risk.",
      },
      {
        id: 'arch_c1_q3',
        type: 'keyword_answer',
        questionText:
          'Within how many working days must the revised structural calculations be submitted?',
        keywords: ['ten', '10', 'ten working days'],
        correctAnswer: 'ten working days',
        explanation:
          'The scope section requires revised structural calculations to be submitted within ten working days.',
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
