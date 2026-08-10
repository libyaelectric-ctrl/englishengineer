import type { ReadingMission } from './reading.types';

export const QAQC_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'qaqc_a2_inspection_checklist',
    title: 'Daily Inspection Checklist \u2014 Formwork',
    description: 'Read a simple daily inspection checklist for formwork before concrete pour.',
    discipline: 'QA/QC',
    cefrLevel: 'A2',
    difficulty: 'Beginner',
    estimatedMinutes: 6,
    passageText: 'DAILY INSPECTION CHECKLIST \u2014 FORMWORK. Date: 15 March 2026. Area: Foundation F-08. Inspector: J. Torres. Check each item. Mark OK or NOT OK. 1. Formwork panels clean \u2014 no concrete residue. 2. Panel joints tight \u2014 no gaps larger than 2mm. 3. Form oil applied evenly \u2014 not too much. 4. Reinforcement cover spacers in place \u2014 50mm for foundation. 5. Tie rods and wedges tight \u2014 no movement. 6. Formwork dimensions match drawing \u2014 length, width, height. 7. Lifting inserts and anchor bolts position correct. 8. Access for concrete placement clear. If any item is NOT OK, stop work. Tell the foreman. Fix before pour. Sign here when all OK: _______________',
    vocabulary: [
      { term: 'formwork', definition: 'Temporary mold into which concrete is poured.', context: 'Formwork panels clean \u2014 no concrete residue.', turkishTranslation: 'kal\u0131p' },
      { term: 'form oil', definition: 'Oil applied to formwork so concrete does not stick to it.', context: 'Form oil applied evenly \u2014 not too much.', turkishTranslation: 'kal\u0131p ya\u011f\u0131' },
      { term: 'cover spacer', definition: 'Plastic or concrete piece that holds reinforcement at the correct distance from formwork.', context: 'Reinforcement cover spacers in place \u2014 50mm for foundation.', turkishTranslation: 'beton \u00f6rt\u00fc mesafesi' },
      { term: 'tie rod', definition: 'Steel rod that holds two formwork panels together against concrete pressure.', context: 'Tie rods and wedges tight \u2014 no movement.', turkishTranslation: 'ba\u011flan \u00e7ubu\u011fu' },
      { term: 'lifting insert', definition: 'Metal socket cast into concrete for crane lifting hooks.', context: 'Lifting inserts and anchor bolts position correct.', turkishTranslation: 'kald\u0131rma ya\u011f\u0131' },
    ],
    questions: [
      { id: 'qaqc_a2_q1', type: 'multiple_choice', questionText: 'What is the required concrete cover for foundation reinforcement?', choices: ['A) 20mm', 'B) 50mm', 'C) 75mm', 'D) 100mm'], correctAnswer: 'B', explanation: 'The checklist states 50mm for foundation.' },
      { id: 'qaqc_a2_q2', type: 'true_false', questionText: 'If formwork panels have gaps larger than 2mm, you should continue the pour.', correctAnswer: 'false', explanation: 'Panel joints must be tight \u2014 no gaps larger than 2mm. If NOT OK, stop work.' },
      { id: 'qaqc_a2_q3', type: 'keyword_answer', questionText: 'Who should you tell if any checklist item is NOT OK?', keywords: ['foreman', 'supervisor'], correctAnswer: 'the foreman', explanation: 'The checklist says "Tell the foreman. Fix before pour."' },
    ],
    xpReward: 40,
    coinReward: 15,
    eloReward: 12,
    sourceMetadata: { origin: 'EngVox original', author: 'AI Content Generation', schemaVersion: 1 },
  },
  {
    id: 'qaqc_b1_weld_inspection',
    title: 'Weld Inspection Report \u2014 Visual and MT',
    description: 'Read a weld inspection report covering visual examination and magnetic particle testing.',
    discipline: 'QA/QC',
    cefrLevel: 'B1',
    difficulty: 'Intermediate',
    estimatedMinutes: 9,
    passageText: 'WELD INSPECTION REPORT \u2014 WIR-2026-089. Project: Steel Frame, Grid Line C-4 to C-7. Date: 22 April 2026. Weld IDs: W-45, W-46, W-47 (beam-to-column moment connections). Process: SMAW, E7018 electrodes. Visual Inspection (VT): All three welds show acceptable profile. No cracks, porosity, or undercut observed. W-46 has minor spatter on adjacent base metal \u2014 cleaned before MT. Magnetic Particle Testing (MT): Performed per ASME Sec V, Article 7. Wet fluorescent method, yoke AC. Results: W-45 and W-47 \u2014 no relevant indications. W-46 \u2014 one linear indication, 8mm long, at toe of weld on column flange. Indication evaluated per AWS D1.1 Table 6.1. Length exceeds 6mm limit for statically loaded nontubular connections. Disposition: REPAIR. W-46 must be ground out to sound metal, re-welded, and re-tested by MT before acceptance. Inspector: M. Chen, CWI #12345. NDT Level II \u2014 MT.',
    vocabulary: [
      { term: 'SMAW', definition: 'Shielded Metal Arc Welding; stick welding process using flux-coated electrodes.', context: 'Process: SMAW, E7018 electrodes.', turkishTranslation: 'kapl\u0131 elektrot kayna\u011f\u0131' },
      { term: 'magnetic particle testing (MT)', definition: 'Non-destructive test using magnetic fields and iron particles to find surface cracks.', context: 'Magnetic Particle Testing (MT): Performed per ASME Sec V.', turkishTranslation: 'manyetik par\u00e7ac\u0131k testi' },
      { term: 'linear indication', definition: 'A straight-line magnetic particle pattern that suggests a crack or lack of fusion.', context: 'W-46 \u2014 one linear indication, 8mm long, at toe of weld.', turkishTranslation: 'do\u011fusal g\u00f6sterge' },
      { term: 'toe of weld', definition: 'The junction between the weld face and the base metal.', context: 'At toe of weld on column flange.', turkishTranslation: 'kaynak burnu' },
      { term: 'disposition', definition: 'The decision on how to handle a non-conforming item (accept, repair, reject).', context: 'Disposition: REPAIR.', turkishTranslation: 'karar / de\u011ferlendirme' },
    ],
    questions: [
      { id: 'qaqc_b1_q1', type: 'multiple_choice', questionText: 'Which weld had a defect found during magnetic particle testing?', choices: ['A) W-45', 'B) W-46', 'C) W-47', 'D) All three'], correctAnswer: 'B', explanation: 'W-46 had one linear indication, 8mm long, at the toe of weld.' },
      { id: 'qaqc_b1_q2', type: 'true_false', questionText: 'The 8mm indication on W-46 is acceptable per AWS D1.1 for statically loaded connections.', correctAnswer: 'false', explanation: 'The 8mm indication exceeds the 6mm limit for statically loaded nontubular connections.' },
      { id: 'qaqc_b1_q3', type: 'keyword_answer', questionText: 'What must be done to W-46 before it can be accepted?', keywords: ['ground out', 're-welded', 're-tested', 'repair'], correctAnswer: 'Ground out to sound metal, re-welded, and re-tested by MT', explanation: 'The disposition requires W-46 to be ground out, re-welded, and re-tested by MT.' },
    ],
    xpReward: 45,
    coinReward: 18,
    eloReward: 13,
    sourceMetadata: { origin: 'EngVox original', author: 'AI Content Generation', schemaVersion: 1 },
  },
  {
    id: 'qaqc_b2_concrete_cores',
    title: 'Concrete Core Test Report \u2014 Strength Evaluation',
    description: 'Analyze a concrete core test report for in-place strength evaluation of a structural element.',
    discipline: 'QA/QC',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 11,
    passageText: 'CONCRETE CORE TEST REPORT \u2014 CTR-2026-033. Project: High-Rise Tower, Core Wall Level 12-14. Date: 10 May 2026. Reference: ASTM C42 / ACI 318-19. Three cores (C-12, C-13, C-14) extracted from core wall at Grid B-3. Core diameter: 100mm. Length/diameter ratio after capping: 1.95, 2.05, 2.00 (all \u2265 1.75, no correction needed). Compressive strength results: C-12: 42.3 MPa, C-13: 38.7 MPa, C-14: 45.1 MPa. Average: 42.0 MPa. Specified fc\': 40 MPa. Per ACI 318-19 Section 26.12.3.1: (a) Average of 3 cores \u2265 0.85 fc\' = 34.0 MPa \u2014 SATISFIED. (b) No single core < 0.75 fc\' = 30 MPa \u2014 SATISFIED (minimum 38.7 MPa). Conclusion: In-place concrete strength is structurally adequate. No further investigation required. Cores stored in lime-saturated water per ASTM C42 prior to testing. Report prepared by: K. Patel, PE.',
    vocabulary: [
      { term: 'core test', definition: 'Drilling a cylinder of hardened concrete from a structure to test its strength.', context: 'Three cores (C-12, C-13, C-14) extracted from core wall.', turkishTranslation: '\u00e7ekirdek testi' },
      { term: 'L/D ratio', definition: 'Length-to-diameter ratio of a concrete core; affects measured strength.', context: 'Length/diameter ratio after capping: 1.95, 2.05, 2.00.', turkishTranslation: 'boy/\u00e7ap oran\u0131' },
      { term: 'fc\' (f-c-prime)', definition: 'Specified compressive strength of concrete at 28 days.', context: 'Specified fc\': 40 MPa.', turkishTranslation: 'tasar\u0131m bas\u0131n\u00e7 dayan\u0131m\u0131' },
      { term: 'in-place strength', definition: 'The actual strength of concrete in the completed structure.', context: 'In-place concrete strength is structurally adequate.', turkishTranslation: 'yerinde dayan\u0131m' },
      { term: 'lime-saturated water', definition: 'Water saturated with calcium hydroxide used to store cores to prevent moisture loss.', context: 'Cores stored in lime-saturated water per ASTM C42.', turkishTranslation: 'kire\u00e7 doymu\u015f su' },
    ],
    questions: [
      { id: 'qaqc_b2_q1', type: 'multiple_choice', questionText: 'What is the average compressive strength of the three cores?', choices: ['A) 38.7 MPa', 'B) 42.0 MPa', 'C) 45.1 MPa', 'D) 40.0 MPa'], correctAnswer: 'B', explanation: 'The report states the average is 42.0 MPa.' },
      { id: 'qaqc_b2_q2', type: 'true_false', questionText: 'Core C-13 at 38.7 MPa fails the ACI 318 single-core minimum requirement.', correctAnswer: 'false', explanation: 'The minimum is 0.75 fc\' = 30 MPa. C-13 at 38.7 MPa exceeds this.' },
      { id: 'qaqc_b2_q3', type: 'keyword_answer', questionText: 'What ACI 318 section governs core strength evaluation acceptance criteria?', keywords: ['26.12.3.1', 'Section 26.12.3.1', 'ACI 318-19 Section 26.12.3.1'], correctAnswer: 'ACI 318-19 Section 26.12.3.1', explanation: 'The report references Section 26.12.3.1 for the acceptance criteria.' },
    ],
    xpReward: 50,
    coinReward: 20,
    eloReward: 14,
    sourceMetadata: { origin: 'EngVox original', author: 'AI Content Generation', schemaVersion: 1 },
  },
  {
    id: 'ncr_concrete_pour',
    title: 'Non-Conformance Report (NCR) \u2014 Concrete Pour Rejection',
    description: 'Read a formal Non-Conformance Report describing a rejected concrete pour and identify the required corrective action.',
    discipline: 'QA/QC',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 12,
    passageText: 'NON-CONFORMANCE REPORT \u2014 NCR-2026-0417. Project: Substation Civil Works, Package C. Reference Drawing: STR-C-014, Rev 3. Discipline: Civil / Structural. Description of Non-Conformance: During the placement of concrete for foundation pad F-12, the slump test result measured 180mm, exceeding the specified tolerance of 100mm \u00b1 20mm defined in the approved concrete mix design (Ref: MIX-C40-02). Additionally, the curing cover was not applied within the required 30-minute window after finishing, and ambient temperature during the pour exceeded 38\u00b0C without the specified retarder dosage adjustment. As a result, surface cracking consistent with plastic shrinkage was observed on approximately 15% of the exposed pad surface during the 24-hour inspection. Root Cause: The concrete supplier dispatched a batch with excess water added on-site to improve workability, without QA/QC approval, and the site team did not enforce the hot-weather concreting procedure (Ref: PROC-CIV-009). Disposition: REJECT AND REPLACE. The affected section of foundation pad F-12 must be demolished to sound concrete, reinstated with a compliant mix batch under full QA/QC witness, and re-tested for slump, compressive strength (7-day and 28-day cylinders), and surface finish before any subsequent works proceed. Corrective Action Owner: Site Civil Engineer. Preventive Action: All future batches must be witnessed at the batching plant, and hot-weather concreting procedure PROC-CIV-009 is to be reissued to all site supervisors with mandatory acknowledgment.',
    vocabulary: [
      {
        term: 'non-conformance report (NCR)',
        definition:
          'A formal document raised when work, materials, or a process fail to meet the specified requirements, recording the issue, its root cause, and the required corrective action.',
        context: 'NON-CONFORMANCE REPORT \u2014 NCR-2026-0417.',
      },
      {
        term: 'slump test',
        definition:
          'A field test that measures the consistency and workability of fresh concrete by observing how far a sample slumps after a cone mold is removed.',
        context: 'The slump test result measured 180mm, exceeding the specified tolerance.',
      },
      {
        term: 'plastic shrinkage cracking',
        definition:
          'Surface cracking in fresh concrete caused by rapid moisture loss before the concrete has gained sufficient strength, often due to heat, wind, or delayed curing.',
        context:
          'Surface cracking consistent with plastic shrinkage was observed on approximately 15% of the exposed pad surface.',
      },
      {
        term: 'disposition',
        definition:
          'The formal decision on how a non-conforming item will be handled \u2014 for example, reject and replace, repair, or accept as-is with justification.',
        context: 'Disposition: REJECT AND REPLACE.',
      },
      {
        term: 'corrective action',
        definition:
          'The action taken to fix an existing non-conformance and prevent the same defect from recurring in the immediate work.',
        context: 'Corrective Action Owner: Site Civil Engineer.',
      },
    ],
    questions: [
      {
        id: 'ncr_q1',
        type: 'multiple_choice',
        questionText: 'What was the primary measured deviation that triggered this NCR?',
        choices: [
          'A) Incorrect rebar spacing',
          'B) Slump test result exceeding the specified tolerance',
          'C) Wrong foundation pad location',
          'D) Missing drawing revision',
        ],
        correctAnswer: 'B',
        explanation:
          'The passage states the slump test measured 180mm against a specified tolerance of 100mm \u00b1 20mm.',
      },
      {
        id: 'ncr_q2',
        type: 'true_false',
        questionText:
          'The NCR disposition allows the foundation pad to remain in place with only a surface repair.',
        correctAnswer: 'false',
        explanation:
          'The disposition explicitly requires demolition of the affected section and full reinstatement, not a surface repair.',
      },
      {
        id: 'ncr_q3',
        type: 'keyword_answer',
        questionText:
          'What action must be taken at the batching plant for all future concrete batches, according to the preventive action section?',
        keywords: ['witnessed', 'batching plant', 'witness'],
        correctAnswer: 'witnessed at the batching plant',
        explanation:
          'The preventive action states that all future batches must be witnessed at the batching plant.',
      },
    ],
    xpReward: 55,
    coinReward: 20,
    eloReward: 15,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'EngineerOS Content Team',
      schemaVersion: 1,
    },
  },
];