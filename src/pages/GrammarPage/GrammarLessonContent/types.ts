export type Rule = {
  id: string;
  ruleTitle?: string;
  title: string;
  structure: string;
  engineeringUseCase: string;
  languageFunction: string;
  grammarCategory: string;
  explanation: string;
  definition: string;
  turkishExplanation: string;
  minimumUserOutput: string;
  taskPromptTemplate: string;
  examples: { english: string; turkish: string }[];
  badExampleEnglish: string;
  badExampleTurkishExplanation?: string;
  commonMistakes: string;
  correctedExampleEnglish: string;
  skillUse: string[];
  linkedVocabularyTags: string[];
  cefrLevel: string;
};

export type QuizItem = {
  question: string;
  choices: string[];
  correct: number;
};
