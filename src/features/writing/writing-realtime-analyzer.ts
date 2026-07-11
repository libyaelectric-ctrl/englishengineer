export interface RealtimeSuggestion {
  id: string;
  type: 'grammar' | 'style' | 'vocabulary' | 'structure';
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  fix?: string;
}

export interface RealtimeAnalysisResult {
  suggestions: RealtimeSuggestion[];
  wordCount: number;
  sentenceCount: number;
  readabilityScore: number;
  passiveVoiceCount: number;
  complexWordCount: number;
  grammarScore: number;
  styleScore: number;
}

const PASSIVE_INDICATORS = [
  /\bis\b\s+\w+ed\b/gi,
  /\bwas\b\s+\w+ed\b/gi,
  /\bwere\b\s+\w+ed\b/gi,
  /\bbeen\b\s+\w+ed\b/gi,
  /\bbeing\b\s+\w+ed\b/gi,
  /\bare\b\s+\w+ed\b/gi,
];

const COMMON_MISTAKES: Array<{ pattern: RegExp; message: string; fix: string; type: RealtimeSuggestion['type'] }> = [
  { pattern: /\baffect\b/gi, message: 'Consider "impact" or "influence" in technical writing', fix: 'impact', type: 'style' },
  { pattern: /\butilize\b/gi, message: '"Utilize" is verbose — prefer "use"', fix: 'use', type: 'style' },
  { pattern: /\bin order to\b/gi, message: '"In order to" can be shortened to "to"', fix: 'to', type: 'style' },
  { pattern: /\bactually\b/gi, message: '"Actually" weakens technical statements', fix: '', type: 'style' },
  { pattern: /\bvery\b\s+\w+/gi, message: 'Avoid "very" — use a stronger adjective instead', fix: '', type: 'style' },
  { pattern: /\bmoreover\b/gi, message: '"Moreover" is formal but overused — consider "also" or "further"', fix: 'further', type: 'style' },
  { pattern: /\bregarding\b/gi, message: '"Regarding" is verbose — consider "for" or "about"', fix: 'for', type: 'style' },
  { pattern: /\bdue to the fact that\b/gi, message: '"Due to the fact that" can be simplified to "because"', fix: 'because', type: 'style' },
  { pattern: /\bat this point in time\b/gi, message: '"At this point in time" can be simplified to "now" or "currently"', fix: 'currently', type: 'style' },
  { pattern: /\bfor the purpose of\b/gi, message: '"For the purpose of" can be simplified to "to" or "for"', fix: 'for', type: 'style' },
];

const TECHNICAL_VOCABULARY = new Set([
  'implementation', 'architecture', 'deployment', 'infrastructure',
  'specification', 'documentation', 'configuration', 'optimization',
  'integration', 'diagnostic', 'calibration', 'commissioning',
  'methodology', 'verification', 'validation', 'certification',
  'reliability', 'availability', 'maintainability', 'scalability',
  'throughput', 'latency', 'bandwidth', 'redundancy',
  'compliance', 'audit', 'assessment', 'evaluation',
]);

function countSentences(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  return sentences.length;
}

function calculateReadability(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = countSentences(text);
  if (sentences === 0 || words.length === 0) return 100;

  const avgWordsPerSentence = words.length / sentences;
  const longWords = words.filter((w) => w.length > 12).length;
  const longWordRatio = longWords / words.length;

  let score = 100;
  score -= Math.max(0, (avgWordsPerSentence - 15) * 2);
  score -= Math.max(0, longWordRatio * 30);
  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}

function detectPassiveVoice(text: string): number {
  let count = 0;
  for (const pattern of PASSIVE_INDICATORS) {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  }
  return count;
}

function countComplexWords(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  return words.filter((w) => TECHNICAL_VOCABULARY.has(w.toLowerCase())).length;
}

