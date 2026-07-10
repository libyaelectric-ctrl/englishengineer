import { randomUUID } from 'node:crypto';
import { ApiError } from '../errors.js';
import {
  mockText,
  callOpenAI,
  callAnthropic,
  callGemini,
} from './providers.js';

export const AI_CONTRACT_VERSION = '2026-06-26.v1';

const JSON_STRUCTURE_INSTRUCTION = `
CRITICAL RESPONSE REQUIREMENT: You must respond ONLY with a single valid JSON object containing structural analysis of the user's input.
Do NOT write any conversational text before or after the JSON.
Do NOT wrap the response in markdown backticks (like \`\`\`json ... \`\`\`).
The JSON object must match this schema exactly:
{
  "summary": "Concise overview of the overall quality of the user's technical English input.",
  "strengths": ["At least 2 specific strengths in terminology, syntax, or clarity."],
  "weaknesses": ["At least 2 specific weaknesses or errors found in the text."],
  "corrections": ["Specific phrase corrections (e.g. 'Use X instead of Y' or line adjustments)."],
  "professionalVersion": "A highly polished, formal engineering translation/rewrite of the input.",
  "simplifiedVersion": "A plain English version using short, clear sentences.",
  "nativeRewrite": "A natural, native-sounding rewrite of the input.",
  "technicalVocabulary": ["List of key technical or engineering terms present or suggested (e.g. alignment, clearance, commissioning)."],
  "grammarNotes": ["Detailed grammar insights explaining the corrections."],
  "toneFeedback": "Specific feedback on tone appropriateness (e.g. too casual, blame-based, or ideal).",
  "recommendedNextTask": "A specific practice task tailored to their weak areas.",
  "cefrEstimate": "Estimated CEFR level (A1, A2, B1, B2, C1, or C2) of the input.",
  "engineerEloImpactEstimate": "A simulated learning ELO impact estimate (e.g. +12 ELO, +15 ELO, etc.)"
}
`;

const readPrompt = (body) => {
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    throw new ApiError(
      400,
      'invalid_prompt',
      'A non-empty prompt is required.'
    );
  }
  if (prompt.length > 20_000) {
    throw new ApiError(
      413,
      'prompt_too_large',
      'Prompt must be 20,000 characters or fewer.'
    );
  }
  return prompt;
};

const withTimeout = async (work, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await work(controller.signal);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError(
        504,
        'ai_timeout',
        'The AI provider did not respond before the timeout.'
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const createAIService = (config, fetchImpl = fetch) => ({
  async complete(operation, body) {
    const prompt = readPrompt(body);
    const requestId =
      typeof body?.metadata?.requestId === 'string'
        ? body.metadata.requestId
        : randomUUID();
    const startedAt = Date.now();

    if (!config.configured) {
      return {
        contractVersion: AI_CONTRACT_VERSION,
        requestId,
        operation,
        text: mockText(operation),
        provider: 'mock',
        mode: 'mock',
        mockMode: true,
        durationMs: Date.now() - startedAt,
      };
    }

    // Only apply structured evaluation if requested by the frontend with a context object
    const isEvaluation = [
      'analyzeProgress',
      'evaluateEngineeringEnglish',
      'analyzeText',
    ].includes(operation) && (body?.context !== undefined);

    let finalPrompt = prompt;
    if (isEvaluation) {
      finalPrompt = `${prompt}\n\n${JSON_STRUCTURE_INSTRUCTION}`;
    }

    const text = await withTimeout((signal) => {
      if (config.provider === 'anthropic') {
        return callAnthropic(config, finalPrompt, signal, fetchImpl);
      } else if (config.provider === 'gemini') {
        return callGemini(config, finalPrompt, signal, fetchImpl, isEvaluation);
      }
      return callOpenAI(config, finalPrompt, signal, fetchImpl, isEvaluation);
    }, config.timeoutMs);

    let structuredResult = null;
    let responseText = text;

    if (isEvaluation) {
      try {
        let cleanText = text.trim();
        if (cleanText.startsWith('```')) {
          const lines = cleanText.split('\n');
          if (lines[0].startsWith('```')) {
            lines.shift();
          }
          if (lines[lines.length - 1] === '```') {
            lines.pop();
          }
          cleanText = lines.join('\n').trim();
        }
        const parsed = JSON.parse(cleanText);
        structuredResult = parsed;
        responseText = parsed.professionalVersion || parsed.summary || text;
      } catch (err) {
        console.error('Failed to parse AI evaluation structured response:', err);
      }
    }

    return {
      contractVersion: AI_CONTRACT_VERSION,
      requestId,
      operation,
      text: responseText,
      structuredResult,
      provider: config.provider,
      mode: 'real',
      mockMode: false,
      durationMs: Date.now() - startedAt,
    };
  },
});
