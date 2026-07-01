import { describe, expect, it } from 'vitest';

describe('Listening route module', () => {
  it('imports safely without audio, microphone, TTS, or motion dependencies', async () => {
    const module = await import('./ListeningPage');
    expect(module.default).toBeTypeOf('function');
  });
});
