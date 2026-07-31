import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { logger } from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cache = new Map<string, string>();

let supabaseClient: any = null;
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

export const getJsonStructureInstructionAsync = async (): Promise<string> => {
  const cacheKey = 'db:json-structure';
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('ai_prompts')
        .select('content')
        .eq('key', 'json-structure')
        .single();

      if (!error && data?.content) {
        const content = data.content.trim();
        cache.set(cacheKey, content);
        logger.info('[PromptLoader] Loaded JSON structure instruction from database');
        return content;
      } else if (error) {
        logger.warn(
          '[PromptLoader] Failed to query dynamic prompt from database, falling back to local file',
          {
            error: error.message,
          }
        );
      }
    } catch (err: any) {
      logger.warn(
        '[PromptLoader] Database connection error fetching prompt, falling back to local file',
        {
          error: err.message,
        }
      );
    }
  }

  return loadPrompt('json-structure.md');
};

export const getJsonStructureInstruction = (): string => loadPrompt('json-structure.md');

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
  return result;
};
