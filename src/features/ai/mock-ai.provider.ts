import {
  AICoachResult,
  AIProvider,
  AIProviderStatus,
  AIRequest,
  AIResponse,
} from './ai.types';

export interface MockExample {
  input: string;
  output: string;
}

const MOCK_STATUS: AIProviderStatus = {
  mode: 'mock',
  state: 'mock-fallback',
  label: 'Mock AI demo',
  detail:
    'Secure AI feedback is not connected. Local demo responses are active.',
  isConnected: false,
};

export const createMockAIProvider = (examples: MockExample[]): AIProvider => ({
  getStatus: () => MOCK_STATUS,

  analyzeText: (request: AIRequest): Promise<AIResponse> =>
    createMockResponse(examples, request),
  rewriteText: (request: AIRequest): Promise<AIResponse> =>
    createMockResponse(examples, request),
  generatePractice: (request: AIRequest): Promise<AIResponse> =>
    createMockResponse(examples, request),
  evaluateEngineeringEnglish: (request: AIRequest): Promise<AIResponse> =>
    createMockResponse(examples, request),
  generateStudyPlan: (request: AIRequest): Promise<AIResponse> =>
    createMockResponse(examples, request),
  analyzeProgress: (request: AIRequest): Promise<AIResponse> =>
    createMockResponse(examples, request),
});

const createMockResponse = async (
  examples: MockExample[],
  request: AIRequest
): Promise<AIResponse> => {
  const startedAt = performance.now();
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  const matchedExample = examples.find(
    (example) => example.input.toLowerCase() === request.prompt.toLowerCase()
  );
  const structuredResult = createMockCoachResult(
    request,
    matchedExample?.output
  );

  return {
    text: formatMockCoachText(structuredResult),
    providerStatus: MOCK_STATUS,
    structuredResult,
    metadata: {
      contractVersion: '2026-06-26.v1',
      requestId: 'mock',
      operation: request.operation,
      durationMs: Math.round(performance.now() - startedAt),
      success: true,
      retryCount: 0,
    },
  };
};

const TECHNICAL_TERMS = [
  'constraint',
  'coordination',
  'submittal',
  'commissioning',
  'handover',
  'mitigation',
  'interface',
  'sequence',
  'inspection',
  'compliance',
  'variation',
  'deliverable',
];

const getPromptSignals = (prompt: string): string[] => {
  const normalizedPrompt = prompt.toLowerCase();
  return TECHNICAL_TERMS.filter((term) =>
    normalizedPrompt.includes(term)
  ).slice(0, 5);
};

const createNativeRewrite = (
  request: AIRequest,
  exampleOutput?: string
): string => {
  if (exampleOutput)
    return exampleOutput.replace('AI REFINEMENT:\n', '').replaceAll('"', '');

  const cleanPrompt = request.prompt.trim().replace(/\s+/g, ' ');
  if (request.modeId.includes('email')) {
    return `Dear team, please review the following point: ${cleanPrompt}. I recommend confirming the responsible owner, required evidence, and target closure date before the next coordination meeting.`;
  }
  if (request.modeId.includes('site') || request.modeId.includes('report')) {
    return `During the site coordination discussion, the key issue is: ${cleanPrompt}. The next step is to confirm constraints, assign actions, and record the agreed mitigation plan.`;
  }
  if (request.modeId.includes('roleplay')) {
    return `Roleplay opening: Thank you for raising this point. From the contractor side, I would like to clarify the current constraint, the impact on the programme, and the action we can commit to today. ${cleanPrompt}`;
  }
  if (request.modeId.includes('grammar')) {
    return `Corrected version: ${cleanPrompt}. Focus on verb tense, articles, and clear subject-verb structure in formal engineering communication.`;
  }
  if (request.modeId.includes('vocabulary')) {
    return `Vocabulary explanation: ${cleanPrompt}. Use the term in a sentence, add a collocation, and connect it to site, inspection, commissioning, or procurement context.`;
  }
  if (request.modeId.includes('meeting')) {
    return `I would like to explain the issue clearly. ${cleanPrompt}. The impact is manageable if we confirm the technical requirement, agree the action owner, and follow up with evidence.`;
  }
  return `The main technical point is: ${cleanPrompt}. A stronger professional version should state the issue, explain the impact, and define the next action with clear engineering evidence.`;
};

