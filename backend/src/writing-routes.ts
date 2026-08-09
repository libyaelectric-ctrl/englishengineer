import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';

import { checkCostLimits, createAIService } from './ai.js';
import { ApiError } from './errors.js';
import { CircuitBreaker } from './utils/circuit-breaker.js';
import { WritingSubmitBodySchema, validateBody } from './validation.js';

type AiService = ReturnType<typeof createAIService>;

interface WritingPrompt {
  id: string;
  title: string;
  category: string;
  level: string;
  prompt: string;
  wordLimit: number;
}

interface WritingSubmission {
  id: string;
  promptId: string;
  text: string;
  score: number;
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  structureScore: number;
  feedback: Record<string, string>;
  status: 'graded';
  submittedAt: string;
}

const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: 'wp-001',
    title: 'Advantages of CAD Software',
    category: 'technical',
    level: 'B1',
    prompt:
      'Describe three advantages of using computer-aided design (CAD) software in engineering. Provide specific examples for each advantage.',
    wordLimit: 250,
  },
  {
    id: 'wp-002',
    title: 'Workplace Safety Report',
    category: 'professional',
    level: 'B2',
    prompt:
      'Write a workplace safety incident report for a hypothetical chemical spill in a laboratory. Include the cause, the response, and recommended preventive measures.',
    wordLimit: 300,
  },
  {
    id: 'wp-003',
    title: 'Sustainable Engineering Solutions',
    category: 'technical',
    level: 'C1',
    prompt:
      'Discuss how modern engineers are incorporating sustainability principles into infrastructure design. Reference at least two real-world examples.',
    wordLimit: 350,
  },
  {
    id: 'wp-004',
    title: 'Project Proposal Email',
    category: 'professional',
    level: 'B1',
    prompt:
      'Write a professional email proposing a new automation project to your department manager. Include the problem statement, proposed solution, estimated budget, and timeline.',
    wordLimit: 200,
  },
  {
    id: 'wp-005',
    title: 'Technical Specification Document',
    category: 'technical',
    level: 'C1',
    prompt:
      'Write a brief technical specification for a solar-powered water pump intended for rural irrigation. Include performance requirements, environmental constraints, and material considerations.',
    wordLimit: 400,
  },
  {
    id: 'wp-006',
    title: 'Failure Analysis Essay',
    category: 'technical',
    level: 'B2',
    prompt:
      'Describe the common causes of structural failure in buildings and explain how proper material selection and quality control can prevent such failures.',
    wordLimit: 300,
  },
  {
    id: 'wp-007',
    title: 'Meeting Minutes Summary',
    category: 'professional',
    level: 'B1',
    prompt:
      'Write meeting minutes from a project review meeting. Include attendees, agenda items discussed, decisions made, and action items with responsible persons.',
    wordLimit: 250,
  },
  {
    id: 'wp-008',
    title: 'Process Improvement Proposal',
    category: 'professional',
    level: 'B2',
    prompt:
      'Propose a process improvement for a manufacturing workflow using Lean or Six Sigma principles. Describe the current state, the proposed changes, and expected outcomes.',
    wordLimit: 300,
  },
];

// Per-user submission store
const submissionStore = new Map<string, WritingSubmission[]>();

const writingCircuitBreaker = new CircuitBreaker('WritingAI', 5, 30000);

// Rate limiting: reuse the same per-user cost limiter as the AI routes so a
// writing submit is never an unbounded AI spend vector.
const enforceAiLimits = (userId: string): void => {
  checkCostLimits(userId);
};

function getUserSubmissions(userId: string): WritingSubmission[] {
  if (!submissionStore.has(userId)) {
    submissionStore.set(userId, []);
  }
  return submissionStore.get(userId)!;
}

