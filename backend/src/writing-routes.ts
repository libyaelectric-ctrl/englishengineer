import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';

import { ApiError } from './errors.js';
import { WritingSubmitBodySchema, validateBody } from './validation.js';

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

export const registerWritingRoutes = (app: Express, requireBackendAuth: RequestHandler): void => {
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

        const { promptId, content } = request.validatedBody as {
          promptId?: string;
          content?: string;
        };
        const evaluation = fallbackGrade(content ?? '');
        const submissionId = randomUUID();

        const submission: WritingSubmission = {
          id: submissionId,
          promptId: promptId ?? 'unknown',
          text: content ?? '',
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
