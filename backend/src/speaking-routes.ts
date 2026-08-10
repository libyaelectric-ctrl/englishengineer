import express from 'express';
import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { checkCostLimits, createAIService } from './ai.js';
import { ApiError } from './errors.js';
import { CircuitBreaker } from './utils/circuit-breaker.js';
import { SpeakingSubmitBodySchema, validateBody } from './validation.js';

type AiService = ReturnType<typeof createAIService>;

// Uploaded audio is stored under backend/uploads/speaking/<userId>/<uuid>.<ext>.
// This is a minimal, safe local-disk implementation (Kademe 5.2). Moving this
// to real object storage (S3/Supabase Storage) is a deliberate follow-up
// decision, not something to fake here -- local disk is fine for getting a
// working, testable upload -> playback loop today.
const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads', 'speaking');

const ALLOWED_AUDIO_TYPES: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
};

const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15MB, generous for a few minutes of speech

interface SpeakingPrompt {
  id: string;
  title: string;
  category: string;
  level: string;
  prompt: string;
  durationHint: string;
}

interface SpeakingSubmission {
  id: string;
  promptId: string;
  audioUrl: string;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  feedback: Record<string, string>;
  status: 'graded';
  submittedAt: string;
}

const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  {
    id: 'sp-001',
    title: 'Describe a Project You Worked On',
    category: 'professional',
    level: 'B1',
    prompt:
      'Describe a recent engineering project you were involved in. Explain your role, the challenges you faced, and the outcome.',
    durationHint: '2-3 minutes',
  },
  {
    id: 'sp-002',
    title: 'Explain a Technical Concept',
    category: 'technical',
    level: 'B2',
    prompt:
      'Explain the concept of torque to a non-engineer. Use everyday examples to make your explanation clear.',
    durationHint: '2-3 minutes',
  },
  {
    id: 'sp-003',
    title: 'Report a Workplace Issue',
    category: 'professional',
    level: 'B1',
    prompt:
      'You have noticed a safety hazard in your workplace. Describe the issue and explain what steps should be taken to address it.',
    durationHint: '1-2 minutes',
  },
  {
    id: 'sp-004',
    title: 'Present a Design Proposal',
    category: 'technical',
    level: 'C1',
    prompt:
      'Present a brief proposal for redesigning a common household tool to improve its usability. Describe the current problems and your solution.',
    durationHint: '3-4 minutes',
  },
  {
    id: 'sp-005',
    title: 'Discuss Sustainable Practices',
    category: 'professional',
    level: 'B2',
    prompt:
      'Discuss how engineers can incorporate sustainable practices into their daily work. Provide specific examples from your field.',
    durationHint: '2-3 minutes',
  },
  {
    id: 'sp-006',
    title: 'Troubleshooting Scenario',
    category: 'technical',
    level: 'B1',
    prompt:
      'A hydraulic pump in your system is making unusual noises and not maintaining pressure. Walk through your troubleshooting steps.',
    durationHint: '2-3 minutes',
  },
  {
    id: 'sp-007',
    title: 'Team Meeting Discussion',
    category: 'professional',
    level: 'B2',
    prompt:
      'You are leading a project status meeting. Summarize the current progress, highlight two risks, and propose mitigation strategies.',
    durationHint: '3-4 minutes',
  },
  {
    id: 'sp-008',
    title: 'Explain a Reading or Lecture',
    category: 'technical',
    level: 'C1',
    prompt:
      'Summarize the key findings from a recent technical paper or lecture you attended. Explain why these findings are significant for your field.',
    durationHint: '3-4 minutes',
  },
];

// Per-user submission store
const submissionStore = new Map<string, SpeakingSubmission[]>();

const speakingCircuitBreaker = new CircuitBreaker('SpeakingAI', 5, 30000);

const enforceAiLimits = (userId: string): void => {
  checkCostLimits(userId);
};

