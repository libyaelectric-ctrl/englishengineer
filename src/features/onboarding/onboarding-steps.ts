export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'type' | 'scroll';
  required?: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to EngineerOS',
    description: 'Your personal English learning platform for engineers.',
    target: 'body',
    placement: 'bottom',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Track your progress, streaks, and learning statistics here.',
    target: '[data-testid="dashboard"]',
    placement: 'bottom',
    required: true,
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary Builder',
    description: 'Learn engineering-specific vocabulary with spaced repetition.',
    target: 'a[href="/vocabulary"]',
    placement: 'right',
    action: 'click',
  },
  {
    id: 'grammar',
    title: 'Grammar Practice',
    description: 'Master technical grammar rules for professional communication.',
    target: 'a[href="/grammar"]',
    placement: 'right',
    action: 'click',
  },
  {
    id: 'ai-coach',
    title: 'AI Writing Coach',
    description: 'Get personalized feedback on your writing from AI.',
    target: 'a[href="/tools/ai"]',
    placement: 'left',
    action: 'click',
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Set your engineering discipline and learning goals.',
    target: 'a[href="/profile"]',
    placement: 'left',
    action: 'click',
  },
];

export const getOnboardingProgress = (): number => {
  try {
    const raw = localStorage.getItem('onboarding_completed_steps');
    const completed: string[] = raw ? JSON.parse(raw) : [];
    return Math.round((completed.length / ONBOARDING_STEPS.length) * 100);
  } catch {
    return 0;
  }
};

export const markStepComplete = (stepId: string): void => {
  try {
    const raw = localStorage.getItem('onboarding_completed_steps');
    const completed: string[] = raw ? JSON.parse(raw) : [];
    if (!completed.includes(stepId)) {
      completed.push(stepId);
      localStorage.setItem('onboarding_completed_steps', JSON.stringify(completed));
    }
  } catch { /* noop */ }
};

export const isOnboardingComplete = (): boolean => {
  return getOnboardingProgress() >= 100;
};
