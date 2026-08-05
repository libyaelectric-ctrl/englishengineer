import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import ProfilePage from './ProfilePage';

const mockState = {
  activeSection: 'overview',
  currentUser: { id: 'user-1', displayName: 'Ali', email: 'ali@test.com' },
  subscription: { planId: 'junior' },
  profile: { professionId: 'software-engineer' },
  memory: { weakWords: 0, dueToday: 0 },
  learningState: { achievements: [] },
  mistakeLog: [],
  message: null,
  error: null,
  billingError: null,
  isEditMode: false,
  isSaving: false,
  editFirstName: 'Ali',
  editLastName: 'Erensayin',
  editProfession: 'software-engineer',
  editTrack: 'fullstack',
  editSubdomain: '',
  editIndustry: '',
  editLang: 'en',
  editGoals: [],
  setEditFirstName: vi.fn(),
  setEditLastName: vi.fn(),
  setIsEditMode: vi.fn(),
  prefGoals: [],
  setPrefGoals: vi.fn(),
  prefMinutes: 15,
  setPrefMinutes: vi.fn(),
  prefTasks: 3,
  setPrefTasks: vi.fn(),
  prefMissedDays: 0,
  setPrefMissedDays: vi.fn(),
  prefExpLevel: 'intermediate',
  setPrefExpLevel: vi.fn(),
  prefCareerGoal: '',
  setPrefCareerGoal: vi.fn(),
  preferencesSaved: false,
  showClearConfirmation: false,
  setShowClearConfirmation: vi.fn(),
  clearConfirmation: false,
  setClearConfirmation: vi.fn(),
  providerMode: 'local',
  enterEditMode: vi.fn(),
  handleSaveProfile: vi.fn(),
  handleSavePreferences: vi.fn(),
  exportLocalData: vi.fn(),
  clearLocalData: vi.fn(),
  resetLearningProgress: vi.fn(),
  completionPercent: 65,
};

vi.mock('./ProfilePage/useProfilePage', () => ({
  useProfilePage: vi.fn(() => mockState),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders user name in header', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Ali').length).toBeGreaterThan(0);
  });

  it('shows profession label', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Engineering Professional/i)).toBeTruthy();
  });

  it('displays profile completion percentage', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Profile Completion: 65%/)).toBeTruthy();
  });

  it('renders overview description', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Manage your professional profile/)).toBeTruthy();
  });
});
