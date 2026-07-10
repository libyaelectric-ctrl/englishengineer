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

export const DEFAULT_CURRENCY: Currency = 'USD';

const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  TR: 'TRY',
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
};

export const getCurrencyFromCountry = (countryCode?: string): Currency => {
  if (!countryCode) return DEFAULT_CURRENCY;
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY;
};

export const formatPrice = (
  amountInCents: number,
  currency: Currency
): string => {
  const config = CURRENCIES[currency];
  const convertedAmount = (amountInCents / 100) * config.exchangeRate;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: currency === 'TRY' ? 0 : 2,
    maximumFractionDigits: currency === 'TRY' ? 0 : 2,
  }).format(convertedAmount);
};

export const detectCurrencyFromTimezone = (): Currency => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (
    tz.includes('Istanbul') ||
    tz.includes('Ankara') ||
    tz.includes('Izmir')
  ) {
    return 'TRY';
  }
  if (tz.includes('London')) return 'GBP';
  if (
    tz.includes('Berlin') ||
    tz.includes('Paris') ||
    tz.includes('Madrid') ||
    tz.includes('Rome') ||
    tz.includes('Amsterdam')
  ) {
    return 'EUR';
  }
  return 'USD';
};