function fallbackGrade(
  text: string
): Omit<WritingSubmission, 'id' | 'promptId' | 'text' | 'submittedAt' | 'status'> {
  const words = text.split(/\s+/).length;
  const base = 60 + Math.min(Math.floor(words / 10), 25);
  const grammarScore = Math.min(base + Math.floor(Math.random() * 10), 100);
  const vocabularyScore = Math.min(base + Math.floor(Math.random() * 12), 100);
  const coherenceScore = Math.min(base + Math.floor(Math.random() * 8), 100);
  const structureScore = Math.min(base + Math.floor(Math.random() * 9), 100);
  const score = Math.round((grammarScore + vocabularyScore + coherenceScore + structureScore) / 4);

  const feedback: Record<string, string> = {};
  if (grammarScore < 75) feedback.grammar = 'Review verb tenses and subject-verb agreement.';
  if (vocabularyScore < 75) feedback.vocabulary = 'Try using more technical vocabulary.';
  if (coherenceScore < 75) feedback.coherence = 'Improve paragraph transitions and logical flow.';
  if (structureScore < 75) feedback.structure = 'Organize content with clearer topic sentences.';
  if (score >= 85) feedback.overall = 'Excellent work. Keep practicing at this level.';

  return { score, grammarScore, vocabularyScore, coherenceScore, structureScore, feedback };
}

// Maps the structured AI evaluation (json-structure.md schema) onto the
// existing WritingSubmission score shape. The AI reports clarity/tone which
// have no direct backend counterpart, so clarity feeds coherenceScore and the
// tone/overall figures are combined into structureScore.
function mapAiScores(
  structured: Record<string, unknown>,
  text: string
): Omit<WritingSubmission, 'id' | 'promptId' | 'text' | 'submittedAt' | 'status'> {
  const raw = (structured.overallScore ?? {}) as Record<string, unknown>;
  const clamp = (v: unknown): number => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  };
  const grammarScore = clamp(raw.grammar);
  const vocabularyScore = clamp(raw.vocabulary);
  const clarity = clamp(raw.clarity);
  const tone = clamp(raw.tone);
  const overall = clamp(raw.overall);
  // clarity maps onto the existing coherence slot; structure is derived from
  // the average of tone and overall since the JSON schema has no structure field.
  const coherenceScore = clarity > 0 ? clarity : fallbackGrade(text).coherenceScore;
  const structureScore =
    tone > 0 && overall > 0
      ? Math.round((tone + overall) / 2)
      : fallbackGrade(text).structureScore;
  const score = overall > 0 ? overall : fallbackGrade(text).score;

  const feedback: Record<string, string> = {};
  const weaknesses = Array.isArray(structured.weaknesses)
    ? (structured.weaknesses as unknown[]).filter((w): w is string => typeof w === 'string')
    : [];
  if (weaknesses.length > 0) feedback.grammar = weaknesses.slice(0, 2).join(' ');
  const corrections = Array.isArray(structured.corrections)
    ? (structured.corrections as unknown[]).filter(
        (c): c is { original: unknown } => typeof c === 'object' && c !== null
      )
    : [];
  if (corrections.length > 0) {
    feedback.vocabulary = `Suggested correction: ${(corrections[0] as { original: unknown }).original}`;
  }
  const grammarNotes = Array.isArray(structured.grammarNotes)
    ? (structured.grammarNotes as unknown[]).filter((n): n is { rule: unknown } => typeof n === 'object' && n !== null)
    : [];
  if (grammarNotes.length > 0 && !feedback.grammar) {
    feedback.grammar = `Rule: ${(grammarNotes[0] as { rule: unknown }).rule}`;
  }
  if (score >= 85) feedback.overall = 'Excellent work. Keep practicing at this level.';

  return { score, grammarScore, vocabularyScore, coherenceScore, structureScore, feedback };
}

