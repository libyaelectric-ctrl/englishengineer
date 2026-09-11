import { createClient } from '@supabase/supabase-js';
import express from 'express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { RuntimeEnvironment } from '../types.js';
import { createAIService } from './ai.js';
import { apiSuccess } from './api-response.js';
import { ApiError } from './errors.js';
import { getLearningRepository } from './learning-repository.js';
import type { RouteRegistrar } from './route-registrar.js';
import { SpeakingSubmitBodySchema, parsePaginationQuery, validateBody } from './validation.js';

type AiService = ReturnType<typeof createAIService>;
type SupportedAudioType = 'audio/webm' | 'audio/ogg' | 'audio/wav' | 'audio/mpeg' | 'audio/mp4';
type SupportedAudioExtension = 'webm' | 'ogg' | 'wav' | 'mp3' | 'm4a';
type AtomSearchResult = { found: boolean; offset: number };

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads', 'speaking');
const SUPPORTED_AUDIO_TYPES: readonly SupportedAudioType[] = [
  'audio/webm',
  'audio/ogg',
  'audio/wav',
  'audio/mpeg',
  'audio/mp4',
] as const;
const AUDIO_EXTENSIONS: Readonly<Record<SupportedAudioType, SupportedAudioExtension>> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
};
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const MAX_DURATION_SECONDS = 300;
const AUDIO_BUCKET = process.env.SPEAKING_AUDIO_BUCKET || 'speaking-audio';
const SAFE_STORAGE_SEGMENT = /^[A-Za-z0-9_-]{1,128}$/;

const routeParam = (request: Request, name: string): string => {
  const value = request.params[name];
  if (Array.isArray(value) || typeof value !== 'string' || value.length === 0) {
    throw new ApiError(400, 'invalid_route_parameter', 'Invalid route parameter.');
  }
  return value;
};

const isSupportedAudioType = (value: string): value is SupportedAudioType =>
  SUPPORTED_AUDIO_TYPES.some((supportedType) => supportedType === value);

const normalizeAudioContentType = (request: Request): SupportedAudioType | null => {
  const rawHeader = request.get('content-type');
  if (typeof rawHeader !== 'string') return null;
  const [mimeType = ''] = rawHeader.split(';', 1);
  const normalized = mimeType.trim().toLowerCase();
  return isSupportedAudioType(normalized) ? normalized : null;
};

const hasExpectedAudioSignature = (buffer: Buffer, contentType: SupportedAudioType): boolean => {
  if (contentType === 'audio/wav') {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WAVE'
    );
  }
  if (contentType === 'audio/ogg') {
    return buffer.length >= 4 && buffer.subarray(0, 4).toString('ascii') === 'OggS';
  }
  if (contentType === 'audio/webm') {
    return (
      buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))
    );
  }
  if (contentType === 'audio/mpeg') {
    return (
      buffer.length >= 3 &&
      (buffer.subarray(0, 3).toString('ascii') === 'ID3' ||
        (buffer[0] === 0xff && (buffer[1]! & 0xe0) === 0xe0))
    );
  }
  return buffer.length >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp';
};

const parseWavDuration = (buffer: Buffer): number | null => {
  if (buffer.length < 44) return null;
  const channels = buffer.readUInt16LE(22);
  const sampleRate = buffer.readUInt32LE(24);
  const bitsPerSample = buffer.readUInt16LE(34);
  if (sampleRate === 0 || channels === 0 || bitsPerSample === 0) return null;
  let dataChunkSize = 0;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.subarray(offset, offset + 4).toString('ascii');
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const nextOffset = offset + 8 + chunkSize;
    if (!Number.isSafeInteger(nextOffset) || nextOffset > buffer.length + 1) return null;
    if (chunkId === 'data') {
      dataChunkSize = chunkSize;
      break;
    }
    offset = nextOffset;
  }
  if (dataChunkSize === 0) dataChunkSize = buffer.length - 44;
  const bytesPerSample = (channels * bitsPerSample) / 8;
  if (bytesPerSample === 0) return null;
  return dataChunkSize / (sampleRate * bytesPerSample);
};

const skipId3Header = (buffer: Buffer): number | null => {
  if (buffer.length < 3 || buffer.subarray(0, 3).toString('ascii') !== 'ID3') return 0;
  if (buffer.length < 10) return null;
  const size =
    ((buffer[6]! & 0x7f) << 21) |
    ((buffer[7]! & 0x7f) << 14) |
    ((buffer[8]! & 0x7f) << 7) |
    (buffer[9]! & 0x7f);
  const id3End = 10 + size;
  if (!Number.isSafeInteger(id3End) || id3End > buffer.length) return null;
  return id3End;
};

