import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import ProfilePage from './index';

const queryClient = new QueryClient();

vi.mock('./useProfilePage', () => ({
  useProfilePage: vi.fn(() => ({
    activeSection: 'overview',
    currentUser: { id: 'user-1', displayName: 'Test User' },
    subscription: { planId: 'starter' },
    profile: { professionId: null, skills: {} },
    memory: { weakWords: [], dueToday: 0 },
    learningState: { achievements: [], studySessions: [] },
    mistakeLog: [],
    message: null,
    error: null,
    billingError: null,
    isEditMode: false,
    isSaving: false,
    editFirstName: '',
    editLastName: '',
    editProfession: '',
    editDiscipline: '',
    editSubdomain: '',
    editIndustry: '',
    editLang: '',
    editGoals: '',
    setEditFirstName: vi.fn(),
    setEditLastName: vi.fn(),
    setIsEditMode: vi.fn(),
    prefGoals: '',
    setPrefGoals: vi.fn(),
    prefMinutes: 0,
    setPrefMinutes: vi.fn(),
    prefTasks: '',
    setPrefTasks: vi.fn(),
    prefMissedDays: 0,
    setPrefMissedDays: vi.fn(),
    prefExpLevel: '',
    setPrefExpLevel: vi.fn(),
    prefCareerGoal: '',
    setPrefCareerGoal: vi.fn(),
    preferencesSaved: false,
    showClearConfirmation: false,
    setShowClearConfirmation: vi.fn(),
    clearConfirmation: '',
    setClearConfirmation: vi.fn(),
    providerMode: 'local',
    enterEditMode: vi.fn(),
    handleSaveProfile: vi.fn(),
    handleSavePreferences: vi.fn(),
    exportLocalData: vi.fn(),
    clearLocalData: vi.fn(),
    resetLearningProgress: vi.fn(),
    completionPercent: 0,
  })),
}));

vi.mock('./ProfileOverviewSection', () => ({
  ProfileOverviewSection: () => null,
}));

vi.mock('./SkillsProgressSection', () => ({
  SkillsProgressSection: () => null,
}));

vi.mock('./LearningPreferencesSection', () => ({
  LearningPreferencesSection: () => null,
}));

vi.mock('./SecuritySection', () => ({
  SecuritySection: () => null,
}));

vi.mock('@/features/profile/profile.preferences', () => ({
  PROFESSIONS: [{ id: 'eng', label: 'Engineer' }],
}));

describe('ProfilePage', () => {
  it('renders without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/profile']}>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  });
});
