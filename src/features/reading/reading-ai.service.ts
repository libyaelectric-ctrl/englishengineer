import { getBackendAuthHeaders } from '@/shared/services/backend-auth.service';

import { AI_BACKEND_PROXY_CONFIG } from '@/features/ai/ai.config';

import type { ReadingMission, ReadingQuestion, VocabularyItem } from './reading.types';

interface GeneratedReadingResponse {
  success?: boolean;
  source?: 'static' | 'ai-generated';
  item?: {
    id: string;
    title: string;
    category: string;
    level: string;
    text: string;
    wordCount: number;
    questions?: Array<{ question: string; questionTranslation?: string; answer: string }>;
  };
}

const resolveBackendBase = (): string | null => {
  const proxy = AI_BACKEND_PROXY_CONFIG.proxyUrl;
  if (!proxy) return null;
  return proxy.replace(/\/api\/ai\/?$/, '');
};

const fallbackQuestion = (title: string): ReadingQuestion => ({
  id: 'ai-q1',
  type: 'short_answer',
  questionText: `What is the main engineering focus of "${title}"?`,
  correctAnswer: 'engineering',
  keywords: ['engineering'],
  explanation: 'Identify the main engineering subject of the passage.',
});

export async function generateReadingMission(params: {
  discipline: string;
  level: string;
  targetLanguage?: string;
}): Promise<ReadingMission | null> {
  const base = resolveBackendBase();
  if (!base) return null;

  try {
    const response = await fetch(`${base}/api/v1/reading/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getBackendAuthHeaders()),
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as GeneratedReadingResponse;
    const item = payload.item;
    if (!item?.title || !item.text) return null;

    const questions: ReadingQuestion[] = (item.questions ?? []).map((question, index) => ({
      id: `ai-q${index + 1}`,
      type: 'short_answer',
      questionText: question.question,
      correctAnswer: question.answer,
      explanation: question.questionTranslation || 'Review the passage for the supporting detail.',
    }));

    return {
      id: item.id,
      title: item.title,
      description: `AI-generated ${item.category} reading at ${item.level}.`,
      discipline: item.category,
      cefrLevel: item.level as ReadingMission['cefrLevel'],
      difficulty: 'Intermediate',
      estimatedMinutes: Math.max(5, Math.round(item.wordCount / 18)),
      passageText: item.text,
      vocabulary: [] as VocabularyItem[],
      questions: questions.length > 0 ? questions : [fallbackQuestion(item.title)],
      xpReward: 50,
      coinReward: 10,
      eloReward: 5,
      sourceMetadata: {
        origin: 'EngVox original',
        author: 'EngineerOS AI',
        schemaVersion: 1,
      },
    };
  } catch {
    return null;
  }
}
