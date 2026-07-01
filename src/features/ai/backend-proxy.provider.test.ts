import { describe, expect, it } from 'vitest';
import {
  isAICoachResult,
  mapHttpError,
  parseBackendResponse,
} from './backend-proxy.provider';

const coachResult = {
  summary: 'Good technical clarity.',
  strengths: ['Clear structure'],
  weaknesses: ['Needs fewer fillers'],
  corrections: ['Use active voice'],
  nativeRewrite: 'The commissioning test is ready.',
  technicalVocabulary: ['commissioning'],
  recommendedNextTask: 'Practice FAT explanation',
  estimatedCefrImpact: 'B2 signal',
  suggestedActions: ['Review terms'],
  focusArea: 'Speaking',
};

describe('backend proxy response parsing', () => {
  it('maps timeout http status to retryable timeout error', () => {
    const error = mapHttpError(408);
    expect(error.message).toContain('timed out');
    expect(error.code).toBe('backend_timeout');
    expect(error.retryable).toBe(true);
  });

  it('maps 429 to rate limit error', () => {
    const error = mapHttpError(429);
    expect(error.code).toBe('backend_rate_limited');
    expect(error.retryable).toBe(true);
  });

  it('accepts a valid AI coach structured result', () => {
    expect(isAICoachResult(coachResult)).toBe(true);
  });

  it('rejects malformed AI coach structured result', () => {
    expect(isAICoachResult({ ...coachResult, suggestedActions: 'retry' })).toBe(
      false
    );
  });

  it('parses v1 text response contract', () => {
    const parsed = parseBackendResponse({
      contractVersion: '2026-06-26.v1',
      requestId: 'req_1',
      operation: 'rewriteText',
      text: 'Rewrite complete.',
    });

    expect(parsed.text).toBe('Rewrite complete.');
    expect(parsed.requestId).toBe('req_1');
  });

  it('throws on non-object backend response', () => {
    expect(() => parseBackendResponse('not-json-object')).toThrow(
      'not a JSON object'
    );
  });

  it('throws on malformed structuredResult', () => {
    expect(() =>
      parseBackendResponse({ structuredResult: { summary: 'missing fields' } })
    ).toThrow('structuredResult');
  });
});
// @vitest-environment node
