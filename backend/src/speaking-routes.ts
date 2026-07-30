import express from 'express';
import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ApiError } from './errors.js';
import { SpeakingSubmitBodySchema, validateBody } from './validation.js';

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

export const registerSpeakingRoutes = (app: Express, requireBackendAuth: RequestHandler): void => {
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
        response.json({ items: [], total: 0, limit, offset });
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
        response.json({
          success: true,
          id: 'mock-id',
          overallScore: 0,
          status: 'graded',
          submittedAt: new Date().toISOString(),
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
        response.json({ totalSubmissions: 0, averageScore: 0, byCategory: {} });
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
        response.json({ notFound: true });
      } catch (error) {
        next(error);
      }
    }
  );
};
