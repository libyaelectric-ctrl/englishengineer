import { AI_BACKEND_PROXY_CONFIG } from '@/shared/services/ai-proxy.config';
import { createApiClient } from '@/shared/services/apiClient';
import type { ReadingMission, ReadingQuestion, VocabularyItem } from '@/shared/types/reading.types';

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
  const proxy = AI_BACKEND_PROXY_CONFIG.proxyUrl;
  if (!proxy) return null;
  const base = proxy.replace(/\/api\/(?:v1\/)?ai\/?$/, '');

  try {
    const client = createApiClient({ baseUrl: base });
    const payload = await client.post<GeneratedReadingResponse>('/api/v1/reading/generate', params);
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
