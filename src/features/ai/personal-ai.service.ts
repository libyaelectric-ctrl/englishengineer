import type {
  AICoachContext,
  AIOperation,
  AIRequest,
  AIResponse,
} from '@/shared/types/ai.types';

import { AIService } from './ai.service';
import { AI_BACKEND_PROXY_CONFIG } from './ai.config';
import { MockExample } from './mock-ai.provider';

export interface PersonalLessonContent {
  vocabulary: Array<{
    term: string;
    translation: string;
    definition: string;
    example: string;
    exampleTranslation: string;
    cefrLevel: string;
    domain: string;
  }>;
  reading: {
    title: string;
    titleTranslation: string;
    passage: string;
    passageTranslation: string;
    questions: Array<{ question: string; questionTranslation: string; answer: string }>;
  };
  writing: {
    prompt: string;
    promptTranslation: string;
    modelResponse: string;
    modelResponseTranslation: string;
  };
  speaking: {
    scenario: string;
    scenarioTranslation: string;
    prompts: Array<{ role: string; text: string; textTranslation: string }>;
  };
  listening: {
    script: string;
    scriptTranslation: string;
    questions: Array<{ question: string; questionTranslation: string; answer: string }>;
  };
}

export interface GenerateLessonParams {
  discipline: string;
  targetLanguage: string;
  cefrLevel: string;
  skill?: 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening';
  userName?: string;
}

const parseStructuredContent = (response: AIResponse): PersonalLessonContent | null => {
  const structured = response.structuredResult as Record<string, unknown> | undefined;
  if (!structured || typeof structured !== 'object') return null;
  return structured as unknown as PersonalLessonContent;
};

const buildExamples = (): MockExample[] => [
  {
    input: 'Generate lesson for civil engineering',
    output: 'Mock lesson content for civil engineering',
  },
];

export const PersonalAIService = {
  get isConfigured(): boolean {
    return AI_BACKEND_PROXY_CONFIG.isBackendConfigured;
  },

  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage = 'en'
  ): Promise<string> {
    const prompt = `Translate the following ${sourceLanguage} text into ${targetLanguage}. Preserve technical engineering terms and tone.\n\nTEXT: ${text}\n\nTRANSLATION:`;
    const request: Omit<AIRequest, 'operation'> = {
      modeId: 'translator',
      modeName: 'Translator',
      prompt,
    };
    const examples = buildExamples();
    const response = await AIService.run(examples, 'translate' as AIOperation, request);
    return response.text.trim();
  },

  async generateLesson(params: GenerateLessonParams): Promise<PersonalLessonContent | null> {
    const { discipline, targetLanguage, cefrLevel, skill } = params;
    const prompt = [
      'Generate a complete, personalized engineering English lesson.',
      `Discipline: ${discipline}`,
      `Target language for translations/explanations: ${targetLanguage}`,
      `CEFR level: ${cefrLevel}`,
      skill ? `Focus skill: ${skill}` : 'Include all skills (vocabulary, reading, writing, speaking, listening).',
      'Engineering context: realistic site, project, and office scenarios.',
      'Return ONLY a valid JSON object matching the content structure.',
    ].join('\n');

    const context: AICoachContext = {
      discipline,
      targetLevel: cefrLevel,
      userName: params.userName || 'the learner',
      role: 'engineer',
      xp: 0,
      level: 1,
      elo: 1000,
      streak: 0,
      averageScore: 0,
      completedMissions: 0,
      totalMissions: 0,
      weakSkills: [],
      strongSkills: [],
      recentActivities: [],
      weakVocabulary: [],
      wordsLearned: 0,
      vocabularyRetention: 0,
      recommendedFocus: skill || 'General',
    };

    const request: Omit<AIRequest, 'operation'> = {
      modeId: 'lesson-generator',
      modeName: 'Lesson Generator',
      prompt,
      context,
    };

    const examples = buildExamples();
    const response = await AIService.run(examples, 'generateContent' as AIOperation, request);
    return parseStructuredContent(response);
  },
};