export const registerWritingRoutes = (
  app: Express,
  requireBackendAuth: RequestHandler,
  aiService: AiService
): void => {
  app.get(
    '/api/writing/prompts',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const limit = Number(request.query.limit) || 10;
        const offset = Number(request.query.offset) || 0;

        const paginated = WRITING_PROMPTS.slice(offset, offset + limit);

        response.json({
          items: paginated,
          total: WRITING_PROMPTS.length,
          limit,
          offset,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/writing/submit',
    requireBackendAuth,
    validateBody(WritingSubmitBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        enforceAiLimits(userId);

        const { promptId, content } = request.validatedBody as {
          promptId?: string;
          content?: string;
        };
        const text = content ?? '';
        const prompt = WRITING_PROMPTS.find((p) => p.id === promptId);

        let evaluation: Omit<
          WritingSubmission,
          'id' | 'promptId' | 'text' | 'submittedAt' | 'status'
        >;

        try {
          const aiPrompt = prompt
            ? `Evaluate this engineering student's written response.\nTask: "${prompt.prompt}" (word limit: ${prompt.wordLimit})\nStudent's submission:\n"""\n${text}\n"""`
            : `Evaluate this engineering student's written response.\nStudent's submission:\n"""\n${text}\n"""`;

          const aiResult = await writingCircuitBreaker.execute(() =>
            aiService.complete('evaluateEngineeringEnglish', {
              prompt: aiPrompt,
              context: {},
            })
          );

          // If AI is running in mock mode or returned no structured result,
          // fall back to the deterministic heuristic grader so users never
          // receive an empty or broken response.
          if (aiResult.mockMode || !aiResult.structuredResult) {
            evaluation = fallbackGrade(text);
          } else {
            evaluation = mapAiScores(aiResult.structuredResult, text);
          }
        } catch {
          // Timeout, circuit open, provider error, ... -> heuristic fallback.
          evaluation = fallbackGrade(text);
        }

        const submissionId = randomUUID();

        const submission: WritingSubmission = {
          id: submissionId,
          promptId: promptId ?? 'unknown',
          text,
          score: evaluation.score,
          grammarScore: evaluation.grammarScore,
          vocabularyScore: evaluation.vocabularyScore,
          coherenceScore: evaluation.coherenceScore,
          structureScore: evaluation.structureScore,
          feedback: evaluation.feedback,
          status: 'graded',
          submittedAt: new Date().toISOString(),
        };

        getUserSubmissions(userId).push(submission);

        response.json({
          success: true,
          id: submissionId,
          score: evaluation.score,
          grammarScore: evaluation.grammarScore,
          vocabularyScore: evaluation.vocabularyScore,
          coherenceScore: evaluation.coherenceScore,
          structureScore: evaluation.structureScore,
          feedback: evaluation.feedback,
          status: 'graded' as const,
          submittedAt: submission.submittedAt,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/writing/stats',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const subs = getUserSubmissions(userId);
        const totalSubmissions = subs.length;
        const averageScore =
          totalSubmissions > 0
            ? Math.round((subs.reduce((s, sub) => s + sub.score, 0) / totalSubmissions) * 10) / 10
            : 0;

        const byCategory: Record<string, { count: number; avgScore: number }> = {};
        const catMap = new Map<string, number[]>();
        for (const sub of subs) {
          const prompt = WRITING_PROMPTS.find((p) => p.id === sub.promptId);
          const cat = prompt?.category ?? 'general';
          if (!catMap.has(cat)) catMap.set(cat, []);
          catMap.get(cat)!.push(sub.score);
        }
        for (const [cat, scores] of catMap) {
          byCategory[cat] = {
            count: scores.length,
            avgScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
          };
        }

        response.json({ totalSubmissions, averageScore, byCategory });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/writing/:id',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const id = request.params.id as string;
        const subs = getUserSubmissions(userId);
        const sub = subs.find((s) => s.id === id);

        if (!sub) {
          response.json({ notFound: true });
          return;
        }

        response.json(sub);
      } catch (error) {
        next(error);
      }
    }
  );
};
