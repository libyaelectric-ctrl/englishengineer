export const PROGRESSION_THRESHOLDS = {
  READING: { VOCAB: 50, GRAMMAR: 3 },
  WRITING: { VOCAB: 50, GRAMMAR: 3 },
  LISTENING: { READING: 3, WRITING: 3 },
  SPEAKING: { READING: 3, WRITING: 3 },
};

const BYPASS_STORAGE_KEY = 'engvox_progression_bypass_unlocked';

export const isProgressionBypassed = (): boolean => {
  try {
    return localStorage.getItem(BYPASS_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setProgressionBypassed = (unlocked: boolean = true): void => {
  try {
    localStorage.setItem(BYPASS_STORAGE_KEY, String(unlocked));
    window.dispatchEvent(new Event('engvox_progression_updated'));
  } catch {
    // ignore
  }
};
