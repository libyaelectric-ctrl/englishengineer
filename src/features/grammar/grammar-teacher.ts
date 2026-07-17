import { AIService } from '@/features/ai';
import type { MockExample } from '@/features/ai';
import { GrammarRepository } from './grammar.repository';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TeacherResponse {
  message: string;
  isAiPowered: boolean;
  score?: number;
}

const MOCK_EXAMPLES: MockExample[] = [
  {
    input: 'Start lesson: Active Voice in project status updates',
    output:
      "Hello! Today we are learning about 'Active Voice'. In software engineering, writing status updates in the active voice makes your sentences clear and direct.\n\nTürkçe anlamı: Etken çatı (öznenin işi doğrudan yaptığı cümleler).\nÖrnek:\n- Active: 'I deployed the hotfix.' (Düzeltmeyi ben canlıya aldım.)\n- Passive: 'The hotfix was deployed.' (Düzeltme canlıya alındı.)\n\nActive voice kullanmak sorumluluğu netleştirir. Şimdi sıra sende! 'We completed the API integration.' cümlesini Türkçe'ye çevirir misin?",
  },
];

export const GrammarTeacherService = {
  async chat(
    ruleId: string,
    history: ChatMessage[],
    userMessage: string
  ): Promise<TeacherResponse> {
    const rule = await GrammarRepository.getGrammarRuleById(ruleId);
    if (!rule) {
      return {
        message: 'Lesson not found.',
        isAiPowered: false,
      };
    }

    const systemPrompt = `You are a professional English teacher tutoring a software engineer on the grammar rule: "${rule.title}".
Rule Definition: "${rule.definition}"
Structure: "${rule.structure}"
Turkish Explanation: "${rule.turkishExplanation}"
Engineering Use Case: "${rule.engineeringUseCase}"
Bad Example: "${rule.badExampleEnglish}"
Corrected Example: "${rule.correctedExampleEnglish}"

Your goal is to explain this lesson like a friendly, expert bilingual teacher. Use both Turkish and English for explanations and practice.
Keep responses concise, clear, and highly focused on software engineering contexts.
Always end your message by asking a question, suggesting a translation practice, or asking the user to try writing their own sentence using the rule.

If the user is answering a translation or practice prompt, evaluate their response and tell them if they got it right or wrong.`;

    const chatHistoryText = history
      .map(
        (msg) =>
          `${msg.role === 'user' ? 'Student' : 'Teacher'}: ${msg.content}`
      )
      .join('\n');

    const prompt = `${systemPrompt}\n\nChat History:\n${chatHistoryText}\nStudent: ${userMessage}\nTeacher:`;

    try {
      const response = await AIService.run(MOCK_EXAMPLES, 'rewriteText', {
        modeId: 'writing_reviewer',
        modeName: 'AI Grammar Teacher',
        prompt,
      });

      return {
        message: response.text.trim(),
        isAiPowered: true,
      };
    } catch {
      return {
        message: `Let's practice the rule "${rule.title}".
Formula: ${rule.structure}
Turkish Explanation: ${rule.turkishExplanation}

Practice Sentence: Try translating this sentence to English: "${rule.badExampleEnglish}" using the formula "${rule.structure}".`,
        isAiPowered: false,
      };
    }
  },
};
