import { AIService } from './ai.service';
import type { MockExample } from './mock-ai.provider';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TeacherResponse {
  message: string;
  isAiPowered: boolean;
}

const MOCK_EXAMPLES: MockExample[] = [];

export const AITeacherService = {
  async chat(
    skill: 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening',
    contextInfo: string,
    history: ChatMessage[],
    userMessage: string
  ): Promise<TeacherResponse> {
    let systemPrompt = '';

    if (skill === 'vocabulary') {
      systemPrompt = `You are a professional bilingual English teacher tutoring a software engineer on the technical vocabulary term: ${contextInfo}.
Your goal is to explain this term like a friendly, expert bilingual teacher. Use both Turkish and English for explanations and practice.
Explain the meaning, provide a clear software engineering context, and ask the user to translate a sentence using it, or write their own sentence.
If the user replies with a translation or sentence, evaluate it constructively in Turkish & English.`;
    } else if (skill === 'reading') {
      systemPrompt = `You are a professional bilingual English reading mentor helping a software engineer understand the following technical text:\n"${contextInfo}"\n
Explain complex phrases, technical jargon, or grammar constructions within the text. Use both Turkish and English.
Encourage the user, ask them reading comprehension questions about the text, and evaluate their responses.`;
    } else if (skill === 'writing') {
      systemPrompt = `You are a professional bilingual English writing coach helping a software engineer write their technical draft.
Current Draft Context / Outline: "${contextInfo}"
Guide the user in drafting, editing, and refining their text. Point out style, active voice usage, professional tone, and clarity.
Provide explanations in Turkish & English, suggesting better alternatives, and asking them to revise sections.`;
    } else {
      systemPrompt = `You are a professional bilingual English coach tutoring a software engineer on communication skills: ${skill}.
Context info: "${contextInfo}"
Explain best practices, engineering terminology, and communication rules. Encourage practice and dialogue in Turkish & English.`;
    }

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
        modeName: `AI ${skill.toUpperCase()} Teacher`,
        prompt,
      });

      return {
        message: response.text.trim(),
        isAiPowered: true,
      };
    } catch {
      return {
        message: `Let's practice your ${skill} skills with "${contextInfo}".
Could you write a sentence or outline your thoughts about this topic in English, and I will review it?`,
        isAiPowered: false,
      };
    }
  },
};
export type { ChatMessage as AITeacherChatMessage };
export type { TeacherResponse as AITeacherResponse };
