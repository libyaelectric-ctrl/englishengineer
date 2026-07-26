import type { ReadingMission } from './reading.types';

export const QAQC_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'ncr_concrete_pour',
    title: 'Non-Conformance Report (NCR) — Concrete Pour Rejection',
    description:
      'Read a formal Non-Conformance Report describing a rejected concrete pour and identify the required corrective action.',
    discipline: 'QA/QC',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 12,
    passageText:
      'NON-CONFORMANCE REPORT — NCR-2026-0417. Project: Substation Civil Works, Package C. Reference Drawing: STR-C-014, Rev 3. Discipline: Civil / Structural. Description of Non-Conformance: During the placement of concrete for foundation pad F-12, the slump test result measured 180mm, exceeding the specified tolerance of 100mm ± 20mm defined in the approved concrete mix design (Ref: MIX-C40-02). Additionally, the curing cover was not applied within the required 30-minute window after finishing, and ambient temperature during the pour exceeded 38°C without the specified retarder dosage adjustment. As a result, surface cracking consistent with plastic shrinkage was observed on approximately 15% of the exposed pad surface during the 24-hour inspection. Root Cause: The concrete supplier dispatched a batch with excess water added on-site to improve workability, without QA/QC approval, and the site team did not enforce the hot-weather concreting procedure (Ref: PROC-CIV-009). Disposition: REJECT AND REPLACE. The affected section of foundation pad F-12 must be demolished to sound concrete, reinstated with a compliant mix batch under full QA/QC witness, and re-tested for slump, compressive strength (7-day and 28-day cylinders), and surface finish before any subsequent works proceed. Corrective Action Owner: Site Civil Engineer. Preventive Action: All future batches must be witnessed at the batching plant, and hot-weather concreting procedure PROC-CIV-009 is to be reissued to all site supervisors with mandatory acknowledgment.',
    vocabulary: [
      {
        term: 'non-conformance report (NCR)',
        definition:
          'A formal document raised when work, materials, or a process fail to meet the specified requirements, recording the issue, its root cause, and the required corrective action.',
        context:
          'NON-CONFORMANCE REPORT — NCR-2026-0417.',
      },
      {
        term: 'slump test',
        definition:
          'A field test that measures the consistency and workability of fresh concrete by observing how far a sample slumps after a cone mold is removed.',
        context:
          'The slump test result measured 180mm, exceeding the specified tolerance.',
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
          'The formal decision on how a non-conforming item will be handled — for example, reject and replace, repair, or accept as-is with justification.',
        context:
          'Disposition: REJECT AND REPLACE.',
      },
      {
        term: 'corrective action',
        definition:
          'The action taken to fix an existing non-conformance and prevent the same defect from recurring in the immediate work.',
        context:
          'Corrective Action Owner: Site Civil Engineer.',
      },
    ],
    questions: [
      {
        id: 'ncr_q1',
        type: 'multiple_choice',
        questionText:
          'What was the primary measured deviation that triggered this NCR?',
        choices: [
          'A) Incorrect rebar spacing',
          'B) Slump test result exceeding the specified tolerance',
          'C) Wrong foundation pad location',
          'D) Missing drawing revision',
        ],
        correctAnswer: 'B',
        explanation:
          'The passage states the slump test measured 180mm against a specified tolerance of 100mm ± 20mm.',
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