function getUserSubmissions(userId: string): SpeakingSubmission[] {
  if (!submissionStore.has(userId)) {
    submissionStore.set(userId, []);
  }
  return submissionStore.get(userId)!;
}

function mockScore(): Omit<
  SpeakingSubmission,
  'id' | 'promptId' | 'audioUrl' | 'submittedAt' | 'status'
> {
  const pronunciationScore = 65 + Math.floor(Math.random() * 30);
  const fluencyScore = 60 + Math.floor(Math.random() * 35);
  const grammarScore = 62 + Math.floor(Math.random() * 33);
  const vocabularyScore = 64 + Math.floor(Math.random() * 31);
  const overallScore = Math.round(
    (pronunciationScore + fluencyScore + grammarScore + vocabularyScore) / 4
  );

  const feedback: Record<string, string> = {};
  if (pronunciationScore < 75) feedback.pronunciation = 'Focus on clearer consonant sounds.';
  if (fluencyScore < 75) feedback.fluency = 'Try to reduce pauses between sentences.';
  if (grammarScore < 75) feedback.grammar = 'Watch your verb tense consistency.';
  if (vocabularyScore < 75) feedback.vocabulary = 'Incorporate more domain-specific terminology.';
  if (overallScore >= 85) feedback.overall = 'Great performance! Keep refining your delivery.';

  return {
    overallScore,
    pronunciationScore,
    fluencyScore,
    grammarScore,
    vocabularyScore,
    feedback,
  };
}

// Maps the structured AI evaluation onto the speaking score shape. Since no
// speech audio is analysed here, pronunciation/fluency stay on the mock
// heuristic until STT is added (TODO above).
function mapTranscriptScores(
  structured: Record<string, unknown>
): Omit<SpeakingSubmission, 'id' | 'promptId' | 'audioUrl' | 'submittedAt' | 'status'> {
  const mock = mockScore();
  const raw = (structured.overallScore ?? {}) as Record<string, unknown>;
  const clamp = (v: unknown): number => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  };
  const grammarScore = clamp(raw.grammar) || mock.grammarScore;
  const vocabularyScore = clamp(raw.vocabulary) || mock.vocabularyScore;
  const overallScore =
    clamp(raw.overall) ||
    Math.round((mock.pronunciationScore + mock.fluencyScore + grammarScore + vocabularyScore) / 4);

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
  if (corrections.length > 0 && !feedback.grammar) {
    feedback.vocabulary = `Suggested correction: ${(corrections[0] as { original: unknown }).original}`;
  }
  if (overallScore >= 85) feedback.overall = 'Great performance! Keep refining your delivery.';

  return {
    overallScore,
    pronunciationScore: mock.pronunciationScore,
    fluencyScore: mock.fluencyScore,
    grammarScore,
    vocabularyScore,
    feedback,
  };
}

