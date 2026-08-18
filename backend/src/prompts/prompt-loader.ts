import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { logger } from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cache = new Map<string, string>();

// Tracks where each dynamic prompt key was last resolved from so callers can
// report which version/source actually served a request (prompt versioning).
const resolvedSources = new Map<string, 'file' | 'db'>();

interface PromptVersionManifest {
  [key: string]: { version: string; description?: string };
}

let cachedManifest: PromptVersionManifest | null = null;
const getPromptVersionManifest = (): PromptVersionManifest => {
  if (cachedManifest) return cachedManifest;
  try {
    const raw = readFileSync(join(__dirname, 'prompt-version.json'), 'utf8');
    cachedManifest = JSON.parse(raw) as PromptVersionManifest;
  } catch (err: unknown) {
    logger.warn('[PromptLoader] Failed to read prompt-version.json manifest', {
      error: err instanceof Error ? err.message : String(err),
    });
    cachedManifest = {};
  }
  return cachedManifest;
};

let supabaseClient: ReturnType<typeof createClient> | null = null;
const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
};

const loadPrompt = (filename: string): string => {
  if (cache.has(filename)) return cache.get(filename)!;
  const filePath = join(__dirname, filename);
  const content = readFileSync(filePath, 'utf8').trim();
  cache.set(filename, content);
  return content;
};

const loadPromptFromDb = async (key: string, fallbackFilename: string): Promise<string> => {
  const cacheKey = `db:${key}`;
  if (cache.has(cacheKey)) {
    resolvedSources.set(key, 'db');
    return cache.get(cacheKey)!;
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('ai_prompts')
        .select('content')
        .eq('key', key)
        .single();

      const row = data as { content?: string } | null;
      if (!error && row?.content) {
        const content = row.content.trim();
        cache.set(cacheKey, content);
        resolvedSources.set(key, 'db');
        logger.info(`[PromptLoader] Loaded ${key} instruction from database`);
        return content;
      } else if (error) {
        logger.warn(
          `[PromptLoader] Failed to query dynamic prompt ${key} from database, falling back to local file`,
          {
            error: error.message,
          }
        );
      }
    } catch (err: unknown) {
      logger.warn(
        `[PromptLoader] Database connection error fetching prompt ${key}, falling back to local file`,
        {
          error: err instanceof Error ? err.message : String(err),
        }
      );
    }
  }

  resolvedSources.set(key, 'file');
  return loadPrompt(fallbackFilename);
};

interface PromptResolvedVersion {
  key: string;
  version: string;
  source: 'file' | 'db';
}

/**
 * Returns the version that will be attached to a dynamic prompt key
 * (json-structure / content-generation) plus whether it was resolved from the
 * bundled file or the database. Falls back to the manifest entry with source
 * "file" when the loader has not run yet.
 */
export const getResolvedPromptVersion = (key: string): PromptResolvedVersion | null => {
  const manifest = getPromptVersionManifest();
  const entry = manifest[key];
  if (!entry) return null;
  return {
    key,
    version: entry.version,
    source: resolvedSources.get(key) ?? 'file',
  };
};

export const getJsonStructureInstructionAsync = (): Promise<string> =>
  loadPromptFromDb('json-structure', 'json-structure.md');

export const getContentGenerationInstructionAsync = (): Promise<string> =>
  loadPromptFromDb('content-generation', 'content-structure.md');

interface PracticeContext {
  recentMistakes?: Array<{
    category: string;
    originalText: string;
    correction: string;
  }>;
  weakVocabulary?: string[];
  discipline?: string;
}

export const getCustomPracticePrompt = (context: PracticeContext = {}): string => {
  const mistakes = context.recentMistakes || [];
  const weakVocab = context.weakVocabulary || [];
  const noData = mistakes.length === 0 && weakVocab.length === 0;

  let result = '\n\n=== USER LEARNING MEMORIES (RAG RETRIEVED) ===\n';
  result += '<user_data>\n';
  if (mistakes.length > 0) {
    result +=
      'The user has made the following grammatical/vocabulary mistakes recently. Use these exact mistakes to generate customized practice exercises (e.g. rewrite correction tasks, fill-in-the-blanks, or multiple-choice options targeting these issues):\n';
    mistakes.forEach((m, idx) => {
      result += `- Mistake ${idx + 1} [Category: ${m.category}]: Original text: "${m.originalText}" -> Corrected to: "${m.correction}"\n`;
    });
  }
  if (weakVocab.length > 0) {
    result +=
      'The user also has the following weak vocabulary terms that require reinforcement. Integrate these terms directly into the practice exercises:\n';
    weakVocab.forEach((w) => {
      result += `- ${w}\n`;
    });
  }
  if (noData) {
    result += `The user has no recorded mistakes or weak vocabulary. Provide a general high-yield engineering vocabulary practice lesson based on their discipline: ${context.discipline || 'General Engineering'}.\n`;
  }
  result += '</user_data>\n';
  return result;
};
