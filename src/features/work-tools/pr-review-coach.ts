import { AIService } from '@/features/ai';
import type { MockExample } from '@/features/ai';

export interface PRReviewInput {
  rawText: string;
}

export interface PRReviewResult {
  polishedText: string;
  toneAnalysis: string;
  keyChanges: string[];
  isAiPowered: boolean;
}

const MOCK_EXAMPLES: MockExample[] = [
  {
    input: 'This code is terrible. Fix it now.',
    output:
      'AI REFINEMENT:\nThe code in this section could benefit from some improvements. I suggest refactoring the relevant parts to enhance readability and maintainability. Could you please address the following points?\n\n1. Consider extracting the complex logic into a separate function\n2. Add meaningful variable names for clarity\n3. Include appropriate error handling\n\nHappy to discuss if you have questions!',
  },
  {
    input: 'Why would anyone write it this way? This is wrong.',
    output:
      "AI REFINEMENT:\nI noticed a few areas where the implementation might not align with our coding standards. Let's review together:\n\n- The current approach works, but there may be a more efficient pattern we could use\n- Consider the edge cases and how they're handled\n- Perhaps we could add some documentation to explain the rationale\n\nWould you be open to pairing on this to find the best solution?",
  },
];

/**
 * Rule-based fallback when AI service is unavailable.
 * Performs simple tone softening patterns.
 */
const ruleBasedTransform = (raw: string): PRReviewResult => {
  const transformations: [RegExp, string][] = [
    [/\bterrible\b/gi, 'could be improved'],
    [/\bawful\b/gi, 'needs attention'],
    [/\bwrong\b/gi, 'may need adjustment'],
    [/\bbad\b/gi, 'could be enhanced'],
    [/\bstupid\b/gi, 'unexpected'],
    [/\buseless\b/gi, 'not meeting expectations'],
    [/\bfix (?:this|it) now\b/gi, 'please address this when you get a chance'],
    [/\bwhy would anyone\b/gi, 'one consideration is that'],
    [/\bthis is (?:clearly )?wrong\b/gi, 'this may benefit from revision'],
    [/\bnever should have\b/gi, 'an alternative approach might be'],
    [/\bcan'?t believe\b/gi, "it's worth noting that"],
    [/\bhorrible\b/gi, 'challenging'],
    [/\bgarbage\b/gi, 'needs refinement'],
    [/\bjust\b(?=.*\bfix\b)/gi, ''],
    [/\b!{2,}/g, '.'],
  ];

  let polished = raw.trim();
  for (const [pattern, replacement] of transformations) {
    polished = polished.replace(pattern, replacement);
  }

  const sentences = polished
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const politePrefix = 'Thank you for your review feedback. ';
  if (sentences.length > 0) {
    polished = politePrefix + polished.charAt(0).toUpperCase() + polished.slice(1);
  }

  const keyChanges: string[] = [];
  if (politePrefix && raw !== polished) {
    keyChanges.push('Added polite opening');
  }
  if (sentences.length > 1) {
    keyChanges.push('Broke into clearer points');
  }
  if (!polished.endsWith('.') && !polished.endsWith('!')) {
    polished += '.';
  }

  return {
    polishedText: polished,
    toneAnalysis:
      'This review was softened using rule-based patterns. Connect AI for more nuanced rewrites.',
    keyChanges,
    isAiPowered: false,
  };
};

export const PRReviewCoachService = {
  async polishReview(input: PRReviewInput): Promise<PRReviewResult> {
    const raw = input.rawText.trim();
    if (!raw) {
      return {
        polishedText: '',
        toneAnalysis: 'No input provided.',
        keyChanges: [],
        isAiPowered: false,
      };
    }

    try {
      const response = await AIService.run(MOCK_EXAMPLES, 'rewriteText', {
        modeId: 'writing_reviewer',
        modeName: 'PR Review Coach',
        prompt: `Convert this harsh or unclear code review comment into a professional, polite, and constructive English review comment. Preserve the technical intent. Raw review: "${raw}"`,
      });

      const text = response.text.replace('AI REFINEMENT:\n', '').trim();

      return {
        polishedText: text,
        toneAnalysis:
          response.structuredResult?.toneFeedback ||
          'AI-powered tone analysis applied.',
        keyChanges: response.structuredResult?.strengths?.slice(0, 3) || [
          'Softened tone',
          'Added constructive framing',
          'Maintained technical intent',
        ],
        isAiPowered: true,
      };
    } catch {
      return ruleBasedTransform(raw);
    }
  },

  ruleBasedTransform,
};
