import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import ProfilePage from './ProfilePage';

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactNode) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );

const mockState = {
  activeSection: 'overview',
  currentUser: { id: 'user-1', displayName: 'Ali', email: 'ali@test.com' },
  subscription: { planId: 'junior', status: 'none', stripeCustomerId: 'cus_test' },
  providerStatus: { mode: 'backend', isConfigured: true, label: 'Stripe', detail: '' },
  isCheckoutLoading: false,
  handleUpgrade: vi.fn(),
  handleManageSubscription: vi.fn(),
  profile: { professionId: 'software-engineer' },
  memory: { total: 100, mastered: 50, dueToday: 10, weakWords: 5 },
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
    renderWithProviders(<ProfilePage />);

    expect(screen.getAllByText('Ali').length).toBeGreaterThan(0);
  });

  it('shows profession label', () => {
    renderWithProviders(<ProfilePage />);

    expect(screen.getByText(/Engineering Professional/i)).toBeTruthy();
  });

  it('displays profile completion percentage', () => {
    renderWithProviders(<ProfilePage />);

    expect(screen.getByText(/65%/)).toBeTruthy();
  });

  it('renders profile sections', () => {
    renderWithProviders(<ProfilePage />);

    expect(screen.getByText(/Profile Information/i)).toBeTruthy();
    expect(screen.getByText(/Skills & Progress/i)).toBeTruthy();
    expect(screen.getByText(/Achievements/i)).toBeTruthy();
  });

  it('wires both subscription controls to the hook handlers', () => {
    renderWithProviders(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /upgrade plan/i }));
    fireEvent.click(screen.getByRole('button', { name: /manage subscription/i }));

    expect(mockState.handleUpgrade).toHaveBeenCalledTimes(1);
    expect(mockState.handleManageSubscription).toHaveBeenCalledTimes(1);
  });
});
