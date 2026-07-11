import { describe, it, expect } from 'vitest';
import { WritingRealtimeAnalyzer } from './writing-realtime-analyzer';

describe('WritingRealtimeAnalyzer', () => {
  it('returns empty result for empty text', () => {
    const result = WritingRealtimeAnalyzer.analyze('');
    expect(result.suggestions).toHaveLength(0);
    expect(result.wordCount).toBe(0);
    expect(result.readabilityScore).toBe(100);
  });

  it('counts words and sentences correctly', () => {
    const result = WritingRealtimeAnalyzer.analyze('Hello world. This is a test sentence.');
    expect(result.wordCount).toBe(7);
    expect(result.sentenceCount).toBe(2);
  });

  it('detects double spaces', () => {
    const result = WritingRealtimeAnalyzer.analyze('Hello  world');
    const doubleSpace = result.suggestions.find((s) => s.id === 'double-space');
    expect(doubleSpace).toBeDefined();
    expect(doubleSpace?.severity).toBe('error');
  });

  it('detects passive voice', () => {
    const result = WritingRealtimeAnalyzer.analyze('The cable was installed by the team. The system has been configured.');
    expect(result.passiveVoiceCount).toBeGreaterThanOrEqual(2);
  });

  it('detects verbose phrases', () => {
    const result = WritingRealtimeAnalyzer.analyze('We utilize this in order to improve the system.');
    const verbose = result.suggestions.filter((s) => s.type === 'style');
    expect(verbose.length).toBeGreaterThan(0);
  });

  it('detects long sentences', () => {
    const longSentence = 'This is a very long sentence that contains more than thirty five words in total and it should definitely be flagged by the analyzer as being too complex for technical documentation purposes right now today indeed.';
    const result = WritingRealtimeAnalyzer.analyze(longSentence);
    const longSentSuggestion = result.suggestions.find((s) => s.id.startsWith('long-sentence'));
    expect(longSentSuggestion).toBeDefined();
  });

  it('detects missing paragraphs in long text', () => {
    const longText = 'A'.repeat(300);
    const result = WritingRealtimeAnalyzer.analyze(longText);
    const noParagraphs = result.suggestions.find((s) => s.id === 'no-paragraphs');
    expect(noParagraphs).toBeDefined();
  });

  it('calculates readability score', () => {
    const result = WritingRealtimeAnalyzer.analyze('The quick brown fox jumps over the lazy dog.');
    expect(result.readabilityScore).toBeGreaterThan(0);
    expect(result.readabilityScore).toBeLessThanOrEqual(100);
  });

  it('gives clean score for good writing', () => {
    const goodText = `The electrical installation was completed successfully.

All wiring has been tested and certified according to IEC standards.
The system passed all safety inspections.`;
    const result = WritingRealtimeAnalyzer.analyze(goodText);
    expect(result.grammarScore).toBeGreaterThanOrEqual(80);
    expect(result.suggestions.length).toBeLessThanOrEqual(3);
  });

  it('gives lower score for poor writing', () => {
    const poorText = 'the cable was install by the team  we utilize this in order to improve the system actually very good work.';
    const result = WritingRealtimeAnalyzer.analyze(poorText);
    expect(result.grammarScore).toBeLessThan(100);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});
