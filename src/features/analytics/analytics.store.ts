import { create } from 'zustand';
import { AnalyticsStoreState } from './analytics.types';

export const useAnalyticsStore = create<AnalyticsStoreState>((set) => ({
  activeChart: 'overview',
  setActiveChart: (activeChart) => set({ activeChart }),
}));
