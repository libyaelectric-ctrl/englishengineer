import { useState, useEffect, useCallback } from 'react';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

const STORAGE_KEY = 'engvox_onboarding_state';

export interface OnboardingState {
  currentStep: number;
  discipline: EngineeringDiscipline | null;
  interfaceLanguage: string;
  branchLockConfirmations: number;
  communicationGoals: string[];
  learningFocus: string[];
  selectedPlan: string;
}

const DEFAULT_STATE: OnboardingState = {
  currentStep: 0,
  discipline: null,
  interfaceLanguage: 'en',
  branchLockConfirmations: 0,
  communicationGoals: [],
  learningFocus: [],
  selectedPlan: 'junior',
};

export const useOnboardingPersistence = () => {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_STATE, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parse errors
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const getProgress = useCallback(() => {
    const steps = ['language', 'branch', 'placement', 'goal', 'package'];
    return {
      currentStep: state.currentStep,
      totalSteps: steps.length,
      stepName: steps[state.currentStep] || 'complete',
      percentComplete: Math.round((state.currentStep / steps.length) * 100),
    };
  }, [state.currentStep]);

  return { state, updateState, resetState, getProgress };
};

export default useOnboardingPersistence;