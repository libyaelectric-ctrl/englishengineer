import { describe, expect, it } from 'vitest';

import { analyzeSingleWord, detectPartOfSpeech, translationService } from './translation.service';

describe('TranslationService & Word Analysis', () => {
  it('detects part of speech accurately for single words', () => {
    expect(detectPartOfSpeech('specification')).toBe('noun');
    expect(detectPartOfSpeech('execute')).toBe('verb');
    expect(detectPartOfSpeech('robust')).toBe('adjective');
    expect(detectPartOfSpeech('quickly')).toBe('adverb');
  });

  it('analyzes single word and retrieves local dictionary alternatives', () => {
    const result = analyzeSingleWord('specification', 'şartname');
    expect(result.isSingleWord).toBe(true);
    expect(result.partOfSpeech).toBe('noun');
    expect(result.alternativeMeanings).toContain('spesifikasyon');
  });

  it('handles empty text translation gracefully', async () => {
    const result = await translationService.translate({
      text: '   ',
      sourceLang: 'auto',
      targetLang: 'tr',
    });
    expect(result.translatedText).toBe('');
    expect(result.serviceUsed).toBe('fallback');
  });

  it('falls back to local dictionary for known technical terms when API fails', async () => {
    const result = await translationService.translate({
      text: 'specification',
      sourceLang: 'en',
      targetLang: 'tr',
    });
    expect(result.translatedText).toBeTruthy();
    expect(result.wordAnalysis?.isSingleWord).toBe(true);
  });
});
