import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AiRequestBodySchema,
  VocabularyLookupQuerySchema,
  WorkspaceCreateBodySchema,
  WorkspaceMemoryBodySchema,
  WorkspaceDocumentBodySchema,
} from '../src/validation.js';

describe('AiRequestBodySchema', () => {
  it('accepts a valid prompt', () => {
    const result = AiRequestBodySchema.safeParse({ prompt: 'Hello AI' });
    assert.equal(result.success, true);
    assert.equal(result.data.prompt, 'Hello AI');
  });

  it('trims whitespace from prompt', () => {
    const result = AiRequestBodySchema.safeParse({ prompt: '  Hello AI  ' });
    assert.equal(result.success, true);
    assert.equal(result.data.prompt, 'Hello AI');
  });

  it('rejects empty prompt', () => {
    const result = AiRequestBodySchema.safeParse({ prompt: '' });
    assert.equal(result.success, false);
  });

  it('rejects whitespace-only prompt', () => {
    const result = AiRequestBodySchema.safeParse({ prompt: '   ' });
    assert.equal(result.success, false);
  });

  it('rejects prompt exceeding 20000 characters', () => {
    const result = AiRequestBodySchema.safeParse({
      prompt: 'x'.repeat(20_001),
    });
    assert.equal(result.success, false);
  });

  it('accepts prompt at exactly 20000 characters', () => {
    const result = AiRequestBodySchema.safeParse({
      prompt: 'x'.repeat(20_000),
    });
    assert.equal(result.success, true);
  });

  it('rejects missing prompt', () => {
    const result = AiRequestBodySchema.safeParse({});
    assert.equal(result.success, false);
  });

  it('accepts valid operation', () => {
    const result = AiRequestBodySchema.safeParse({
      prompt: 'Test',
      operation: 'analyzeProgress',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.operation, 'analyzeProgress');
  });

  it('rejects invalid operation', () => {
    const result = AiRequestBodySchema.safeParse({
      prompt: 'Test',
      operation: 'invalidOp',
    });
    assert.equal(result.success, false);
  });

  it('accepts optional metadata', () => {
    const result = AiRequestBodySchema.safeParse({
      prompt: 'Test',
      metadata: { requestId: '123' },
    });
    assert.equal(result.success, true);
    assert.equal(result.data.metadata.requestId, '123');
  });

  it('accepts optional modeId', () => {
    const result = AiRequestBodySchema.safeParse({
      prompt: 'Test',
      modeId: 'writing',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.modeId, 'writing');
  });
});

describe('VocabularyLookupQuerySchema', () => {
  it('accepts a valid word', () => {
    const result = VocabularyLookupQuerySchema.safeParse({ word: 'hello' });
    assert.equal(result.success, true);
    assert.equal(result.data.word, 'hello');
    assert.equal(result.data.targetLang, 'tr');
  });

  it('trims word', () => {
    const result = VocabularyLookupQuerySchema.safeParse({ word: '  Hello  ' });
    assert.equal(result.success, true);
    assert.equal(result.data.word, 'Hello');
  });

  it('accepts custom targetLang', () => {
    const result = VocabularyLookupQuerySchema.safeParse({
      word: 'hello',
      targetLang: 'en',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.targetLang, 'en');
  });

  it('lowercases targetLang', () => {
    const result = VocabularyLookupQuerySchema.safeParse({
      word: 'hello',
      targetLang: 'EN',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.targetLang, 'en');
  });

  it('defaults targetLang to tr', () => {
    const result = VocabularyLookupQuerySchema.safeParse({ word: 'hello' });
    assert.equal(result.success, true);
    assert.equal(result.data.targetLang, 'tr');
  });

  it('rejects missing word', () => {
    const result = VocabularyLookupQuerySchema.safeParse({});
    assert.equal(result.success, false);
  });

  it('rejects empty word', () => {
    const result = VocabularyLookupQuerySchema.safeParse({ word: '' });
    assert.equal(result.success, false);
  });

  it('rejects word exceeding 100 characters', () => {
    const result = VocabularyLookupQuerySchema.safeParse({
      word: 'x'.repeat(101),
    });
    assert.equal(result.success, false);
  });

  it('accepts word at exactly 100 characters', () => {
    const result = VocabularyLookupQuerySchema.safeParse({
      word: 'x'.repeat(100),
    });
    assert.equal(result.success, true);
  });

  it('rejects invalid targetLang format', () => {
    const result = VocabularyLookupQuerySchema.safeParse({
      word: 'hello',
      targetLang: 'toolong',
    });
    assert.equal(result.success, false);
  });

  it('rejects targetLang with numbers', () => {
    const result = VocabularyLookupQuerySchema.safeParse({
      word: 'hello',
      targetLang: 'tr1',
    });
    assert.equal(result.success, false);
  });
});

describe('WorkspaceCreateBodySchema', () => {
  it('accepts empty body', () => {
    const result = WorkspaceCreateBodySchema.safeParse({});
    assert.equal(result.success, true);
  });

  it('accepts valid name', () => {
    const result = WorkspaceCreateBodySchema.safeParse({
      name: 'My Workspace',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.name, 'My Workspace');
  });

  it('accepts valid planId', () => {
    const result = WorkspaceCreateBodySchema.safeParse({
      name: 'Test',
      planId: 'pro',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.planId, 'pro');
  });

  it('rejects name exceeding 200 characters', () => {
    const result = WorkspaceCreateBodySchema.safeParse({
      name: 'x'.repeat(201),
    });
    assert.equal(result.success, false);
  });

  it('trims name', () => {
    const result = WorkspaceCreateBodySchema.safeParse({
      name: '  My Workspace  ',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.name, 'My Workspace');
  });
});

describe('WorkspaceMemoryBodySchema', () => {
  it('accepts valid key and value', () => {
    const result = WorkspaceMemoryBodySchema.safeParse({
      key: 'theme',
      value: 'dark',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.key, 'theme');
    assert.equal(result.data.value, 'dark');
  });

  it('accepts any value type', () => {
    const result = WorkspaceMemoryBodySchema.safeParse({
      key: 'count',
      value: 42,
    });
    assert.equal(result.success, true);
    assert.equal(result.data.value, 42);
  });

  it('accepts object value', () => {
    const result = WorkspaceMemoryBodySchema.safeParse({
      key: 'settings',
      value: { theme: 'dark', lang: 'tr' },
    });
    assert.equal(result.success, true);
  });

  it('rejects missing key', () => {
    const result = WorkspaceMemoryBodySchema.safeParse({ value: 'test' });
    assert.equal(result.success, false);
  });

  it('rejects empty key', () => {
    const result = WorkspaceMemoryBodySchema.safeParse({
      key: '',
      value: 'test',
    });
    assert.equal(result.success, false);
  });

  it('rejects key exceeding 200 characters', () => {
    const result = WorkspaceMemoryBodySchema.safeParse({
      key: 'x'.repeat(201),
      value: 'test',
    });
    assert.equal(result.success, false);
  });

  it('trims key', () => {
    const result = WorkspaceMemoryBodySchema.safeParse({
      key: '  theme  ',
      value: 'dark',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.key, 'theme');
  });
});

describe('WorkspaceDocumentBodySchema', () => {
  it('accepts valid document', () => {
    const result = WorkspaceDocumentBodySchema.safeParse({
      docName: 'readme.md',
      docContent: '# Hello',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.docName, 'readme.md');
    assert.equal(result.data.docContent, '# Hello');
  });

  it('accepts document without content', () => {
    const result = WorkspaceDocumentBodySchema.safeParse({
      docName: 'readme.md',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.docContent, undefined);
  });

  it('rejects missing docName', () => {
    const result = WorkspaceDocumentBodySchema.safeParse({
      docContent: 'content',
    });
    assert.equal(result.success, false);
  });

  it('rejects empty docName', () => {
    const result = WorkspaceDocumentBodySchema.safeParse({
      docName: '',
      docContent: 'content',
    });
    assert.equal(result.success, false);
  });

  it('rejects docName exceeding 500 characters', () => {
    const result = WorkspaceDocumentBodySchema.safeParse({
      docName: 'x'.repeat(501),
    });
    assert.equal(result.success, false);
  });

  it('rejects docContent exceeding 1MB', () => {
    const result = WorkspaceDocumentBodySchema.safeParse({
      docName: 'test',
      docContent: 'x'.repeat(1_000_001),
    });
    assert.equal(result.success, false);
  });

  it('accepts docContent at exactly 1MB', () => {
    const result = WorkspaceDocumentBodySchema.safeParse({
      docName: 'test',
      docContent: 'x'.repeat(1_000_000),
    });
    assert.equal(result.success, true);
  });

  it('trims docName', () => {
    const result = WorkspaceDocumentBodySchema.safeParse({
      docName: '  readme.md  ',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.docName, 'readme.md');
  });
});