const parseMp3Duration = (buffer: Buffer): number | null => {
  const BITRATES = [
    [0, 0],
    [32, 32],
    [40, 40],
    [48, 48],
    [56, 56],
    [64, 64],
    [80, 80],
    [96, 96],
    [112, 112],
    [128, 128],
    [160, 160],
    [192, 192],
    [224, 224],
    [256, 256],
    [320, 320],
    [0, 0],
  ];
  const offsetOrNull = skipId3Header(buffer);
  if (offsetOrNull === null) return null;
  let offset = offsetOrNull;
  let bitrateSum = 0;
  let frameCount = 0;
  const audioStart = offset;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] === 0xff && (buffer[offset + 1]! & 0xe0) === 0xe0) {
      const versionBits = (buffer[offset + 1]! >> 3) & 0x03;
      const layerBits = (buffer[offset + 1]! >> 1) & 0x03;
      const bitrateIdx = (buffer[offset + 2]! >> 4) & 0x0f;
      if (layerBits === 0 || bitrateIdx === 0 || bitrateIdx === 15) {
        offset += 1;
        continue;
      }
      const mpegVersion = versionBits === 3 ? 0 : 1;
      const bitrate = BITRATES[bitrateIdx]?.[mpegVersion] ?? 0;
      if (bitrate > 0) {
        bitrateSum += bitrate;
        frameCount += 1;
      }
      offset += 4;
    } else {
      offset += 1;
    }
  }
  if (frameCount === 0 || bitrateSum === 0) return null;
  const avgBitrateKbps = bitrateSum / frameCount;
  const totalBits = (buffer.length - audioStart) * 8;
  return totalBits / (avgBitrateKbps * 1000);
};

const readAtomSize = (buffer: Buffer, offset: number, end: number): number | null => {
  if (offset < 0 || offset + 8 > end || offset + 8 > buffer.length) return null;
  const size = buffer.readUInt32BE(offset);
  if (!Number.isSafeInteger(size) || size < 8 || size > end - offset) return null;
  return size;
};

const findAtom = (buffer: Buffer, start: number, end: number, target: string): AtomSearchResult => {
  let pos = Math.max(0, start);
  const safeEnd = Math.min(buffer.length, Math.max(0, end));
  while (pos + 8 <= safeEnd) {
    const size = readAtomSize(buffer, pos, safeEnd);
    if (size === null) return { found: false, offset: safeEnd };
    const type = buffer.subarray(pos + 4, pos + 8).toString('ascii');
    if (type === target) return { found: true, offset: pos };
    pos += size;
  }
  return { found: false, offset: pos };
};

const parseMp4Duration = (buffer: Buffer): number | null => {
  const moovResult = findAtom(buffer, 0, buffer.length, 'moov');
  if (!moovResult.found) return null;
  const moovSize = readAtomSize(buffer, moovResult.offset, buffer.length);
  if (moovSize === null) return null;
  const moovStart = moovResult.offset + 8;
  const moovEnd = moovResult.offset + moovSize;
  const mvhdResult = findAtom(buffer, moovStart, moovEnd, 'mvhd');
  if (!mvhdResult.found) return null;
  const mvhdOffset = mvhdResult.offset + 8;
  if (mvhdOffset + 20 > buffer.length) return null;
  const version = buffer[mvhdOffset]!;
  let timescale: number;
  let duration: number;
  if (version === 0) {
    timescale = buffer.readUInt32BE(mvhdOffset + 12);
    duration = buffer.readUInt32BE(mvhdOffset + 16);
  } else {
    if (mvhdOffset + 32 > buffer.length) return null;
    timescale = buffer.readUInt32BE(mvhdOffset + 20);
    duration = Number(buffer.readBigUInt64BE(mvhdOffset + 24));
  }
  if (timescale === 0 || !Number.isFinite(duration)) return null;
  return duration / timescale;
};

