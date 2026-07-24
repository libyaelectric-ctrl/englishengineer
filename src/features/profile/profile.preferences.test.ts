import { describe, it, expect } from 'vitest';
import {
  LEARNING_GOALS,
  PROFESSIONS,
  COUNTRIES,
  TIMEZONES,
  DAILY_DURATION_OPTIONS,
  DAILY_TASK_COUNT_OPTIONS,
  PROFESSIONAL_TRACKS,
  INDUSTRIES,
  ELECTRICAL_SUBDOMAINS,
} from './profile.preferences';

describe('Profile Preferences', () => {
  describe('LEARNING_GOALS', () => {
    it('has at least 3 goals', () => {
      expect(LEARNING_GOALS.length).toBeGreaterThanOrEqual(3);
    });

    it('each goal has required fields', () => {
      LEARNING_GOALS.forEach((goal) => {
        expect(goal.id).toBeDefined();
        expect(goal.label).toBeDefined();
        expect(goal.preferredDomains).toBeInstanceOf(Array);
      });
    });

    it('has unique ids', () => {
      const ids = LEARNING_GOALS.map((g) => g.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('PROFESSIONS', () => {
    it('has at least 3 professions', () => {
      expect(PROFESSIONS.length).toBeGreaterThanOrEqual(3);
    });

    it('each profession has required fields', () => {
      PROFESSIONS.forEach((p) => {
        expect(p.id).toBeDefined();
        expect(p.label).toBeDefined();
        expect(p.preferredDomains).toBeInstanceOf(Array);
      });
    });
  });

  describe('COUNTRIES', () => {
    it('has at least 5 countries', () => {
      expect(COUNTRIES.length).toBeGreaterThanOrEqual(5);
    });

    it('includes United Kingdom and United States', () => {
      expect(COUNTRIES).toContain('United Kingdom');
      expect(COUNTRIES).toContain('United States');
    });
  });

  describe('TIMEZONES', () => {
    it('has at least 5 timezones', () => {
      expect(TIMEZONES.length).toBeGreaterThanOrEqual(5);
    });

    it('includes UTC', () => {
      expect(TIMEZONES).toContain('UTC');
    });
  });

  describe('DAILY_DURATION_OPTIONS', () => {
    it('has multiple duration options', () => {
      expect(DAILY_DURATION_OPTIONS.length).toBeGreaterThanOrEqual(3);
    });

    it('all options are numbers', () => {
      DAILY_DURATION_OPTIONS.forEach((opt) => {
        expect(typeof opt).toBe('number');
        expect(opt).toBeGreaterThan(0);
      });
    });
  });

  describe('DAILY_TASK_COUNT_OPTIONS', () => {
    it('has multiple task count options', () => {
      expect(DAILY_TASK_COUNT_OPTIONS.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('PROFESSIONAL_TRACKS', () => {
    it('has at least 2 tracks', () => {
      expect(PROFESSIONAL_TRACKS.length).toBeGreaterThanOrEqual(2);
    });

    it('each track has required fields', () => {
      PROFESSIONAL_TRACKS.forEach((track) => {
        expect(track.id).toBeDefined();
        expect(track.label).toBeDefined();
        expect(typeof track.available).toBe('boolean');
      });
    });
  });

  describe('INDUSTRIES', () => {
    it('has at least 3 industries', () => {
      expect(INDUSTRIES.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('ELECTRICAL_SUBDOMAINS', () => {
    it('has at least 2 subdomains', () => {
      expect(ELECTRICAL_SUBDOMAINS.length).toBeGreaterThanOrEqual(2);
    });
  });
});