function checkGrammarPatterns(text: string): RealtimeSuggestion[] {
  const suggestions: RealtimeSuggestion[] = [];

  // Article usage: "a" before vowel sound
  if (/\ba\s+[aeiou]/gi.test(text)) {
    suggestions.push({
      id: 'article-vowel',
      type: 'grammar',
      severity: 'warning',
      message: 'Check article usage: "a" before vowel sounds should be "an"',
    });
  }

  // Double spaces
  if (/\s{2,}/.test(text)) {
    suggestions.push({
      id: 'double-space',
      type: 'grammar',
      severity: 'error',
      message: 'Multiple consecutive spaces detected',
      fix: 'Remove extra spaces',
    });
  }

  // Sentence starting with lowercase
  const sentences = text.split(/[.!?]+\s+/);
  for (let i = 1; i < sentences.length; i++) {
    const trimmed = sentences[i].trim();
    if (trimmed.length > 0 && trimmed[0] === trimmed[0].toLowerCase()) {
      suggestions.push({
        id: `lowercase-sentence-${i}`,
        type: 'grammar',
        severity: 'warning',
        message: `Sentence should start with a capital letter: "${trimmed.substring(0, 30)}..."`,
        line: i + 1,
      });
    }
  }

  return suggestions;
}

function checkStylePatterns(text: string): RealtimeSuggestion[] {
  const suggestions: RealtimeSuggestion[] = [];

  for (const rule of COMMON_MISTAKES) {
    const matches = text.match(rule.pattern);
    if (matches) {
      suggestions.push({
        id: `style-${rule.pattern.source.substring(0, 15)}`,
        type: rule.type,
        severity: 'warning',
        message: rule.message,
        fix: rule.fix || undefined,
      });
    }
  }

  // Sentence length warning
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  for (let i = 0; i < sentences.length; i++) {
    const wordCount = sentences[i].split(/\s+/).filter((w) => w.length > 0).length;
    if (wordCount > 35) {
      suggestions.push({
        id: `long-sentence-${i}`,
        type: 'style',
        severity: 'info',
        message: `Sentence ${i + 1} is long (${wordCount} words). Consider breaking it up.`,
        line: i + 1,
      });
    }
  }

  return suggestions;
}

function checkStructure(text: string): RealtimeSuggestion[] {
  const suggestions: RealtimeSuggestion[] = [];

  // Check for paragraph breaks
  const paragraphs = text.split(/\n\n+/);
  if (paragraphs.length < 2 && text.length > 200) {
    suggestions.push({
      id: 'no-paragraphs',
      type: 'structure',
      severity: 'info',
      message: 'Consider adding paragraph breaks for better readability',
    });
  }

  // Check for bullet points or numbered lists
  if (text.length > 300 && !/^\s*[-*•]\s/m.test(text) && !/^\s*\d+[.)]\s/m.test(text)) {
    suggestions.push({
      id: 'no-lists',
      type: 'structure',
      severity: 'info',
      message: 'Consider using bullet points or numbered lists for technical content',
    });
  }

  return suggestions;
}

export const WritingRealtimeAnalyzer = {
  analyze(text: string): RealtimeAnalysisResult {
    if (!text.trim()) {
      return {
        suggestions: [],
        wordCount: 0,
        sentenceCount: 0,
        readabilityScore: 100,
        passiveVoiceCount: 0,
        complexWordCount: 0,
        grammarScore: 100,
        styleScore: 100,
      };
    }

    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
    const sentenceCount = countSentences(text);
    const readabilityScore = calculateReadability(text);
    const passiveVoiceCount = detectPassiveVoice(text);
    const complexWordCount = countComplexWords(text);

    const grammarSuggestions = checkGrammarPatterns(text);
    const styleSuggestions = checkStylePatterns(text);
    const structureSuggestions = checkStructure(text);

    const allSuggestions = [...grammarSuggestions, ...styleSuggestions, ...structureSuggestions];

    const errors = allSuggestions.filter((s) => s.severity === 'error').length;
    const warnings = allSuggestions.filter((s) => s.severity === 'warning').length;

    const grammarScore = Math.max(0, 100 - errors * 15 - warnings * 5);
    const styleScore = Math.max(0, 100 - styleSuggestions.length * 10);

    return {
      suggestions: allSuggestions,
      wordCount,
      sentenceCount,
      readabilityScore,
      passiveVoiceCount,
      complexWordCount,
      grammarScore,
      styleScore,
    };
  },
};
