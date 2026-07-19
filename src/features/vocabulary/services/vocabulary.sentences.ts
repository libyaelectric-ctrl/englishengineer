export interface SentenceExample {
  word: string;
  sentence: string;
  translation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  context: 'workplace' | 'technical' | 'daily' | 'formal';
}

export interface GenerateSentencesResult {
  word: string;
  sentences: SentenceExample[];
  generatedAt: string;
}

const CONTEXT_TEMPLATES: Record<string, string[]> = {
  workplace: [
    'Can you {word} the report by Friday?',
    'We need to {word} this issue in the next meeting.',
    'The client asked us to {word} the proposal.',
    'Please {word} the documents before the deadline.',
  ],
  technical: [
    'The system will {word} the data automatically.',
    'We need to {word} the configuration before deployment.',
    'The engineer decided to {word} the component.',
    'This process will {word} the output significantly.',
  ],
  daily: [
    'I need to {word} this before lunch.',
    'She decided to {word} the old version.',
    'They will {word} the project next week.',
    'We should {word} our approach.',
  ],
  formal: [
    'The committee has decided to {word} the proposal.',
    'It is recommended to {word} the current strategy.',
    'The board will {word} the matter at the next session.',
    'We respectfully suggest to {word} the timeline.',
  ],
};

export const SentenceGeneratorService = {
  generateForWord(
    word: string,
    partOfSpeech: string,
    meaning: string,
    count = 3
  ): SentenceExample[] {
    const contexts: Array<'workplace' | 'technical' | 'daily' | 'formal'> = [
      'workplace',
      'technical',
      'daily',
      'formal',
    ];

    const sentences: SentenceExample[] = [];
    const usedContexts = new Set<string>();

    for (let i = 0; i < count && i < contexts.length; i++) {
      const context = contexts[i];
      const templates = CONTEXT_TEMPLATES[context];
      const template = templates[i % templates.length];

      const sentence = template.replace(/\{word\}/g, word);
      const translation = this.generateTranslation(
        sentence,
        word,
        meaning,
        context
      );

      if (!usedContexts.has(context)) {
        usedContexts.add(context);
        sentences.push({
          word,
          sentence,
          translation,
          difficulty: this.getDifficulty(partOfSpeech, i),
          context,
        });
      }
    }

    return sentences;
  },

  generateTranslation(
    _sentence: string,
    word: string,
    meaning: string,
    context: string
  ): string {
    const contextTranslations: Record<string, string> = {
      workplace: 'İş ortamında',
      technical: 'Teknik bağlamda',
      daily: 'Günlük konuşma',
      formal: 'Resmi dilde',
    };

    return `${contextTranslations[context] || ''} "${meaning}" anlamında: ${word}`;
  },

  getDifficulty(
    _partOfSpeech: string,
    index: number
  ): 'beginner' | 'intermediate' | 'advanced' {
    if (index === 0) return 'beginner';
    if (index === 1) return 'intermediate';
    return 'advanced';
  },

  generateBatch(
    words: Array<{ word: string; partOfSpeech: string; meaning: string }>,
    sentencesPerWord = 2
  ): GenerateSentencesResult[] {
    return words.map((w) => ({
      word: w.word,
      sentences: this.generateForWord(
        w.word,
        w.partOfSpeech,
        w.meaning,
        sentencesPerWord
      ),
      generatedAt: new Date().toISOString(),
    }));
  },

  formatForDisplay(result: GenerateSentencesResult): string {
    return result.sentences
      .map(
        (s) =>
          `[${s.context}] ${s.sentence}\n  → ${s.translation} (${s.difficulty})`
      )
      .join('\n\n');
  },
};
