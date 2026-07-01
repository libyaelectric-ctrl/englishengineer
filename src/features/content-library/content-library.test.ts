import { describe, expect, it } from 'vitest';
import { ProfessionalContentLibrary } from './content-library.service';

describe('professional content library', () => {
  it('contains at least 30 definitions for every requested activity', () => {
    expect(ProfessionalContentLibrary.listening.length).toBeGreaterThanOrEqual(
      30
    );
    expect(ProfessionalContentLibrary.roleplay.length).toBeGreaterThanOrEqual(
      30
    );
    expect(ProfessionalContentLibrary.writing.length).toBeGreaterThanOrEqual(
      30
    );
  });

  it('does not claim verified audio for script-only lessons', () => {
    expect(
      ProfessionalContentLibrary.listening.every(
        (item) => item.status !== 'audio_verified' || Boolean(item.audioUrl)
      )
    ).toBe(true);
  });

  it('supports level-specific engine queries', () => {
    const b1 = ProfessionalContentLibrary.getForLevel('B1');
    expect(b1.listening.every((item) => item.cefrLevel === 'B1')).toBe(true);
    expect(b1.roleplay.every((item) => item.level === 'B1')).toBe(true);
    expect(b1.writing.every((item) => item.level === 'B1')).toBe(true);
  });
});
