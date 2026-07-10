import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Currency,
  DEFAULT_CURRENCY,
  detectCurrencyFromTimezone,
} from '@/config/currency.config';

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  detectCurrency: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,

      setCurrency: (currency) => set({ currency }),

      detectCurrency: () => {
        const detected = detectCurrencyFromTimezone();
        set({ currency: detected });
      },
    }),
    {
      name: 'currency-preference',
    }
  )
);

export const initializeCurrency = () => {
  const store = useCurrencyStore.getState();
  const stored = localStorage.getItem('currency-preference');
  if (!stored) {
    store.detectCurrency();
  }
};
