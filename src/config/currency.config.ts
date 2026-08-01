// DISPLAY ONLY — not used for actual charges.
// Stripe handles real payment currencies natively via StripePrice currency field.
// Exchange rates are approximate, updated manually. Do NOT use for billing calculations.

export type Currency = 'USD' | 'EUR' | 'TRY' | 'GBP';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  /** Approximate rate from USD. Used only for UI display, never for actual charges. */
  exchangeRate: number;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    exchangeRate: 1,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    exchangeRate: 0.92,
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    locale: 'tr-TR',
    exchangeRate: 34.5,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    exchangeRate: 0.79,
  },
};


