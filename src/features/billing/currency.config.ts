export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  region: string;
  rateVsUsd: number;
}

export class CurrencyConfig {
  static readonly CURRENCIES: CurrencyOption[] = [
    {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      flag: '🇺🇸',
      region: 'United States & Global Base',
      rateVsUsd: 1.0,
    },
    {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      flag: '🇪🇺',
      region: 'European Union (Eurocode)',
      rateVsUsd: 0.92,
    },
    {
      code: 'TRY',
      symbol: '₺',
      name: 'Turkish Lira',
      flag: '🇹🇷',
      region: 'Türkiye (Mühendislik & Şantiye)',
      rateVsUsd: 36.5,
    },
    {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      flag: '🇬🇧',
      region: 'United Kingdom (BS Standards)',
      rateVsUsd: 0.78,
    },
    {
      code: 'JPY',
      symbol: '¥',
      name: 'Japanese Yen',
      flag: '🇯🇵',
      region: 'Japan (JIS / Robotics & EPC)',
      rateVsUsd: 155.0,
    },
    {
      code: 'AED',
      symbol: 'د.إ',
      name: 'UAE Dirham',
      flag: '🇦🇪',
      region: 'United Arab Emirates (Dubai / Abu Dhabi Mega Projects)',
      rateVsUsd: 3.67,
    },
    {
      code: 'SAR',
      symbol: '﷼',
      name: 'Saudi Riyal',
      flag: '🇸🇦',
      region: 'Saudi Arabia (NEOM / Giga Projects & FIDIC)',
      rateVsUsd: 3.75,
    },
    {
      code: 'QAR',
      symbol: 'ر.ق',
      name: 'Qatari Riyal',
      flag: '🇶🇦',
      region: 'Qatar (LNG & Infrastructure)',
      rateVsUsd: 3.64,
    },
    {
      code: 'KWD',
      symbol: 'د.ك',
      name: 'Kuwaiti Dinar',
      flag: '🇰🇼',
      region: 'Kuwait (Oil & High-Precision EPC)',
      rateVsUsd: 0.31,
    },
    {
      code: 'BHD',
      symbol: 'BD',
      name: 'Bahraini Dinar',
      flag: '🇧🇭',
      region: 'Bahrain (Offshore Energy & Finance)',
      rateVsUsd: 0.38,
    },
    {
      code: 'RUB',
      symbol: '₽',
      name: 'Russian Ruble',
      flag: '🇷🇺',
      region: 'Russia & CIS (GOST Standards)',
      rateVsUsd: 92.0,
    },
    {
      code: 'CNY',
      symbol: '¥',
      name: 'Chinese Yuan',
      flag: '🇨🇳',
      region: 'China & East Asia (GB Standards)',
      rateVsUsd: 7.25,
    },
    {
      code: 'BRL',
      symbol: 'R$',
      name: 'Brazilian Real',
      flag: '🇧🇷',
      region: 'Brazil & Latin America (ABNT)',
      rateVsUsd: 5.6,
    },
  ];

  static formatPrice(usdAmount: number, currencyCode: string): string {
    const currency = this.CURRENCIES.find((c) => c.code === currencyCode) || this.CURRENCIES[0];
    if (usdAmount === 0) return `${currency.symbol}0`;
    const rawConverted = usdAmount * currency.rateVsUsd;

    if (currency.code === 'KWD' || currency.code === 'BHD') {
      return `${currency.symbol}${rawConverted.toFixed(1)}`;
    }

    const converted = Math.round(rawConverted);

    if (currency.code === 'JPY' || currency.code === 'TRY' || currency.code === 'RUB') {
      return `${currency.symbol}${converted.toLocaleString()}`;
    }
    return `${currency.symbol}${converted}`;
  }
}
