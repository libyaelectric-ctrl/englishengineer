import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { checkCostLimits, createAIService } from './ai.js';
import { apiSuccess } from './api-response.js';
import { ApiError } from './errors.js';
import { type WritingSubmissionRecord, getLearningRepository } from './learning-repository.js';
import type { RouteRegistrar } from './route-registrar.js';
import { CircuitBreaker } from './utils/circuit-breaker.js';
import { aggregateByPromptCategory, averageScore } from './utils/stats.js';
import { WritingSubmitBodySchema, parsePaginationQuery, validateBody } from './validation.js';

type AiService = ReturnType<typeof createAIService>;
interface WritingPrompt {
  id: string;
  title: string;
  category: string;
  level: string;
  prompt: string;
  wordLimit: number;
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
const breaker = new CircuitBreaker('WritingAI', 5, 30000);
const userIdFrom = (request: Request): string => {
  const userId = request.auth?.userId;
  if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');
  return userId;
};
const requiredScore = (value: unknown, name: string): number => {
  const score = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(score))
    throw new ApiError(502, 'invalid_writing_assessment', `AI assessment omitted ${name}.`);
  return Math.max(0, Math.min(100, Math.round(score)));
};
const mapAiScores = (
  structured: Record<string, unknown>
): Omit<
  WritingSubmissionRecord,
  'id' | 'userId' | 'promptId' | 'content' | 'submittedAt' | 'status'
> => {
  if (
    !structured.overallScore ||
    typeof structured.overallScore !== 'object' ||
    Array.isArray(structured.overallScore)
  )
    throw new ApiError(
      502,
      'invalid_writing_assessment',
      'AI assessment returned no score object.'
    );
  const raw = structured.overallScore as Record<string, unknown>;
  const score = requiredScore(raw.overall, 'overall');
  const tone = requiredScore(raw.tone, 'tone');
  const weaknesses = Array.isArray(structured.weaknesses)
    ? structured.weaknesses.filter((value): value is string => typeof value === 'string')
    : [];
  return {
    score,
    grammarScore: requiredScore(raw.grammar, 'grammar'),
    vocabularyScore: requiredScore(raw.vocabulary, 'vocabulary'),
    coherenceScore: requiredScore(raw.clarity, 'clarity'),
    structureScore: Math.round((tone + score) / 2),
    feedback: weaknesses.length ? { grammar: weaknesses.slice(0, 2).join(' ') } : {},
  };
};
export const registerWritingRoutes = (
  app: RouteRegistrar,
  requireBackendAuth: RequestHandler,
  writingLimiter: RequestHandler,
  aiService: AiService
): void => {
  app.get(
    '/api/writing/prompts',
    requireBackendAuth,
    (request: Request, response: Response, next: NextFunction) => {
      try {
        userIdFrom(request);
        const { limit, offset } = parsePaginationQuery(request.query as Record<string, unknown>);
        response.json({
          items: WRITING_PROMPTS.slice(offset, offset + limit),
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
    writingLimiter,
    validateBody(WritingSubmitBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = userIdFrom(request);
        checkCostLimits(userId);
        const { promptId, content = '' } = request.validatedBody as {
          promptId?: string;
          content?: string;
        };
        const prompt = WRITING_PROMPTS.find((candidate) => candidate.id === promptId);
        let evaluation: ReturnType<typeof mapAiScores>;
        try {
          const result = await breaker.execute(() =>
            aiService.complete('evaluateEngineeringEnglish', {
              prompt: `Evaluate this engineering student's written response.\n${prompt ? `Task: ${prompt.prompt}\n` : ''}Submission:\n${content}`,
              context: {},
            })
          );
          if (result.mockMode)
            throw new ApiError(
              503,
              'writing_assessment_unavailable',
              'Writing assessment requires a configured AI provider.'
            );
          if (!result.structuredResult)
            throw new ApiError(
              502,
              'invalid_writing_assessment',
              'AI provider returned no structured assessment.'
            );
          evaluation = mapAiScores(result.structuredResult);
        } catch (error) {
          if (error instanceof ApiError) throw error;
          throw new ApiError(
            503,
            'writing_assessment_unavailable',
            'Writing assessment is temporarily unavailable.'
          );
        }
        const submission = await getLearningRepository().createWritingSubmission({
          userId,
          promptId: promptId ?? 'unknown',
          content,
          ...evaluation,
          status: 'graded',
        });
        response.json(
          apiSuccess({
            id: submission.id,
            ...evaluation,
            status: submission.status,
            submittedAt: submission.submittedAt,
          })
        );
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
        const submissions = await getLearningRepository().listWritingSubmissions(
          userIdFrom(request)
        );
        response.json({
          totalSubmissions: submissions.length,
          averageScore: averageScore(submissions.map((submission) => submission.score)),
          byCategory: aggregateByPromptCategory(submissions, WRITING_PROMPTS, 'score'),
        });
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
        response.json(
          (await getLearningRepository().getWritingSubmission(
            userIdFrom(request),
            request.params.id as string
          )) ?? { notFound: true }
        );
      } catch (error) {
        next(error);
      }
    }
  );
};
