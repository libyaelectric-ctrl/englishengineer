import { z } from 'zod';
import { ApiError } from './errors.js';
import type { Request, Response, NextFunction } from 'express';

// --- AI Schemas ---

const AI_OPERATIONS = [
  'analyzeProgress',
  'evaluateEngineeringEnglish',
  'analyzeText',
  'generatePractice',
] as const;

export const AiRequestBodySchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, 'A non-empty prompt is required.')
    .max(20_000, 'Prompt must be 20,000 characters or fewer.'),
  operation: z.enum(AI_OPERATIONS).optional(),
  modeId: z.string().max(100).optional(),
  metadata: z
    .object({
      requestId: z.string().max(200).optional(),
    })
    .passthrough()
    .optional(),
});

// --- Vocabulary Schema ---

export const VocabularyLookupQuerySchema = z.object({
  word: z
    .string()
    .trim()
    .min(1, 'A vocabulary word is required.')
    .max(100, 'Vocabulary words must be 100 characters or fewer.'),
  targetLang: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z]{2,5}$/, 'targetLang must be a short language code.')
    .default('tr'),
});

// --- Workspace Schemas ---

export const WorkspaceCreateBodySchema = z.object({
  name: z.string().trim().max(200).optional(),
  planId: z.string().max(50).optional(),
});

export const WorkspaceMemoryBodySchema = z.object({
  key: z.string().trim().min(1, 'Memory key is required.').max(200),
  value: z.any(),
});

export const WorkspaceDocumentBodySchema = z.object({
  docName: z.string().trim().min(1, 'Document name is required.').max(500),
  docContent: z.string().max(1_000_000).optional(),
});

// --- Billing Schemas ---

export const BillingCheckoutBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Invalid email format.'),
  successUrl: z
    .string()
    .trim()
    .min(1, 'Success URL is required.')
    .url('Invalid URL.'),
  cancelUrl: z
    .string()
    .trim()
    .min(1, 'Cancel URL is required.')
    .url('Invalid URL.'),
  planId: z.string().max(50).optional(),
});

export const BillingTopupBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Invalid email format.'),
  successUrl: z
    .string()
    .trim()
    .min(1, 'Success URL is required.')
    .url('Invalid URL.'),
  cancelUrl: z
    .string()
    .trim()
    .min(1, 'Cancel URL is required.')
    .url('Invalid URL.'),
});

export const BillingPortalBodySchema = z.object({
  returnUrl: z
    .string()
    .trim()
    .min(1, 'Return URL is required.')
    .url('Invalid URL.'),
});

// --- Admin Schemas ---

export const AdminAuditLogsQuerySchema = z.object({
  userId: z.string().max(200).optional(),
  action: z.string().max(100).optional(),
  since: z.string().max(50).optional(),
  limit: z
    .string()
    .transform((val) => {
      const num = parseInt(val, 10);
      return Number.isFinite(num) && num > 0 ? Math.min(num, 1000) : 100;
    })
    .optional()
    .default(100),
});

// --- Middleware Factory ---

type ZodSchema = z.ZodTypeAny;

// --- Progress Schemas ---

export const ProgressBodySchema = z.object({
  result: z.enum(['correct', 'incorrect'], {
    errorMap: () => ({ message: 'result must be "correct" or "incorrect"' }),
  }),
});

export const ListeningScoreBodySchema = z.object({
  score: z.number().int().min(0).max(100).optional(),
});

export const SpeakingSubmitBodySchema = z.object({
  missionId: z.string().min(1).max(100).optional(),
  audioUrl: z.string().url().optional(),
});

const formatZodError = (error: z.ZodError) => {
  return error.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }));
};

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        'validation_error',
        'Invalid request body.',
        formatZodError(result.error)
      );
    }
    req.validatedBody = result.data as Record<string, unknown>;
    next();
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      throw new ApiError(
        400,
        'validation_error',
        'Invalid query parameters.',
        formatZodError(result.error)
      );
    }
    req.validatedQuery = result.data as Record<string, unknown>;
    next();
  };
};
