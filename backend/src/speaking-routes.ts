import { createClient } from '@supabase/supabase-js';
import express from 'express';
import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createAIService } from './ai.js';
import { ApiError } from './errors.js';
import { getLearningRepository } from './learning-repository.js';
import { SpeakingSubmitBodySchema, validateBody } from './validation.js';
type AiService = ReturnType<typeof createAIService>;
const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads', 'speaking');
const AUDIO_TYPES: Record<string, string> = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a' };
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const AUDIO_BUCKET = process.env.SPEAKING_AUDIO_BUCKET || 'speaking-audio';
const uploadToSupabase = async (userId: string, fileName: string, buffer: Buffer, contentType: string): Promise<string | null> => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const storagePath = `${userId}/${fileName}`;
  const { error } = await client.storage.from(AUDIO_BUCKET).upload(storagePath, buffer, { contentType, upsert: false });
  if (error) throw new ApiError(502, 'audio_storage_failed', 'Audio could not be stored securely.');
  const { data, error: signedError } = await client.storage.from(AUDIO_BUCKET).createSignedUrl(storagePath, 3600);
  if (signedError || !data?.signedUrl) throw new ApiError(502, 'audio_url_failed', 'Audio was stored but its access URL failed.');
  return data.signedUrl;
};
interface SpeakingPrompt { id: string; title: string; category: string; level: string; prompt: string; durationHint: string; }
const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  { id: 'sp-001', title: 'Describe a Project You Worked On', category: 'professional', level: 'B1', prompt: 'Describe a recent engineering project you were involved in. Explain your role, the challenges you faced, and the outcome.', durationHint: '2-3 minutes' },
  { id: 'sp-002', title: 'Explain a Technical Concept', category: 'technical', level: 'B2', prompt: 'Explain the concept of torque to a non-engineer. Use everyday examples to make your explanation clear.', durationHint: '2-3 minutes' },
  { id: 'sp-003', title: 'Report a Workplace Issue', category: 'professional', level: 'B1', prompt: 'You have noticed a safety hazard in your workplace. Describe the issue and explain what steps should be taken to address it.', durationHint: '1-2 minutes' },
  { id: 'sp-004', title: 'Present a Design Proposal', category: 'technical', level: 'C1', prompt: 'Present a brief proposal for redesigning a common household tool to improve its usability. Describe the current problems and your solution.', durationHint: '3-4 minutes' },
  { id: 'sp-005', title: 'Discuss Sustainable Practices', category: 'professional', level: 'B2', prompt: 'Discuss how engineers can incorporate sustainable practices into their daily work. Provide specific examples from your field.', durationHint: '2-3 minutes' },
  { id: 'sp-006', title: 'Troubleshooting Scenario', category: 'technical', level: 'B1', prompt: 'A hydraulic pump in your system is making unusual noises and not maintaining pressure. Walk through your troubleshooting steps.', durationHint: '2-3 minutes' },
  { id: 'sp-007', title: 'Team Meeting Discussion', category: 'professional', level: 'B2', prompt: 'You are leading a project status meeting. Summarize the current progress, highlight two risks, and propose mitigation strategies.', durationHint: '3-4 minutes' },
  { id: 'sp-008', title: 'Explain a Reading or Lecture', category: 'technical', level: 'C1', prompt: 'Summarize the key findings from a recent technical paper or lecture you attended. Explain why these findings are significant for your field.', durationHint: '3-4 minutes' },
];
const userIdFrom = (request: Request): string => { const userId = request.auth?.userId; if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required'); return userId; };
export const registerSpeakingRoutes = (app: Express, requireBackendAuth: RequestHandler, speakingLimiter: RequestHandler, _aiService: AiService): void => {
  app.post('/api/speaking/audio-upload', requireBackendAuth, speakingLimiter, express.raw({ type: Object.keys(AUDIO_TYPES), limit: '15mb' }), async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userId = userIdFrom(request);
      const contentType = request.headers['content-type'] ?? '';
      const extension = AUDIO_TYPES[contentType];
      if (!extension) throw new ApiError(415, 'unsupported_media_type', `Unsupported audio content-type: ${contentType}`);
      const buffer = request.body as Buffer;
      if (!Buffer.isBuffer(buffer) || buffer.length === 0) throw new ApiError(400, 'empty_audio', 'No audio data received');
      if (buffer.length > MAX_AUDIO_BYTES) throw new ApiError(413, 'audio_too_large', `Audio exceeds ${MAX_AUDIO_BYTES} byte limit`);
      const fileName = `${randomUUID()}.${extension}`;
      const stored = await uploadToSupabase(userId, fileName, buffer, contentType);
      if (stored) { response.status(201).json({ audioUrl: stored, sizeBytes: buffer.length, uploadedAt: new Date().toISOString(), storage: 'supabase' }); return; }
      const directory = path.resolve(UPLOAD_ROOT, userId);
      if (directory !== UPLOAD_ROOT && !directory.startsWith(UPLOAD_ROOT + path.sep)) throw new ApiError(400, 'invalid_authenticated_user', 'Invalid user identifier.');
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, fileName), buffer);
      response.status(201).json({ audioUrl: `/uploads/speaking/${userId}/${fileName}`, sizeBytes: buffer.length, uploadedAt: new Date().toISOString(), storage: 'local-fallback' });
    } catch (error) { next(error); }
  });
  app.get('/api/speaking/prompts', requireBackendAuth, (request: Request, response: Response, next: NextFunction) => { try { userIdFrom(request); const limit = Math.min(Math.max(Number(request.query.limit) || 10, 1), 100); const offset = Math.max(Number(request.query.offset) || 0, 0); response.json({ items: SPEAKING_PROMPTS.slice(offset, offset + limit), total: SPEAKING_PROMPTS.length, limit, offset }); } catch (error) { next(error); } });
  app.post('/api/speaking/submit', requireBackendAuth, speakingLimiter, validateBody(SpeakingSubmitBodySchema), async (request: Request, response: Response, next: NextFunction) => { try { const userId = userIdFrom(request); const { missionId, audioUrl = '', transcript = '' } = request.validatedBody as { missionId?: string; audioUrl?: string; transcript?: string }; const submission = await getLearningRepository().createSpeakingSubmission({ userId, promptId: missionId ?? 'unknown', audioUrl, transcript: transcript.trim(), pronunciationScore: null, fluencyScore: null, grammarScore: null, vocabularyScore: null, overallScore: null, feedback: {}, status: 'not_graded', reason: 'speech_assessment_pipeline_not_configured' }); response.status(202).json({ success: true, id: submission.id, status: submission.status, reason: submission.reason, submittedAt: submission.submittedAt }); } catch (error) { next(error); } });
  app.get('/api/speaking/stats', requireBackendAuth, async (request: Request, response: Response, next: NextFunction) => { try { const submissions = await getLearningRepository().listSpeakingSubmissions(userIdFrom(request)); const graded = submissions.filter((submission) => submission.status === 'graded' && submission.overallScore !== null); const averageScore = graded.length ? Math.round(graded.reduce((sum, submission) => sum + submission.overallScore!, 0) / graded.length) : null; response.json({ totalSubmissions: submissions.length, gradedSubmissions: graded.length, averageScore, byCategory: {}, status: graded.length ? 'configured' : 'not_configured' }); } catch (error) { next(error); } });
  app.get('/api/speaking/:id', requireBackendAuth, async (request: Request, response: Response, next: NextFunction) => { try { response.json((await getLearningRepository().getSpeakingSubmission(userIdFrom(request), request.params.id as string)) ?? { notFound: true }); } catch (error) { next(error); } });
};
