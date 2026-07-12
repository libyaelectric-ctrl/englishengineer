// --- UI State ---

export interface ProfileUIState {
  isSaving: boolean;
  message: string | null;
  error: string | null;
  showClearConfirmation: boolean;
  clearConfirmation: string;
}

type UIAction =
  | { type: 'SET_SAVING'; value: boolean }
  | { type: 'SET_MESSAGE'; value: string | null }
  | { type: 'SET_ERROR'; value: string | null }
  | { type: 'TOGGLE_CLEAR_CONFIRMATION' }
  | { type: 'SET_CLEAR_CONFIRMATION'; value: string };

export const uiReducer = (
  state: ProfileUIState,
  action: UIAction
): ProfileUIState => {
  switch (action.type) {
    case 'SET_SAVING':
      return { ...state, isSaving: action.value };
    case 'SET_MESSAGE':
      return { ...state, message: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    case 'TOGGLE_CLEAR_CONFIRMATION':
      return { ...state, showClearConfirmation: !state.showClearConfirmation };
    case 'SET_CLEAR_CONFIRMATION':
      return { ...state, clearConfirmation: action.value };
    default:
      return state;
  }
};

// --- Edit State ---

export interface ProfileEditState {
  isEditMode: boolean;
  firstName: string;
  lastName: string;
  profession: string;
  track: string;
  subdomain: string;
  industry: string;
  lang: 'en' | 'tr';
  goals: string[];
}

type EditAction =
  | { type: 'SET_EDIT_MODE'; value: boolean }
  | { type: 'SET_FIRST_NAME'; value: string }
  | { type: 'SET_LAST_NAME'; value: string }
  | { type: 'SET_PROFESSION'; value: string }
  | { type: 'SET_TRACK'; value: string }
  | { type: 'SET_SUBDOMAIN'; value: string }
  | { type: 'SET_INDUSTRY'; value: string }
  | { type: 'SET_LANG'; value: 'en' | 'tr' }
  | { type: 'SET_GOALS'; value: string[] }
  | { type: 'RESET_EDIT' };

export const editReducer = (
  state: ProfileEditState,
  action: EditAction
): ProfileEditState => {
  switch (action.type) {
    case 'SET_EDIT_MODE':
      return { ...state, isEditMode: action.value };
    case 'SET_FIRST_NAME':
      return { ...state, firstName: action.value };
    case 'SET_LAST_NAME':
      return { ...state, lastName: action.value };
    case 'SET_PROFESSION':
      return { ...state, profession: action.value };
    case 'SET_TRACK':
      return { ...state, track: action.value };
    case 'SET_SUBDOMAIN':
      return { ...state, subdomain: action.value };
    case 'SET_INDUSTRY':
      return { ...state, industry: action.value };
    case 'SET_LANG':
      return { ...state, lang: action.value };
    case 'SET_GOALS':
      return { ...state, goals: action.value };
    case 'RESET_EDIT':
      return { ...state, isEditMode: false };
    default:
      return state;
  }
};

// --- Prefs State ---

export interface ProfilePrefsState {
  goals: string[];
  minutes: number;
  tasks: number;
  missedDays: number;
  expLevel: string;
  careerGoal: string;
  saved: boolean;
}

type PrefsAction =
  | { type: 'SET_GOALS'; value: string[] }
  | { type: 'SET_MINUTES'; value: number }
  | { type: 'SET_TASKS'; value: number }
  | { type: 'SET_MISSED_DAYS'; value: number }
  | { type: 'SET_EXP_LEVEL'; value: string }
  | { type: 'SET_CAREER_GOAL'; value: string }
  | { type: 'SET_SAVED'; value: boolean }
  | {
      type: 'LOAD_PROFILE';
      goals: string[];
      minutes: number;
      tasks: number;
      missedDays: number;
      expLevel: string;
      careerGoal: string;
    };

export const prefsReducer = (
  state: ProfilePrefsState,
  action: PrefsAction
): ProfilePrefsState => {
  switch (action.type) {
    case 'SET_GOALS':
      return { ...state, goals: action.value };
    case 'SET_MINUTES':
      return { ...state, minutes: action.value };
    case 'SET_TASKS':
      return { ...state, tasks: action.value };
    case 'SET_MISSED_DAYS':
      return { ...state, missedDays: action.value };
    case 'SET_EXP_LEVEL':
      return { ...state, expLevel: action.value };
    case 'SET_CAREER_GOAL':
      return { ...state, careerGoal: action.value };
    case 'SET_SAVED':
      return { ...state, saved: action.value };
    case 'LOAD_PROFILE':
      return {
        ...state,
        goals: action.goals,
        minutes: action.minutes,
        tasks: action.tasks,
        missedDays: action.missedDays,
        expLevel: action.expLevel,
        careerGoal: action.careerGoal,
      };
    default:
      return state;
  }
};