const parseWebmDuration = (buffer: Buffer): number | null => {
  const readVint = (pos: number): { value: number; size: number } | null => {
    if (pos >= buffer.length) return null;
    const first = buffer[pos]!;
    let size = 1;
    let mask = 0x80;
    while (size <= 8 && (first & mask) === 0) {
      mask >>= 1;
      size += 1;
    }
    if (size > 8 || pos + size > buffer.length) return null;
    let value = first & (0xff >> size);
    for (let i = 1; i < size; i += 1) value = (value << 8) | buffer[pos + i]!;
    return { value, size };
  };
  const readElementId = (pos: number): { id: number; size: number } | null => {
    if (pos >= buffer.length) return null;
    const first = buffer[pos]!;
    if (first === 0) return null;
    let size = 1;
    let threshold = 0x80;
    while (size <= 8 && (first & threshold) === 0) {
      threshold >>= 1;
      size += 1;
    }
    if (size > 8 || pos + size > buffer.length) return null;
    let id = first;
    for (let i = 1; i < size; i += 1) id = (id << 8) | buffer[pos + i]!;
    return { id, size };
  };
  const findEBML = (
    start: number,
    end: number,
    targetId: number
  ): { found: boolean; dataOffset: number; dataSize: number } => {
    let pos = Math.max(0, start);
    const safeEnd = Math.min(buffer.length, Math.max(0, end));
    while (pos + 2 <= safeEnd) {
      const el = readElementId(pos);
      if (!el) break;
      const sizeResult = readVint(pos + el.size);
      if (!sizeResult) break;
      const dataOffset = pos + el.size + sizeResult.size;
      const dataEnd = dataOffset + sizeResult.value;
      if (!Number.isSafeInteger(dataEnd) || dataEnd > safeEnd) break;
      if (el.id === targetId) return { found: true, dataOffset, dataSize: sizeResult.value };
      pos = dataEnd;
    }
    return { found: false, dataOffset: 0, dataSize: 0 };
  };
  const segment = findEBML(0, buffer.length, 0x18538067);
  if (!segment.found) return null;
  const segmentDataEnd = Math.min(buffer.length, segment.dataOffset + segment.dataSize);
  let timecodeScale = 1000000;
  const tcResult = findEBML(segment.dataOffset, segmentDataEnd, 0x2ad7b1);
  if (
    tcResult.found &&
    tcResult.dataSize <= 8 &&
    tcResult.dataOffset + tcResult.dataSize <= buffer.length
  ) {
    let tc = 0;
    for (let i = 0; i < tcResult.dataSize; i += 1)
      tc = (tc << 8) | buffer[tcResult.dataOffset + i]!;
    if (tc > 0) timecodeScale = tc;
  }
  const durResult = findEBML(segment.dataOffset, segmentDataEnd, 0x4489);
  if (!durResult.found || durResult.dataOffset >= buffer.length) return null;
  let dur = 0;
  const bytesToRead = Math.min(durResult.dataSize, 8, buffer.length - durResult.dataOffset);
  for (let i = 0; i < bytesToRead; i += 1) dur = (dur << 8) | buffer[durResult.dataOffset + i]!;
  return dur / timecodeScale;
};

export const parseAudioDuration = (
  buffer: Buffer,
  contentType: SupportedAudioType
): number | null => {
  if (contentType === 'audio/wav') return parseWavDuration(buffer);
  if (contentType === 'audio/mpeg') return parseMp3Duration(buffer);
  if (contentType === 'audio/mp4') return parseMp4Duration(buffer);
  if (contentType === 'audio/webm') return parseWebmDuration(buffer);
  return null;
};

const uploadToSupabase = async (
  userId: string,
  fileName: string,
  buffer: Buffer,
  contentType: SupportedAudioType
): Promise<string | null> => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const storagePath = `${userId}/${fileName}`;
  const { error } = await client.storage
    .from(AUDIO_BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });
  if (error) throw new ApiError(502, 'audio_storage_failed', 'Audio could not be stored securely.');
  const { data, error: signedError } = await client.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(storagePath, 3600);
  if (signedError || !data?.signedUrl)
    throw new ApiError(502, 'audio_url_failed', 'Audio was stored but its access URL failed.');
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

const userIdFrom = (request: Request): string => {
  const userId = request.auth?.userId;
  if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');
  return userId;
};

