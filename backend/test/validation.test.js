import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AiRequestBodySchema,
  VocabularyLookupQuerySchema,
  WorkspaceCreateBodySchema,
  WorkspaceMemoryBodySchema,
  WorkspaceDocumentBodySchema,
} from '../src/validation.js';

describe('Zod validation schemas', () => {
  describe('AiRequestBodySchema', () => {
    it('accepts valid prompt', () => {
      const result = AiRequestBodySchema.safeParse({ prompt: 'Hello' });
      assert.equal(result.success, true);
    });

    it('accepts prompt with optional operation', () => {
      const result = AiRequestBodySchema.safeParse({
        prompt: 'Analyze this',
        operation: 'analyzeProgress',
      });
      assert.equal(result.success, true);
    });

    it('rejects empty prompt', () => {
      const result = AiRequestBodySchema.safeParse({ prompt: '' });
      assert.equal(result.success, false);
    });

    it('rejects missing prompt', () => {
      const result = AiRequestBodySchema.safeParse({});
      assert.equal(result.success, false);
    });

    it('rejects prompt exceeding 20000 chars', () => {
      const result = AiRequestBodySchema.safeParse({
        prompt: 'x'.repeat(20001),
      });
      assert.equal(result.success, false);
    });

    it('rejects invalid operation', () => {
      const result = AiRequestBodySchema.safeParse({
        prompt: 'test',
        operation: 'invalidOp',
      });
      assert.equal(result.success, false);
    });

    it('accepts valid metadata', () => {
      const result = AiRequestBodySchema.safeParse({
        prompt: 'test',
        metadata: { requestId: 'req-123', extra: 'data' },
      });
      assert.equal(result.success, true);
    });
  });

  describe('VocabularyLookupQuerySchema', () => {
    it('accepts valid word with default targetLang', () => {
      const result = VocabularyLookupQuerySchema.safeParse({ word: 'hello' });
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.targetLang, 'tr');
      }
    });

    it('accepts valid word with explicit targetLang', () => {
      const result = VocabularyLookupQuerySchema.safeParse({
        word: 'hello',
        targetLang: 'de',
      });
      assert.equal(result.success, true);
    });

    it('rejects empty word', () => {
      const result = VocabularyLookupQuerySchema.safeParse({ word: '' });
      assert.equal(result.success, false);
    });

    it('rejects word exceeding 100 chars', () => {
      const result = VocabularyLookupQuerySchema.safeParse({
        word: 'x'.repeat(101),
      });
      assert.equal(result.success, false);
    });

    it('rejects invalid targetLang format', () => {
      const result = VocabularyLookupQuerySchema.safeParse({
        word: 'hello',
        targetLang: 'invalid-lang-code',
      });
      assert.equal(result.success, false);
    });
  });

  describe('WorkspaceCreateBodySchema', () => {
    it('accepts empty body (all fields optional)', () => {
      const result = WorkspaceCreateBodySchema.safeParse({});
      assert.equal(result.success, true);
    });

    it('accepts valid name and planId', () => {
      const result = WorkspaceCreateBodySchema.safeParse({
        name: 'My Workspace',
        planId: 'pro',
      });
      assert.equal(result.success, true);
    });

    it('rejects name exceeding 200 chars', () => {
      const result = WorkspaceCreateBodySchema.safeParse({
        name: 'x'.repeat(201),
      });
      assert.equal(result.success, false);
    });
  });

  describe('WorkspaceMemoryBodySchema', () => {
    it('accepts valid key and value', () => {
      const result = WorkspaceMemoryBodySchema.safeParse({
        key: 'notes',
        value: { text: 'some notes' },
      });
      assert.equal(result.success, true);
    });

    it('rejects empty key', () => {
      const result = WorkspaceMemoryBodySchema.safeParse({
        key: '',
        value: 'test',
      });
      assert.equal(result.success, false);
    });

    it('rejects missing key', () => {
      const result = WorkspaceMemoryBodySchema.safeParse({ value: 'test' });
      assert.equal(result.success, false);
    });
  });

  describe('WorkspaceDocumentBodySchema', () => {
    it('accepts valid document', () => {
      const result = WorkspaceDocumentBodySchema.safeParse({
        docName: 'report.pdf',
        docContent: 'file content here',
      });
      assert.equal(result.success, true);
    });

    it('accepts document without content', () => {
      const result = WorkspaceDocumentBodySchema.safeParse({
        docName: 'report.pdf',
      });
      assert.equal(result.success, true);
    });

    it('rejects empty docName', () => {
      const result = WorkspaceDocumentBodySchema.safeParse({
        docName: '',
        docContent: 'content',
      });
      assert.equal(result.success, false);
    });

    it('rejects docContent exceeding 1MB', () => {
      const result = WorkspaceDocumentBodySchema.safeParse({
        docName: 'big.txt',
        docContent: 'x'.repeat(1_000_001),
      });
      assert.equal(result.success, false);
    });
  });
});
