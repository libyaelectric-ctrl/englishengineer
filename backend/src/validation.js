import { z } from 'zod';
import { ApiError } from './errors.js';

// --- AI Schemas ---

const AI_OPERATIONS = [
  'analyzeProgress',
  'evaluateEngineeringEnglish',
  'analyzeText',
  'generatePractice',
];

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
  docName: z
    .string()
    .trim()
    .min(1, 'Document name is required.')
    .max(500),
  docContent: z.string().max(1_000_000).optional(),
});

// --- Middleware Factory ---

const formatZodError = (error) => {
  const issues = error.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }));
  return issues;
};

export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      'validation_error',
      'Invalid request body.',
      formatZodError(result.error)
    );
  }
  req.validatedBody = result.data;
  next();
};

export const validateQuery = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    throw new ApiError(
      400,
      'validation_error',
      'Invalid query parameters.',
      formatZodError(result.error)
    );
  }
  req.validatedQuery = result.data;
  next();
};
