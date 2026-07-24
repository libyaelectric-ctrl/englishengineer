import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  AiRequestBodySchema,
  VocabularyLookupQuerySchema,
  BillingCheckoutBodySchema,
  ProgressBodySchema,
  WritingSubmitBodySchema,
  ReadingScoreBodySchema,
} from '../src/validation.js';

describe('Validation Schemas', () => {
  describe('AiRequestBodySchema', () => {
    it('accepts valid AI request', () => {
      const result = AiRequestBodySchema.safeParse({
        prompt: 'Analyze my progress',
        operation: 'analyzeProgress',
      });
      assert.strictEqual(result.success, true);
    });

    it('rejects empty prompt', () => {
      const result = AiRequestBodySchema.safeParse({
        prompt: '',
      });
      assert.strictEqual(result.success, false);
    });

    it('rejects prompt over 20000 chars', () => {
      const result = AiRequestBodySchema.safeParse({
        prompt: 'a'.repeat(20001),
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('VocabularyLookupQuerySchema', () => {
    it('accepts valid word', () => {
      const result = VocabularyLookupQuerySchema.safeParse({
        word: 'engineering',
      });
      assert.strictEqual(result.success, true);
    });

    it('defaults targetLang to tr', () => {
      const result = VocabularyLookupQuerySchema.safeParse({
        word: 'test',
      });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.targetLang, 'tr');
      }
    });

    it('rejects empty word', () => {
      const result = VocabularyLookupQuerySchema.safeParse({
        word: '',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('BillingCheckoutBodySchema', () => {
    it('accepts valid checkout', () => {
      const result = BillingCheckoutBodySchema.safeParse({
        email: 'test@example.com',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });
      assert.strictEqual(result.success, true);
    });

    it('rejects invalid email', () => {
      const result = BillingCheckoutBodySchema.safeParse({
        email: 'not-an-email',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('ProgressBodySchema', () => {
    it('accepts correct result', () => {
      const result = ProgressBodySchema.safeParse({ result: 'correct' });
      assert.strictEqual(result.success, true);
    });

    it('accepts incorrect result', () => {
      const result = ProgressBodySchema.safeParse({ result: 'incorrect' });
      assert.strictEqual(result.success, true);
    });

    it('rejects invalid result', () => {
      const result = ProgressBodySchema.safeParse({ result: 'maybe' });
      assert.strictEqual(result.success, false);
    });
  });

  describe('WritingSubmitBodySchema', () => {
    it('accepts valid submission', () => {
      const result = WritingSubmitBodySchema.safeParse({
        promptId: 'prompt-1',
        content: 'My writing submission',
      });
      assert.strictEqual(result.success, true);
    });

    it('accepts empty optional fields', () => {
      const result = WritingSubmitBodySchema.safeParse({});
      assert.strictEqual(result.success, true);
    });
  });

  describe('ReadingScoreBodySchema', () => {
    it('accepts valid score', () => {
      const result = ReadingScoreBodySchema.safeParse({ score: 85 });
      assert.strictEqual(result.success, true);
    });

    it('accepts boundary values', () => {
      assert.strictEqual(
        ReadingScoreBodySchema.safeParse({ score: 0 }).success,
        true
      );
      assert.strictEqual(
        ReadingScoreBodySchema.safeParse({ score: 100 }).success,
        true
      );
    });

    it('rejects score over 100', () => {
      const result = ReadingScoreBodySchema.safeParse({ score: 101 });
      assert.strictEqual(result.success, false);
    });

    it('rejects negative score', () => {
      const result = ReadingScoreBodySchema.safeParse({ score: -1 });
      assert.strictEqual(result.success, false);
    });
  });
});
