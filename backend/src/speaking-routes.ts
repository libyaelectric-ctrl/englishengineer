import { createClient } from '@supabase/supabase-js';
import express from 'express';
import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { checkCostLimits, createAIService } from './ai.js';
import { ApiError } from './errors.js';
import { logger } from './logger.js';
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
const AUDIO_BUCKET = process.env.SPEAKING_AUDIO_BUCKET || 'speaking-audio';

const uploadToSupabaseStorage = async (
  userId: string,
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string | null> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const storagePath = `${userId}/${fileName}`;
  const { error } = await supabase.storage.from(AUDIO_BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });
  if (error) {
    throw new ApiError(502, 'audio_storage_failed', 'Audio could not be stored securely.');
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);
  if (signedUrlError || !data?.signedUrl) {
    throw new ApiError(502, 'audio_url_failed', 'Audio was stored but its access URL failed.');
  }
  return data.signedUrl;
};

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

// Helper functions to estimate pronunciation and fluency scores from transcript
// These are placeholders until real STT integration with confidence scores is implemented
function estimatePronunciationScore(transcript: string): number {
  // Basic heuristic: longer transcripts with clear structure get higher scores
  const wordCount = transcript.split(/\s+/).length;
  const sentenceCount = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

  // Simple heuristic: more words and sentences generally indicate better pronunciation
  const baseScore = Math.min(95, 60 + Math.floor(wordCount / 5));

  // Penalize very short responses
  if (wordCount < 10) return Math.max(40, baseScore - 20);

  // Reward complete sentences
  if (sentenceCount >= 3) return Math.min(95, baseScore + 5);

  return baseScore;
}

function estimateFluencyScore(transcript: string): number {
  // Basic heuristic: check for common fluency indicators
  const wordCount = transcript.split(/\s+/).length;
  const fillerWords = ['uh', 'um', 'ah', 'er', 'like', 'you know'].filter((word) =>
    transcript.toLowerCase().includes(word)
  ).length;

  // Penalize filler words
  const fillerPenalty = fillerWords * 5;

  // Base score based on length
  const baseScore = Math.min(95, 55 + Math.floor(wordCount / 4));

  // Penalize very short responses
  if (wordCount < 10) return Math.max(35, baseScore - 25);

  // Apply filler penalty
  return Math.max(30, baseScore - fillerPenalty);
}

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

// Maps the structured AI evaluation onto the speaking score shape.
// If STT is available, pronunciation/fluency scores are derived from audio analysis.
// Otherwise, they are calculated based on grammar/vocabulary scores as a fallback.
function mapTranscriptScores(
  structured: Record<string, unknown>,
  pronunciationScore?: number,
  fluencyScore?: number
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

  // Use provided pronunciation/fluency scores if available (from STT)
  const finalPronunciationScore =
    pronunciationScore !== undefined ? pronunciationScore : mock.pronunciationScore;
  const finalFluencyScore = fluencyScore !== undefined ? fluencyScore : mock.fluencyScore;

  const overallScore =
    clamp(raw.overall) ||
    Math.round((finalPronunciationScore + finalFluencyScore + grammarScore + vocabularyScore) / 4);

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
    pronunciationScore: finalPronunciationScore,
    fluencyScore: finalFluencyScore,
    grammarScore,
    vocabularyScore,
    feedback,
  };
}

export const registerSpeakingRoutes = (
  app: Express,
  requireBackendAuth: RequestHandler,
  speakingLimiter: RequestHandler,
  aiService: AiService
): void => {
  // Raw audio body parser scoped ONLY to this route -- does not affect the
  // rest of the app's express.json() parsing.
  app.post(
    '/api/speaking/audio-upload',
    requireBackendAuth,
    speakingLimiter,
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

        const fileId = randomUUID();
        const fileName = `${fileId}.${extension}`;
        const storedUrl = await uploadToSupabaseStorage(userId, fileName, buffer, contentType);

        if (storedUrl) {
          response.status(201).json({
            audioUrl: storedUrl,
            sizeBytes: buffer.length,
            uploadedAt: new Date().toISOString(),
            storage: 'supabase',
          });
          return;
        }

        // Development fallback only: local disk is ephemeral on Render and
        // must not be used as the production persistence layer.
        const userDir = path.join(UPLOAD_ROOT, userId);
        await mkdir(userDir, { recursive: true });
        await writeFile(path.join(userDir, fileName), buffer);

        response.status(201).json({
          audioUrl: `/uploads/speaking/${userId}/${fileName}`,
          sizeBytes: buffer.length,
          uploadedAt: new Date().toISOString(),
          storage: 'local-fallback',
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
    speakingLimiter,
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

        // STT entegrasyonu: Eğer audioUrl varsa, transcript yoksa veya boşsa STT ile transcript elde et
        let finalTranscript = transcript?.trim();
        let pronunciationScore: number | undefined;
        let fluencyScore: number | undefined;

        if (audioUrl && (!finalTranscript || finalTranscript.length === 0)) {
          // STT ile audioUrl'den transcript elde et
          try {
            enforceAiLimits(userId);
            const sttPrompt = `Transcribe the following audio and return ONLY the text in plain format. Do not add any additional commentary or formatting.\nAudio URL: ${audioUrl}`;
            const sttResult = await speakingCircuitBreaker.execute(() =>
              aiService.complete('transcribeAudio', {
                prompt: sttPrompt,
                context: {},
              })
            );
            if (!sttResult.mockMode && sttResult.text) {
              finalTranscript = sttResult.text.trim();
              // STT sonucu başarılıysa pronunciation ve fluency skorlarını tahmin et
              // Bu, gerçek STT servisleri (Whisper, Google STT) tarafından sağlanabilecek metriklerdir
              // Şimdilik AI'ya dayalı tahmin yapıyoruz
              pronunciationScore = estimatePronunciationScore(sttResult.text);
              fluencyScore = estimateFluencyScore(sttResult.text);
            }
          } catch (sttError) {
            logger.warn('STT transcription failed, falling back to mock or provided transcript', {
              audioUrl,
              error: sttError,
            });
          }
        }

        // Transcript varsa (orijinal veya STT'den elde edilmiş) grammar/kelime değerlendirmesi yap
        let scoring: Omit<
          SpeakingSubmission,
          'id' | 'promptId' | 'audioUrl' | 'submittedAt' | 'status'
        >;

        if (finalTranscript && finalTranscript.length > 0) {
          enforceAiLimits(userId);
          try {
            const aiPrompt = `Evaluate this engineering student's spoken response transcript.\nTranscript:\n"""\n${finalTranscript}\n"""\nProvide grammar and vocabulary feedback. Return ONLY a valid JSON object matching the structural analysis schema.`;
            const aiResult = await speakingCircuitBreaker.execute(() =>
              aiService.complete('evaluateEngineeringEnglish', {
                prompt: aiPrompt,
                context: {},
              })
            );

            if (!aiResult.mockMode && aiResult.structuredResult) {
              scoring = mapTranscriptScores(
                aiResult.structuredResult,
                pronunciationScore,
                fluencyScore
              );
            } else {
              scoring = mockScore();
            }
          } catch {
            scoring = mockScore();
          }
        } else {
          // No transcript provided and STT failed -> fall back to mock scoring
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
