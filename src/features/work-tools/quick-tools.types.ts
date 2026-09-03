export interface MeetingPhrase {
  id: string;
  category: string;
  phrase: string;
  turkishMeaning: string;
  whenToUse: string;
  example: string;
  tone: string;
  tags: string[];
}

export interface SiteDictionaryTerm {
  id: string;
  term: string;
  turkishMeaning: string;
  technicalExplanation: string;
  siteExample: string;
  commonWrongUsage: string;
  relatedTerms: string[];
  category: string;
  tags: string[];
}

export interface QuickAIAction {
  id: string;
  label: string;
  instruction: string;
  systemInstruction: string;
  expectedOutputStyle: string;
  exampleInput: string;
  exampleOutput: string;
}