export const registerSpeakingRoutes = (
  app: Express,
  requireBackendAuth: RequestHandler,
  aiService: AiService
): void => {
  // Raw audio body parser scoped ONLY to this route -- does not affect the
  // rest of the app's express.json() parsing.
  app.post(
    '/api/speaking/audio-upload',
    requireBackendAuth,
    express.raw({ type: Object.keys(ALLOWED_AUDIO_TYPES), limit: '15mb' }),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) {
          throw new ApiError(401, 'authentication_required', 'Auth required');
        }

        const contentType = request.headers['content-type'] ?? '';
        const extension = ALLOWED_AUDIO_TYPES[contentType];
        if (!extension) {
          throw new ApiError(
            415,
            'unsupported_media_type',
            `Unsupported audio content-type: ${contentType}`
          );
        }

        const buffer = request.body as Buffer;
        if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
          throw new ApiError(400, 'empty_audio', 'No audio data received');
        }
        if (buffer.length > MAX_AUDIO_BYTES) {
          throw new ApiError(413, 'audio_too_large', `Audio exceeds ${MAX_AUDIO_BYTES} byte limit`);
        }

        // userId is our own auth-derived value, never taken from a path/query
        // param, so this directory segment is safe from traversal.
        const userDir = path.join(UPLOAD_ROOT, userId);
        await mkdir(userDir, { recursive: true });

        const fileId = randomUUID();
        const fileName = `${fileId}.${extension}`;
        await writeFile(path.join(userDir, fileName), buffer);

        response.status(201).json({
          audioUrl: `/uploads/speaking/${userId}/${fileName}`,
          sizeBytes: buffer.length,
          uploadedAt: new Date().toISOString(),
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/speaking/prompts',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');
        const limit = Number(request.query.limit) || 10;
        const offset = Number(request.query.offset) || 0;

        const paginated = SPEAKING_PROMPTS.slice(offset, offset + limit);

        response.json({ items: paginated, total: SPEAKING_PROMPTS.length, limit, offset });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/speaking/submit',
    requireBackendAuth,
    validateBody(SpeakingSubmitBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const { missionId, audioUrl, transcript } = request.validatedBody as {
          missionId?: string;
          audioUrl?: string;
          transcript?: string;
        };

        // TODO: STT entegrasyonu eklenene kadar pronunciation/fluency mock kalır.
        // Transcript varsa gramer/kelime değerlendirmesi AI ile yapılır; transcript
        // yoksa frontend transcript göndermezse eski mock skorlama devam eder.
        let scoring: Omit<
          SpeakingSubmission,
          'id' | 'promptId' | 'audioUrl' | 'submittedAt' | 'status'
        >;

        if (transcript && transcript.trim().length > 0) {
          enforceAiLimits(userId);
          try {
            const aiPrompt = `Evaluate this engineering student's spoken response transcript.\nTranscript:\n"""\n${transcript}\n"""\nProvide grammar and vocabulary feedback. Return ONLY a valid JSON object matching the structural analysis schema.`;
            const aiResult = await speakingCircuitBreaker.execute(() =>
              aiService.complete('evaluateEngineeringEnglish', {
                prompt: aiPrompt,
                context: {},
              })
            );

            if (!aiResult.mockMode && aiResult.structuredResult) {
              scoring = mapTranscriptScores(aiResult.structuredResult);
            } else {
              scoring = mockScore();
            }
          } catch {
            scoring = mockScore();
          }
        } else {
          // No transcript provided -> fall back to the original mock scoring.
          scoring = mockScore();
        }

        const submissionId = randomUUID();

        const submission: SpeakingSubmission = {
          id: submissionId,
          promptId: missionId ?? 'unknown',
          audioUrl: audioUrl ?? '',
          overallScore: scoring.overallScore,
          pronunciationScore: scoring.pronunciationScore,
          fluencyScore: scoring.fluencyScore,
          grammarScore: scoring.grammarScore,
          vocabularyScore: scoring.vocabularyScore,
          feedback: scoring.feedback,
          status: 'graded',
          submittedAt: new Date().toISOString(),
        };

        getUserSubmissions(userId).push(submission);

        response.json({
          success: true,
          id: submissionId,
          overallScore: scoring.overallScore,
          feedback: scoring.feedback,
          status: 'graded' as const,
          submittedAt: submission.submittedAt,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/speaking/stats',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const subs = getUserSubmissions(userId);
        const totalSubmissions = subs.length;
        const averageScore =
          totalSubmissions > 0
            ? Math.round(
                (subs.reduce((s, sub) => s + sub.overallScore, 0) / totalSubmissions) * 10
              ) / 10
            : 0;

        const byCategory: Record<string, { count: number; avgScore: number }> = {};
        const catMap = new Map<string, number[]>();
        for (const sub of subs) {
          const prompt = SPEAKING_PROMPTS.find((p) => p.id === sub.promptId);
          const cat = prompt?.category ?? 'general';
          if (!catMap.has(cat)) catMap.set(cat, []);
          catMap.get(cat)!.push(sub.overallScore);
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
    '/api/speaking/:id',
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
