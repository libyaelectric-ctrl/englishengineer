import { WritingMission, WritingSpec } from './writing.types';
import { STARTER_WRITING_MISSIONS } from './writing.starter.data';
import { WRITING_REPORT_SPECS } from './writing.reports.data';
import { WRITING_QAQC_SPECS } from './writing.qaqc.data';
import { WRITING_DESIGN_SPECS } from './writing.design.data';
import { WRITING_PROCUREMENT_SAFETY_SPECS } from './writing.procurement-safety.data';
import { WRITING_ELECTRICAL_SPECS } from './writing.electrical.data';

const rubric = {
  clarity:
    'The message explains the issue, status, impact, and required action without ambiguity.',
  technicalAccuracy:
    'The response uses evidence, quantities, dates, references, and discipline-specific facts accurately.',
  grammar:
    'The answer controls tense, articles, sentence boundaries, and passive voice for professional engineering writing.',
  professionalTone:
    'The answer is factual, respectful, non-defensive, and suitable for client or consultant review.',
  conciseness:
    'The answer avoids unnecessary repetition while keeping all required technical information.',
  completeness:
    'The answer includes context, evidence, impact, action owner, deadline, and required response.',
  actionOrientation:
    'The answer closes with a clear next step, responsible party, and response date.',
  structure:
    'The answer follows a professional sequence with context, evidence, action, owner, and deadline.',
  technicalVocabulary:
    'The answer uses accurate engineering terminology instead of vague site language.',
};

const buildMission = (spec: WritingSpec, index: number): WritingMission => ({
  id: spec.id,
  title: spec.title,
  description: spec.task,
  discipline: spec.discipline,
  cefrLevel: spec.cefrLevel,
  difficulty: spec.difficulty,
  estimatedMinutes:
    spec.difficulty === 'Advanced'
      ? 24
      : spec.difficulty === 'Intermediate'
        ? 18
        : 14,
  initialDraft: `${spec.weakPhrase} We did some work and there is a problem. Please check and approve fast because the team is waiting.`,
  corrections: [
    {
      id: `${spec.id}_grammar`,
      type: 'grammar',
      text: 'Use complete professional sentence structure with clear tense and responsibility.',
      original: 'We did some work',
      fix: `The ${spec.category.toLowerCase()} activity was completed in line with the approved sequence`,
    },
    {
      id: `${spec.id}_vocabulary`,
      type: 'vocabulary',
      text: 'Replace vague wording with discipline-specific engineering vocabulary.',
      original: 'there is a problem',
      fix: spec.strongPhrase,
    },
    {
      id: `${spec.id}_style`,
      type: 'style',
      text: 'Replace urgent informal approval language with a controlled action request.',
      original: 'approve fast because the team is waiting',
      fix: 'review the attached evidence and confirm acceptance or comments by the agreed response date',
    },
  ],
  xpReward: 70 + index * 2,
  coinReward: 20 + Math.floor(index / 3),
  eloReward: 12 + Math.floor(index / 4),
  scenario: spec.scenario,
  task: spec.task,
  expectedStructure: spec.expectedStructure,
  targetVocabulary: spec.targetVocabulary,
  grammarFocus: spec.grammarFocus,
  assessmentRubric: rubric,
  sampleExcellentAnswer: `Subject: ${spec.title}. ${spec.strongPhrase} The impact, evidence, responsible party, and required next action are summarized below for review. Please advise if further clarification is required before the next coordination milestone.`,
  sampleWeakAnswer: `${spec.weakPhrase} We need approval quickly and the site team is waiting.`,
  feedbackHints: [
    'Start with project context and document reference.',
    'State the technical issue or progress using measurable evidence.',
    'Close with a clear action, owner, and deadline.',
  ],
});

const WRITING_SPECS: WritingSpec[] = [
  ...WRITING_REPORT_SPECS,
  ...WRITING_QAQC_SPECS,
  ...WRITING_DESIGN_SPECS,
  ...WRITING_PROCUREMENT_SAFETY_SPECS,
  ...WRITING_ELECTRICAL_SPECS,
];

export const WRITING_MISSIONS: WritingMission[] = [
  ...STARTER_WRITING_MISSIONS,
  ...WRITING_SPECS.map(buildMission),
];
