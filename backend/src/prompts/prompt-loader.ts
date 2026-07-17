import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cache = new Map<string, string>();

const loadPrompt = (filename: string): string => {
  if (cache.has(filename)) return cache.get(filename)!;
  const filePath = join(__dirname, filename);
  const content = readFileSync(filePath, 'utf8').trim();
  cache.set(filename, content);
  return content;
};

export const getJsonStructureInstruction = (): string =>
  loadPrompt('json-structure.md');

interface PracticeContext {
  recentMistakes?: Array<{
    category: string;
    originalText: string;
    correction: string;
  }>;
  weakVocabulary?: string[];
  discipline?: string;
}

export const getCustomPracticePrompt = (
  context: PracticeContext = {}
): string => {
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
