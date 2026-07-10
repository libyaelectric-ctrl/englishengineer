import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAIService } from '../src/ai-core/index.js';

describe('AI Core Service', () => {
  it('returns mock response if AI is not configured', async () => {
    const config = { configured: false };
    const service = createAIService(config);
    const result = await service.complete('evaluateEngineeringEnglish', { prompt: 'Hello world' });
    assert.ok(result);
    assert.equal(result.provider, 'mock');
    assert.equal(result.mockMode, true);
    assert.match(result.text, /\[Mock AI\]/);
  });

  it('runs evaluation operation, decorates prompt, and parses valid JSON output', async () => {
    const config = {
      configured: true,
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4o',
      timeoutMs: 5000,
    };

    const mockResponseJson = JSON.stringify({
      summary: 'Excellent English grammar.',
      strengths: ['Great usage of terminology.', 'Good punctuation.'],
      weaknesses: ['Minor spelling mistake in B2.', 'Passive voice excess.'],
      corrections: ['Wrong X -> Correct Y'],
      professionalVersion: 'Cleaned version X',
      simplifiedVersion: 'Short version Y',
      nativeRewrite: 'Native X',
      technicalVocabulary: ['cabling', 'riser'],
      grammarNotes: ['Check prepositions.'],
      toneFeedback: 'Calm and professional.',
      recommendedNextTask: 'Practice active verbs.',
      cefrEstimate: 'B2',
      engineerEloImpactEstimate: '+15 ELO',
    });

    let capturedPrompt = '';
    let capturedJsonMode = false;

    const mockFetch = async (url, options) => {
      const body = JSON.parse(options.body);
      capturedPrompt = body.messages[0].content;
      capturedJsonMode = !!body.response_format;
      
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: mockResponseJson } }],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    const service = createAIService(config, mockFetch);
    const result = await service.complete('evaluateEngineeringEnglish', { prompt: 'Initial prompt text', context: {} });

    assert.ok(result);
    assert.equal(result.provider, 'openai');
    assert.equal(result.mockMode, false);
    
    assert.match(capturedPrompt, /CRITICAL RESPONSE REQUIREMENT/);
    assert.match(capturedPrompt, /Initial prompt text/);
    assert.equal(capturedJsonMode, true);

    assert.ok(result.structuredResult);
    assert.equal(result.structuredResult.summary, 'Excellent English grammar.');
    assert.equal(result.text, 'Cleaned version X');
  });

  it('falls back to raw text if LLM returns malformed JSON', async () => {
    const config = {
      configured: true,
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4o',
      timeoutMs: 5000,
    };

    const rawText = 'This is raw, unstructured feedback from the LLM.';

    const mockFetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: rawText } }],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    const service = createAIService(config, mockFetch);
    const result = await service.complete('evaluateEngineeringEnglish', { prompt: 'Initial prompt text', context: {} });

    assert.ok(result);
    assert.equal(result.structuredResult, null);
    assert.equal(result.text, rawText);
  });

  it('triggers RAG Memory injection when prompt asks for custom practice', async () => {
    const config = {
      configured: true,
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4o',
      timeoutMs: 5000,
    };

    let capturedPrompt = '';
    const mockFetch = async (url, options) => {
      const body = JSON.parse(options.body);
      capturedPrompt = body.messages[0].content;
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Practice questions generated.' } }],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    const service = createAIService(config, mockFetch);
    const requestBody = {
      prompt: 'Sana özel kelimelerle çalışalım lütfen.',
      context: {
        weakVocabulary: ['actuator', 'commissioning'],
        recentMistakes: [
          { originalText: 'we need check B2', correction: 'we need to inspect basement level B2', category: 'grammar' }
        ],
        discipline: 'Electrical Engineering'
      }
    };

    const result = await service.complete('generatePractice', requestBody);

    assert.ok(result);
    assert.equal(result.text, 'Practice questions generated.');
    
    // Check if the prompt has the injected learning memories
    assert.match(capturedPrompt, /USER LEARNING MEMORIES/);
    assert.match(capturedPrompt, /actuator/);
    assert.match(capturedPrompt, /we need check B2/);
  });
});