const createMockCoachResult = (
  request: AIRequest,
  exampleOutput?: string
): AICoachResult => {
  const context = request.context;
  const weakSkills =
    context?.weakSkills.filter((skill) => skill !== 'None') || [];
  const focusArea = context?.recommendedFocus || weakSkills[0] || 'Writing';
  const promptSignals = getPromptSignals(request.prompt);
  const technicalVocabulary = Array.from(
    new Set([
      ...promptSignals,
      ...(context?.weakVocabulary || []).slice(0, 4),
      'coordination',
      'mitigation',
      'compliance',
    ])
  ).slice(0, 8);
  const wordCount = request.prompt.trim().split(/\s+/).filter(Boolean).length;

  return {
    summary: `Mock AI demo active. ${request.modeName} reviewed ${wordCount} words using local learning context for ${context?.userName || 'the learner'}.`,
    strengths: [
      wordCount >= 20
        ? 'You provided enough context for a practical engineering response.'
        : 'Your message is concise and easy to diagnose.',
      promptSignals.length > 0
        ? 'You used recognizable technical vocabulary.'
        : 'The intent is clear enough to convert into professional English.',
      `Current learning profile shows Level ${context?.level || 1} / ELO ${context?.elo || 1000}.`,
    ],
    weaknesses: [
      `Priority practice area: ${focusArea}.`,
      wordCount < 18
        ? 'Add more context about impact, owner, evidence, or deadline.'
        : 'Improve sentence control by separating issue, impact, and next action.',
      weakSkills.length > 0
        ? `Weak skill signals: ${weakSkills.join(', ')}.`
        : 'Continue rotating across Reading, Writing, Listening, Speaking, and Vocabulary.',
    ],
    corrections: [
      'Use "we need to verify" instead of "we need check".',
      'Use "the installation is delayed because..." instead of "installation delayed because...".',
      'Add a clear action owner when giving site or meeting updates.',
    ],
    nativeRewrite: createNativeRewrite(request, exampleOutput),
    professionalVersion: createNativeRewrite(request, exampleOutput),
    simplifiedVersion: `Simple version: ${request.prompt.trim().replace(/\s+/g, ' ')}. State the issue, impact, and next action in short sentences.`,
    technicalVocabulary,
    keyVocabulary: technicalVocabulary,
    grammarNotes: [
      'Check article use before technical nouns such as "the panel", "the inspection", and "the consultant".',
      'Use past tense for completed site work and future forms for planned actions.',
      'Avoid emotional wording; use evidence, impact, and action.',
    ],
    toneFeedback:
      request.modeId.includes('consultant') || request.modeId.includes('ncr')
        ? 'Use a respectful, evidence-led tone. Avoid blame and confirm corrective action clearly.'
        : 'Use a calm professional tone with clear ownership and dates.',
    recommendedNextTask:
      request.operation === 'generateStudyPlan'
        ? `Complete a 20 minute plan: 8 minutes ${focusArea}, 7 minutes Vocabulary, 5 minutes speaking summary.`
        : `Run one ${focusArea} mission, then ask AI Coach to review the result.`,
    estimatedCefrImpact: `Likely impact: stronger ${context?.targetLevel || 'B2'} control if repeated 3 times this week.`,
    cefrEstimate: context?.targetLevel || 'B2',
    engineerEloImpactEstimate:
      wordCount >= 30
        ? '+8 to +14 Engineer ELO if revised and practiced'
        : '+3 to +6 Engineer ELO after adding more project context',
    suggestedActions: [
      'Rewrite your input with one issue, one impact, and one action.',
      'Add three target vocabulary terms from the list above.',
      'Complete the next weak-skill mission from the dashboard.',
    ],
    focusArea,
  };
};

const formatMockCoachText = (result: AICoachResult): string =>
  [
    `Summary\n${result.summary}`,
    `Professional version\n${result.professionalVersion || result.nativeRewrite}`,
    `Simplified version\n${result.simplifiedVersion || result.summary}`,
    `Strengths\n- ${result.strengths.join('\n- ')}`,
    `Weaknesses\n- ${result.weaknesses.join('\n- ')}`,
    `Corrections\n- ${result.corrections.join('\n- ')}`,
    `Tone feedback\n${result.toneFeedback || 'No tone feedback available.'}`,
    `Grammar notes\n- ${(result.grammarNotes || []).join('\n- ')}`,
    `Technical vocabulary\n- ${result.technicalVocabulary.join('\n- ')}`,
    `Recommended next task\n${result.recommendedNextTask}`,
    `Estimated CEFR impact\n${result.estimatedCefrImpact}`,
  ].join('\n\n');