export const registerSpeakingRoutes = (
  app: RouteRegistrar,
  requireBackendAuth: RequestHandler,
  speakingLimiter: RequestHandler,
  _aiService: AiService,
  environment: RuntimeEnvironment = process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development'
): void => {
  app.post(
    '/api/speaking/audio-upload',
    requireBackendAuth,
    speakingLimiter,
    express.raw({ type: [...SUPPORTED_AUDIO_TYPES], limit: '15mb' }),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = userIdFrom(request);
        const contentType = normalizeAudioContentType(request);
        if (!contentType)
          throw new ApiError(415, 'unsupported_media_type', 'Unsupported audio content-type.');
        const extension = AUDIO_EXTENSIONS[contentType];
        const buffer = request.body as Buffer;
        if (!Buffer.isBuffer(buffer) || buffer.length === 0)
          throw new ApiError(400, 'empty_audio', 'No audio data received');
        if (buffer.length > MAX_AUDIO_BYTES)
          throw new ApiError(413, 'audio_too_large', `Audio exceeds ${MAX_AUDIO_BYTES} byte limit`);
        if (!hasExpectedAudioSignature(buffer, contentType))
          throw new ApiError(
            415,
            'audio_signature_mismatch',
            'Audio content does not match its declared media type.'
          );
        const durationSeconds = parseAudioDuration(buffer, contentType);
        if (durationSeconds !== null && durationSeconds > MAX_DURATION_SECONDS)
          throw new ApiError(
            413,
            'audio_too_long',
            `Audio duration ${Math.round(durationSeconds)}s exceeds ${MAX_DURATION_SECONDS}s limit.`
          );
        if (!SAFE_STORAGE_SEGMENT.test(userId))
          throw new ApiError(
            400,
            'invalid_authenticated_user',
            'Authenticated user cannot be used as a storage key.'
          );
        const fileName = `${randomUUID()}.${extension}`;
        const stored = await uploadToSupabase(userId, fileName, buffer, contentType);
        if (stored) {
          response
            .status(201)
            .json(
              apiSuccess({
                audioUrl: stored,
                sizeBytes: buffer.length,
                uploadedAt: new Date().toISOString(),
                storage: 'supabase' as const,
              })
            );
          return;
        }
        if (environment === 'production')
          throw new ApiError(
            503,
            'audio_storage_unavailable',
            'Production audio storage is not configured.'
          );
        const directory = path.resolve(UPLOAD_ROOT, userId);
        if (directory !== UPLOAD_ROOT && !directory.startsWith(UPLOAD_ROOT + path.sep))
          throw new ApiError(400, 'invalid_authenticated_user', 'Invalid user identifier.');
        await mkdir(directory, { recursive: true });
        await writeFile(path.join(directory, fileName), buffer);
        response
          .status(201)
          .json(
            apiSuccess({
              audioUrl: `/uploads/speaking/${userId}/${fileName}`,
              sizeBytes: buffer.length,
              uploadedAt: new Date().toISOString(),
              storage: 'local-fallback' as const,
            })
          );
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/speaking/prompts',
    requireBackendAuth,
    (request: Request, response: Response, next: NextFunction) => {
      try {
        userIdFrom(request);
        const { limit, offset } = parsePaginationQuery(request.query as Record<string, unknown>);
        response.json(
          apiSuccess({
            items: SPEAKING_PROMPTS.slice(offset, offset + limit),
            total: SPEAKING_PROMPTS.length,
            limit,
            offset,
          })
        );
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
        const userId = userIdFrom(request);
        const {
          missionId,
          audioUrl = '',
          transcript = '',
        } = request.validatedBody as { missionId?: string; audioUrl?: string; transcript?: string };
        const submission = await getLearningRepository().createSpeakingSubmission({
          userId,
          promptId: missionId ?? 'unknown',
          audioUrl,
          transcript: transcript.trim(),
          pronunciationScore: null,
          fluencyScore: null,
          grammarScore: null,
          vocabularyScore: null,
          overallScore: null,
          feedback: {},
          status: 'not_graded',
          reason: 'speech_assessment_pipeline_not_configured',
        });
        response
          .status(202)
          .json(
            apiSuccess({
              id: submission.id,
              status: submission.status,
              reason: submission.reason,
              submittedAt: submission.submittedAt,
            })
          );
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
        const submissions = await getLearningRepository().listSpeakingSubmissions(
          userIdFrom(request)
        );
        const graded = submissions.filter(
          (submission) => submission.status === 'graded' && submission.overallScore !== null
        );
        const averageScore = graded.length
          ? Math.round(
              graded.reduce((sum, submission) => sum + submission.overallScore!, 0) / graded.length
            )
          : null;
        response.json({
          totalSubmissions: submissions.length,
          gradedSubmissions: graded.length,
          averageScore,
          byCategory: {},
          status: graded.length ? 'configured' : 'not_configured',
        });
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
        const submissionId = routeParam(request, 'id');
        response.json(
          apiSuccess(
            (await getLearningRepository().getSpeakingSubmission(
              userIdFrom(request),
              submissionId
            )) ?? { notFound: true }
          )
        );
      } catch (error) {
        next(error);
      }
    }
  );
};
