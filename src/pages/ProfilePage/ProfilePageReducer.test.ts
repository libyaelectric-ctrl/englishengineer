import { describe, it, expect } from 'vitest';
import {
  uiReducer,
  editReducer,
  prefsReducer,
  type ProfileUIState,
  type ProfileEditState,
  type ProfilePrefsState,
} from './ProfilePageReducer';

const initialUi: ProfileUIState = {
  isSaving: false,
  message: null,
  error: null,
  showClearConfirmation: false,
  clearConfirmation: '',
};

const initialEdit: ProfileEditState = {
  isEditMode: false,
  firstName: '',
  lastName: '',
  profession: '',
  track: '',
  subdomain: '',
  industry: '',
  lang: 'en',
  goals: [],
};

const initialPrefs: ProfilePrefsState = {
  goals: [],
  minutes: 15,
  tasks: 2,
  missedDays: 0,
  expLevel: '',
  careerGoal: '',
  saved: false,
};

describe('ProfilePage uiReducer', () => {
  it('SET_SAVING updates isSaving', () => {
    const result = uiReducer(initialUi, { type: 'SET_SAVING', value: true });
    expect(result.isSaving).toBe(true);
  });

  it('SET_MESSAGE updates message', () => {
    const result = uiReducer(initialUi, { type: 'SET_MESSAGE', value: 'Saved!' });
    expect(result.message).toBe('Saved!');
  });

  it('SET_ERROR updates error', () => {
    const result = uiReducer(initialUi, { type: 'SET_ERROR', value: 'Failed' });
    expect(result.error).toBe('Failed');
  });

  it('TOGGLE_CLEAR_CONFIRMATION toggles showClearConfirmation', () => {
    const result = uiReducer(initialUi, { type: 'TOGGLE_CLEAR_CONFIRMATION' });
    expect(result.showClearConfirmation).toBe(true);
    const result2 = uiReducer(result, { type: 'TOGGLE_CLEAR_CONFIRMATION' });
    expect(result2.showClearConfirmation).toBe(false);
  });

  it('SET_CLEAR_CONFIRMATION updates clearConfirmation', () => {
    const result = uiReducer(initialUi, {
      type: 'SET_CLEAR_CONFIRMATION',
      value: 'CONFIRM',
    });
    expect(result.clearConfirmation).toBe('CONFIRM');
  });
});

describe('ProfilePage editReducer', () => {
  it('SET_EDIT_MODE updates isEditMode', () => {
    const result = editReducer(initialEdit, { type: 'SET_EDIT_MODE', value: true });
    expect(result.isEditMode).toBe(true);
  });

  it('SET_FIRST_NAME updates firstName', () => {
    const result = editReducer(initialEdit, { type: 'SET_FIRST_NAME', value: 'John' });
    expect(result.firstName).toBe('John');
  });

  it('SET_LAST_NAME updates lastName', () => {
    const result = editReducer(initialEdit, { type: 'SET_LAST_NAME', value: 'Doe' });
    expect(result.lastName).toBe('Doe');
  });

  it('SET_LANG updates lang', () => {
    const result = editReducer(initialEdit, { type: 'SET_LANG', value: 'tr' });
    expect(result.lang).toBe('tr');
  });

  it('SET_GOALS updates goals', () => {
    const result = editReducer(initialEdit, {
      type: 'SET_GOALS',
      value: ['goal1', 'goal2'],
    });
    expect(result.goals).toEqual(['goal1', 'goal2']);
  });

  it('RESET_EDIT sets isEditMode to false', () => {
    const result = editReducer(
      { ...initialEdit, isEditMode: true },
      { type: 'RESET_EDIT' }
    );
    expect(result.isEditMode).toBe(false);
  });
});

describe('ProfilePage prefsReducer', () => {
  it('SET_GOALS updates goals', () => {
    const result = prefsReducer(initialPrefs, {
      type: 'SET_GOALS',
      value: ['reading', 'writing'],
    });
    expect(result.goals).toEqual(['reading', 'writing']);
  });

  it('SET_MINUTES updates minutes', () => {
    const result = prefsReducer(initialPrefs, { type: 'SET_MINUTES', value: 30 });
    expect(result.minutes).toBe(30);
  });

  it('SET_TASKS updates tasks', () => {
    const result = prefsReducer(initialPrefs, { type: 'SET_TASKS', value: 5 });
    expect(result.tasks).toBe(5);
  });

  it('SET_MISSED_DAYS updates missedDays', () => {
    const result = prefsReducer(initialPrefs, { type: 'SET_MISSED_DAYS', value: 3 });
    expect(result.missedDays).toBe(3);
  });

  it('SET_EXP_LEVEL updates expLevel', () => {
    const result = prefsReducer(initialPrefs, {
      type: 'SET_EXP_LEVEL',
      value: 'senior',
    });
    expect(result.expLevel).toBe('senior');
  });

  it('SET_CAREER_GOAL updates careerGoal', () => {
    const result = prefsReducer(initialPrefs, {
      type: 'SET_CAREER_GOAL',
      value: 'engineer',
    });
    expect(result.careerGoal).toBe('engineer');
  });

  it('SET_SAVED updates saved', () => {
    const result = prefsReducer(initialPrefs, { type: 'SET_SAVED', value: true });
    expect(result.saved).toBe(true);
  });

  it('LOAD_PROFILE loads all fields at once', () => {
    const result = prefsReducer(initialPrefs, {
      type: 'LOAD_PROFILE',
      goals: ['a', 'b'],
      minutes: 20,
      tasks: 3,
      missedDays: 1,
      expLevel: 'mid',
      careerGoal: 'dev',
    });
    expect(result.goals).toEqual(['a', 'b']);
    expect(result.minutes).toBe(20);
    expect(result.tasks).toBe(3);
    expect(result.missedDays).toBe(1);
    expect(result.expLevel).toBe('mid');
    expect(result.careerGoal).toBe('dev');
  });
});
